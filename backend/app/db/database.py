from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings


def _normalize_db_url(url: str) -> str:
    # Managed MySQL providers often hand out a bare "mysql://" URL.
    # SQLAlchemy needs the pymysql driver spelled out explicitly.
    if url.startswith("mysql://"):
        return "mysql+pymysql://" + url[len("mysql://"):]
    return url


engine = create_engine(
    _normalize_db_url(settings.DATABASE_URL),
    pool_pre_ping=True,  # avoid "MySQL server has gone away" on idle cloud DBs
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
