from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Comment, Video, User
from app.schemas.comment_schema import CommentCreate, CommentOut
from app.core.responses import success_response
from app.core.exceptions import NotFoundException
from app.utils.dependencies import get_current_user

router = APIRouter()


@router.post("/{video_id}/comment")
def add_comment(
    video_id: int,
    payload: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise NotFoundException("Video")

    new_comment = Comment(
        video_id=video_id,
        user_id=current_user.id,
        text=payload.text,
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    return success_response(data=CommentOut.model_validate(new_comment), message="Comment added")


@router.get("/{video_id}/comments")
def get_comments(video_id: int, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise NotFoundException("Video")

    comments = db.query(Comment).filter(Comment.video_id == video_id).order_by(Comment.created_at.desc()).all()
    return success_response(data=[CommentOut.model_validate(c) for c in comments], message="Comments fetched")