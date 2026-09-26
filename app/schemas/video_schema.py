from pydantic import BaseModel
from datetime import datetime

class VideoOut(BaseModel):
    id: int
    title: str
    description: str | None
    cloudinary_url: str
    created_at: datetime

    class Config:
        from_attributes = True