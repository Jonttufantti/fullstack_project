# Freelancer Finance

A financial management tool for freelancers and small business owners. Built as a University of Helsinki Full Stack project (10 credits / 175 hours).

## Features

### Valmis
- JWT-autentikointi (rekisteröinti, kirjautuminen, suojatut reitit)
- Asiakkaiden hallinta (CRUD)
- Laskujen hallinta (CRUD, tila: draft/sent/paid, ALV-laskenta, snapshot-maksuehdot)
- Maksuehdot omana tauluna (järjestelmän oletukset + käyttäjän omat)

### Suunnitteilla
- PDF-vienti laskuille (jsPDF)
- Kulujen seuranta kuittilatauksineen (Cloudinary)
- Taloudellinen dashboard (Recharts)
- Veroraportointityökalut

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
- `GET /api/invoices` — List invoices with client info (auth required)
- `GET /api/invoices/:id` — Get single invoice (auth required)
- `POST /api/invoices` — Create invoice, calculates dueDate and VAT (auth required)
- `PUT /api/invoices/:id` — Update invoice (auth required)
- `DELETE /api/invoices/:id` — Delete invoice (auth required)
- `GET /api/payment-terms` — List system defaults + user's own terms (auth required)
- `POST /api/payment-terms` — Create custom payment term (auth required)
- `DELETE /api/payment-terms/:id` — Delete own payment term (auth required)

## Work Hours

[tuntikirjanpito.md](tuntikirjanpito.md)
