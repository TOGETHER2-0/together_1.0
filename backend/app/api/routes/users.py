from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.schemas.user import UserOut, UserProfileUpdate
from app.models.user import User
from app.core.security import get_current_user

router = APIRouter()

@router.get("/me/events")
def my_events(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from sqlalchemy.orm import joinedload
    from app.models.event import Event, JoinRequest, RequestStatus
    from app.schemas.event import EventOut

    hosted = (
        db.query(Event)
        .options(joinedload(Event.host), joinedload(Event.join_requests).joinedload(JoinRequest.user))
        .filter(Event.host_id == current_user.id)
        .all()
    )

    joined_reqs = (
        db.query(JoinRequest)
        .options(joinedload(JoinRequest.event).joinedload(Event.host), joinedload(JoinRequest.event).joinedload(Event.join_requests).joinedload(JoinRequest.user))
        .filter(JoinRequest.user_id == current_user.id, JoinRequest.status == RequestStatus.approved)
        .all()
    )

    hosted_out = []
    for e in hosted:
        approved = len([r for r in e.join_requests if r.status == RequestStatus.approved])
        out = EventOut.model_validate(e)
        out.approved_count = approved
        hosted_out.append(out)

    joined_out = []
    for jr in joined_reqs:
        e = jr.event
        approved = len([r for r in e.join_requests if r.status == RequestStatus.approved])
        out = EventOut.model_validate(e)
        out.approved_count = approved
        joined_out.append(out)

    return {"hosted": hosted_out, "joined": joined_out}

@router.patch("/profile", response_model=UserOut)
def update_profile(
    data: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update current user profile (full_name, bio, avatar_url, country_code)"""
    
    # Build update dict with only provided fields
    update_data = {}
    if data.full_name is not None:
        update_data["full_name"] = data.full_name
    if data.bio is not None:
        update_data["bio"] = data.bio
    if data.avatar_url is not None:
        update_data["avatar_url"] = data.avatar_url
    if data.country_code is not None:
        update_data["country_code"] = data.country_code
    if data.language is not None:
        update_data["language"] = data.language

    if not update_data:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="No fields to update")
    
    # Update user
    for key, value in update_data.items():
        setattr(current_user, key, value)
    
    db.commit()
    db.refresh(current_user)
    
    return UserOut.model_validate(current_user)

@router.get("/profile", response_model=UserOut)
def get_profile(
    current_user: User = Depends(get_current_user)
):
    """Get current user profile"""
    return UserOut.model_validate(current_user)

