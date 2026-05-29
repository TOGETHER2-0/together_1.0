from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    faculty = Column(String(50), nullable=True)
    avatar_color = Column(String(7), default="#6366f1")
    bio = Column(Text, nullable=True)
    avatar_url = Column(String(500), nullable=True)
    country_code = Column(String(2), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    hosted_events = relationship("Event", back_populates="host", foreign_keys="Event.host_id")
    join_requests = relationship("JoinRequest", back_populates="user")
    messages = relationship("EventMessage", back_populates="user")
