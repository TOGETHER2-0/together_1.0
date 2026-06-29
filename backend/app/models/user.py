from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.dialects.mysql import MEDIUMTEXT
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
    # avatar_url holds a base64 data: URL produced by the /avatar endpoint, which
    # far exceeds VARCHAR(500). MEDIUMTEXT (16MB) covers the 2MB upload cap.
    avatar_url = Column(Text().with_variant(MEDIUMTEXT(), "mysql"), nullable=True)
    country_code = Column(String(2), nullable=True)
    language = Column(String(5), nullable=True, default="en")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    hosted_events = relationship("Event", back_populates="host", foreign_keys="Event.host_id")
    join_requests = relationship("JoinRequest", back_populates="user")
    messages = relationship("EventMessage", back_populates="user")
