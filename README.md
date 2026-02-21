# Freelancer Finance

A financial management tool for freelancers and small business owners. Built as a University of Helsinki Full Stack project (10 credits / 175 hours).

## Features (planned)

- Invoice creation and management (PDF export)
- Expense tracking with receipt image uploads
- Financial dashboard with charts
- Client management
- Tax reporting helpers

## Tech Stack

- **Frontend:** React + TypeScript + Material UI
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL + Sequelize ORM
- **Auth:** JWT
- **Charts:** Recharts
- **PDF:** jsPDF
- **Images:** Cloudinary
- **CI/CD:** GitHub Actions
- **Deploy:** Fly.io / Render

## Getting Started

### Run with Docker (recommended)

```bash
docker compose up --build
```

Open [http://localhost](http://localhost) in your browser.

### Development (local)

```bash
# Start only the database
docker compose up db

# Install dependencies
npm run install:all

# Copy environment variables
cp .env.example server/.env

# Start backend (port 3001) and frontend (port 5173)
npm run dev:server
npm run dev:client
```

### API

- `GET /api/health` — Health check
- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login
- `GET /api/clients` — List clients (auth required)
- `POST /api/clients` — Create client (auth required)
- `PUT /api/clients/:id` — Update client (auth required)
- `DELETE /api/clients/:id` — Delete client (auth required)

## Work Hours

[tuntikirjanpito.md](tuntikirjanpito.md)
