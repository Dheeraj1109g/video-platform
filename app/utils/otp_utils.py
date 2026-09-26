import random
from datetime import datetime, timedelta, timezone

def generate_otp():
    return str(random.randint(100000, 999999))

def otp_expiry(minutes=10):
    return datetime.now(timezone.utc) + timedelta(minutes=minutes)