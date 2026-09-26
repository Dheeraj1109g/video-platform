import logging
from app.routers import auth
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from slowapi.errors import RateLimitExceeded
from app.core.limiter import limiter
from app.core.exceptions import AppException
from app.core.security_headers import SecurityHeadersMiddleware
from app.core.responses import success_response
from app.db.database import Base, engine
from app.db import models
from app.routers import comments
from app.routers import videos

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("app")

Base.metadata.create_all(bind=engine)



app = FastAPI(title="Video Platform API")
app.state.limiter = limiter

app.add_middleware(SecurityHeadersMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://video-platform-frontend.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

app.add_middleware(TrustedHostMiddleware, allowed_hosts=["localhost", "127.0.0.1", "*.onrender.com"])

@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(status_code=exc.status_code,
        content={"success": False, "error_code": exc.error_code, "message": exc.message})

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(status_code=422,
        content={"success": False, "error_code": "VALIDATION_ERROR", "message": "Invalid input", "details": exc.errors()})

@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(status_code=429,
        content={"success": False, "error_code": "RATE_LIMITED", "message": "Too many requests, slow down"})

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(status_code=500,
        content={"success": False, "error_code": "SERVER_ERROR", "message": "Something went wrong"})

@app.get("/ping")
def ping():
    return success_response(data={"status": "alive"}, message="pong")

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(comments.router, prefix="/videos", tags=["Comments"])
app.include_router(videos.router, prefix="/videos", tags=["Videos"])