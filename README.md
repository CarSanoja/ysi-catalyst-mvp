# YSI Catalyst Platform

Platform for Youth & Social Innovation Initiative to manage sessions, insights, and collaboration.

## Architecture

- **Frontend**: React application (ysi-admin-frontend)
- **Backend**: FastAPI Python application (ysi-backend) 
- **Database**: PostgreSQL
- **Cache**: Redis
- **Container**: Docker & Docker Compose

## Quick Start

1. Clone the repository and navigate to the project directory

2. Copy environment variables:
```bash
cp .env.example .env
cp ysi-backend/.env.example ysi-backend/.env
```

3. Start all services with Docker Compose:
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Redis cache on port 6379
- Backend API on http://localhost:8000
- Frontend application on http://localhost:3000
- PgAdmin on http://localhost:5050

## Development

### Backend Development

```bash
cd ysi-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Development

```bash
cd ysi-admin-frontend
npm install
npm start
```

### Database Migrations

```bash
cd ysi-backend
alembic revision --autogenerate -m "Description of changes"
alembic upgrade head
```

## API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Services Endpoints

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- PgAdmin: http://localhost:5050
  - Default email: admin@ysi.org
  - Default password: admin

## Project Structure

```
YSI/
├── docker-compose.yml
├── .env.example
├── ysi-backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   └── main.py
│   ├── alembic/
│   ├── requirements.txt
│   └── Dockerfile
└── ysi-admin-frontend/
    ├── src/
    ├── public/
    ├── package.json
    └── Dockerfile
```