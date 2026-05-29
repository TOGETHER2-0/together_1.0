# Together

A social events app for Jönköping University students.  
Built with Next.js 14 · FastAPI · MySQL.

---

## Stack

| Layer    | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend  | FastAPI, Python 3.11+, SQLAlchemy 2.0 |
| Database | MySQL 8+ |
| Auth     | JWT (7-day tokens), bcrypt |
| Map      | Leaflet + CARTO dark tiles |
| State    | Zustand (persisted in localStorage) |

---

## Prerequisites

- Node.js 18+
- Python 3.11+
- MySQL 8+

---

## 1. Database Setup

```bash
mysql -u root -p < database/schema.sql
```

This creates the `together_db` database with all tables.

---

## 2. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env — set your MySQL credentials and a secure SECRET_KEY

# Run
uvicorn app.main:app --reload --port 8000
```

Backend runs at: **http://localhost:8000**  
API docs at: **http://localhost:8000/docs**

### Backend `.env`

```env
DATABASE_URL=mysql+pymysql://root:yourpassword@localhost/together_db
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_DAYS=7
```

---

## 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Run
npm run dev
```

Frontend runs at: **http://localhost:3000**

### Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Ports

| Service  | Port |
|---|---|
| Frontend | 3000 |
| Backend  | 8000 |
| MySQL    | 3306 |

---

## Faculty Colors

| Faculty | Color |
|---|---|
| JIBS | Green `#4ADE80` |
| JTH | Yellow `#FACC15` |
| Hälso | Pearl White `#E2E8F0` |
| School of Communication | Blue `#60A5FA` |
| School of Education | Red `#F87171` |

Faculty is selected at registration and drives avatar color, event card accents, and map markers.

---

## Key Features

- **Auth** — register/login with `@student.ju.se` email only
- **Events** — create, browse, join events with approval flow
- **Map** — Leaflet map with faculty-colored markers, real Jönköping coordinates
- **Profile** — hosted/joined event history
- **Mobile-first** — optimized for iPhone viewport (max-width 430px)

---

## Project Structure

```
together/
├── frontend/
│   ├── app/               # Next.js App Router pages
│   ├── components/        # Reusable components
│   └── lib/               # API client, store, types, faculties, locations
├── backend/
│   └── app/
│       ├── api/routes/    # auth, events, users
│       ├── core/          # config, security (JWT/bcrypt)
│       ├── db/            # SQLAlchemy engine
│       ├── models/        # User, Event, JoinRequest
│       └── schemas/       # Pydantic schemas
└── database/
    └── schema.sql
```
# TOGETHER-1.0
# TOGETHER-1.0
