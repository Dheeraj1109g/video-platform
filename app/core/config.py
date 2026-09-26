from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    CLOUDINARY_URL: str
    GMAIL_USER: str
    GMAIL_APP_PASSWORD: str
    JWT_SECRET: str

    class Config:
        env_file = ".env"

settings = Settings()