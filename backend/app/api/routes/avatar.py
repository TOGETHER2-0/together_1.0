from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
import base64
import io
from PIL import Image
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserOut
from app.core.security import get_current_user

router = APIRouter()

@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload avatar file and return base64 data URL"""
    
    # Limita a 2MB
    contents = await file.read()
    if len(contents) > 2 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (max 2MB)")
    
    # Valida che sia un'immagine
    try:
        img = Image.open(io.BytesIO(contents))
        img.verify()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")
    
    # Converti a base64
    base64_data = base64.b64encode(contents).decode('utf-8')
    mime_type = file.content_type or 'image/jpeg'
    data_url = f"data:{mime_type};base64,{base64_data}"
    
    return {"url": data_url}
