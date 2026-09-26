from pydantic import BaseModel
from datetime import datetime

class CommentCreate(BaseModel):
    text: str

class CommentOut(BaseModel):
    id: int
    text: str
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True