from fastapi import APIRouter, Depends, UploadFile, File, Form, Request
from sqlalchemy.orm import Session
import cloudinary.uploader

from app.db.database import get_db
from app.db.models import Video, User
from app.schemas.video_schema import VideoOut
from app.core.responses import success_response
from app.core.exceptions import FileValidationException, NotFoundException
from app.utils.dependencies import get_current_user
from app.core import cloudinary_config 
  # noqa: F401 -- runs cloudinary.config() on import # noqa: F401 -- runs cloudinary.config() on import

router = APIRouter()

ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/x-matroska", "video/webm"]
MAX_FILE_SIZE_MB = 100


@router.post("/upload")
def upload_video(
    request: Request,
    title: str = Form(...),
    description: str = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if file.content_type not in ALLOWED_VIDEO_TYPES:
        raise FileValidationException("Only video files (mp4, mov, mkv, webm) are allowed")

    file.file.seek(0, 2)
    size_mb = file.file.tell() / (1024 * 1024)
    file.file.seek(0)
    if size_mb > MAX_FILE_SIZE_MB:
        raise FileValidationException(f"File too large. Max {MAX_FILE_SIZE_MB}MB allowed")

    upload_result = cloudinary.uploader.upload_large(
        file.file,
        resource_type="video",
        folder="video_platform",
    )

    new_video = Video(
        user_id=current_user.id,
        title=title,
        description=description,
        cloudinary_url=upload_result["secure_url"],
        cloudinary_public_id=upload_result["public_id"],
    )
    db.add(new_video)
    db.commit()
    db.refresh(new_video)

    return success_response(data=VideoOut.model_validate(new_video), message="Video uploaded successfully")


@router.get("")
def list_videos(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    videos = db.query(Video).order_by(Video.created_at.desc()).offset(skip).limit(limit).all()
    return success_response(data=[VideoOut.model_validate(v) for v in videos], message="Videos fetched")


@router.get("/{video_id}")
def get_video(video_id: int, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise NotFoundException("Video")
    return success_response(data=VideoOut.model_validate(video), message="Video fetched")