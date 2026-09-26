import cloudinary
from urllib.parse import urlparse
from app.core.config import settings

parsed = urlparse(settings.CLOUDINARY_URL)

cloudinary.config(
    cloud_name=parsed.hostname,
    api_key=parsed.username,
    api_secret=parsed.password,
    secure=True,
)

print("CLOUDINARY CONFIG LOADED:", cloudinary.config().cloud_name, cloudinary.config().api_key)