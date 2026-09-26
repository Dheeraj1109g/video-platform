from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.db.database import get_db
from app.db.models import User, OTP
from app.schemas.user_schema import SignupRequest, OTPVerifyRequest, LoginRequest, ResendOTPRequest
from app.core.responses import success_response
from app.core.exceptions import (
    UserAlreadyExistsException,
    InvalidOTPException,
    UserNotVerifiedException,
    InvalidCredentialsException,
    NotFoundException,
)
from app.utils.otp_utils import generate_otp, otp_expiry
from app.utils.email_utils import send_otp_email
from app.utils.password_utils import hash_password, verify_password
from app.utils.jwt_utils import create_access_token
from app.core.limiter import limiter

router = APIRouter()


@router.post("/signup")
@limiter.limit("3/minute")
def signup(request: Request, payload: SignupRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(
        (User.email == payload.email) | (User.username == payload.username)
    ).first()
    if existing:
        if existing.is_verified:
            raise UserAlreadyExistsException()
        # Allow updating credentials and resending OTP if previously unverified
        existing.email = payload.email
        existing.username = payload.username
        existing.hashed_password = hash_password(payload.password)
        db.commit()
    else:
        new_user = User(
            email=payload.email,
            username=payload.username,
            hashed_password=hash_password(payload.password),
            is_verified=False,
        )
        db.add(new_user)
        db.commit()

    otp_code = generate_otp()
    otp_entry = OTP(
        email=payload.email,
        otp_code=otp_code,
        purpose="signup",
        expires_at=otp_expiry(),
    )
    db.add(otp_entry)
    db.commit()

    send_otp_email(payload.email, otp_code)

    return success_response(message="OTP sent to your email. Please verify to complete signup.")


@router.post("/verify-otp")
@limiter.limit("5/minute")
def verify_otp(request: Request, payload: OTPVerifyRequest, db: Session = Depends(get_db)):
    otp_entry = db.query(OTP).filter(
        OTP.email == payload.email, OTP.purpose == "signup"
    ).order_by(OTP.created_at.desc()).first()

    if not otp_entry:
        raise InvalidOTPException()

    if otp_entry.attempts >= 5:
        raise InvalidOTPException()

    expires_at = (
        otp_entry.expires_at
        if otp_entry.expires_at.tzinfo is not None
        else otp_entry.expires_at.replace(tzinfo=timezone.utc)
    )

    if datetime.now(timezone.utc) > expires_at:
        raise InvalidOTPException()

    if otp_entry.otp_code != payload.otp_code:
        otp_entry.attempts += 1
        db.commit()
        raise InvalidOTPException()

    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise NotFoundException("User")
    user.is_verified = True
    db.commit()

    db.delete(otp_entry)
    db.commit()

    return success_response(message="Account verified successfully. You can now log in.")


@router.post("/login")
@limiter.limit("10/minute")
def login(request: Request, payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise InvalidCredentialsException()

    if not user.is_verified:
        raise UserNotVerifiedException()

    token = create_access_token(data={"user_id": user.id})

    return success_response(
        data={"access_token": token, "token_type": "bearer"},
        message="Login successful",
    )


@router.post("/resend-otp")
@limiter.limit("2/minute")
def resend_otp(request: Request, payload: ResendOTPRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise InvalidCredentialsException()

    otp_code = generate_otp()
    otp_entry = OTP(
        email=payload.email,
        otp_code=otp_code,
        purpose="signup",
        expires_at=otp_expiry(),
    )
    db.add(otp_entry)
    db.commit()

    send_otp_email(payload.email, otp_code)

    return success_response(message="New OTP sent to your email.")

