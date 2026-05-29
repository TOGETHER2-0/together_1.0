from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime

VALID_FACULTIES = {
    "JIBS",
    "JTH",
    "Hälso",
    "School of Communication",
    "School of Education",
}

AVATAR_COLORS = {
    "JIBS":                    "#4ADE80",
    "JTH":                     "#FACC15",
    "Hälso":                   "#E2E8F0",
    "School of Communication": "#60A5FA",
    "School of Education":     "#F87171",
}


class UserCreate(BaseModel):
    email: str
    full_name: str
    password: str
    faculty: str

    @field_validator("email")
    @classmethod
    def must_be_student_email(cls, v: str) -> str:
        v = v.lower().strip()
        if not v.endswith("@student.ju.se"):
            raise ValueError("Must use a @student.ju.se email address")
        return v

    @field_validator("faculty")
    @classmethod
    def must_be_valid_faculty(cls, v: str) -> str:
        if v not in VALID_FACULTIES:
            raise ValueError(
                f"Faculty must be one of: {', '.join(sorted(VALID_FACULTIES))}"
            )
        return v


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    avatar_color: str
    faculty: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    country_code: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class LoginRequest(BaseModel):
    email: str
    password: str


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    country_code: Optional[str] = None

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and (not isinstance(v, str) or len(v.strip()) < 1):
            raise ValueError("full_name must be a non-empty string")
        return v.strip() if v else None

    @field_validator("bio")
    @classmethod
    def validate_bio(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and len(v) > 300:
            raise ValueError("bio max 300 characters")
        return v

    @field_validator("avatar_url")
    @classmethod
    def validate_avatar_url(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v != "" and not (v.startswith("http://") or v.startswith("https://")):
            raise ValueError("avatar_url must be a valid HTTP(S) URL or empty string")
        return v

    @field_validator("country_code")
    @classmethod
    def validate_country_code(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v != "" and not (len(v) == 2 and v.isupper() and v.isalpha()):
            raise ValueError("country_code must be ISO 3166-1 alpha-2 (e.g., IT, US)")
        return v if v else None
