from pydantic import BaseModel, EmailStr

class SignupRequest(BaseModel):
    email: EmailStr
    username: str
    password: str

class OTPVerifyRequest(BaseModel):
    email: EmailStr
    otp_code: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ResendOTPRequest(BaseModel):
    email: EmailStr