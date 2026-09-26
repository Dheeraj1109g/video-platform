import smtplib
from email.mime.text import MIMEText
from app.core.config import settings

def send_otp_email(to_email: str, otp_code: str):
    msg = MIMEText(f"Your OTP is {otp_code}. It expires in 10 minutes.")
    msg["Subject"] = "Your OTP Code"
    msg["From"] = settings.GMAIL_USER
    msg["To"] = to_email

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(settings.GMAIL_USER, settings.GMAIL_APP_PASSWORD)
        server.sendmail(settings.GMAIL_USER, to_email, msg.as_string())