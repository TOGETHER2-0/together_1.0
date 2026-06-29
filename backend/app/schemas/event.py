from pydantic import BaseModel, field_validator
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
    max_participants: Optional[int] = None
    accommodation: Optional[str] = None
    floor: Optional[int] = None
    category: Optional[str] = None

    @field_validator("max_participants", mode="before")
    @classmethod
    def empty_capacity_is_unlimited(cls, value):
        if value == "":
            return None
        return value

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
    max_participants: Optional[int]
    accommodation: Optional[str]
    floor: Optional[int]
    category: Optional[str]
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
    category: Optional[str] = None

    @field_validator("max_participants", mode="before")
    @classmethod
    def empty_capacity_is_unlimited(cls, value):
        if value == "":
            return None
        return value

class EventMessageOut(BaseModel):
    id: int
    user: UserOut
    text: str
    created_at: datetime

    class Config:
        from_attributes = True

class EventMessageCreate(BaseModel):
    text: str
