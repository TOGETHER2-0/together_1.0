from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth, events, users, avatar
from app.db.database import engine, Base

# Prova a creare le tabelle, ma non fallire se il DB non è disponibile
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"⚠️  Avviso: Impossibile connettersi al database: {e}")
    print("Il server funzionerà comunque, ma gli endpoint del database falliranno fino al ripristino della connessione")

app = FastAPI(title="Together - Jönköping University", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(events.router, prefix="/api/events", tags=["events"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(avatar.router, prefix="/api/users", tags=["users"])

@app.get("/")
def root():
    return {"message": "Together API running"}
