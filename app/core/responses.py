from typing import Any, Optional
from pydantic import BaseModel

class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None

def success_response(data: Any = None, message: str = "Success"):
    return APIResponse(success=True, message=message, data=data)