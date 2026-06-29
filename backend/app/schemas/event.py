from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.schemas.user import UserOut
from app.models.event import RequestStatus

class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    event_datetime: datetime
    location_text: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    max_participants: int = 10
    accommodation: Optional[str] = None
    floor: Optional[int] = None

class JoinRequestOut(BaseModel):
    id: int
    user: UserOut
    status: RequestStatus
    created_at: datetime

    class Config:
        from_attributes = True

class EventOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    event_datetime: datetime
    location_text: str
    latitude: Optional[float]
    longitude: Optional[float]
    max_participants: int
    accommodation: Optional[str]
    floor: Optional[int]
    host: UserOut
    created_at: datetime
    approved_count: int = 0
    join_requests: List[JoinRequestOut] = []

    class Config:
        from_attributes = True

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_datetime: Optional[datetime] = None
    location_text: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    max_participants: Optional[int] = None
    accommodation: Optional[str] = None
    floor: Optional[int] = None

class EventMessageOut(BaseModel):
    id: int
    user: UserOut
    text: str
    created_at: datetime

    class Config:
        from_attributes = True

class EventMessageCreate(BaseModel):
    text: str
