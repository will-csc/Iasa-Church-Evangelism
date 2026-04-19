# Painel Pastoral - Iasa Church

**Painel Pastoral** is a church and ministry management project focused on:

- member follow-up
- pastoral visit tracking
- sermon records
- a scalable repository structure for frontend, backend, docs, and database assets

## Overview
<img width="1804" height="814" alt="image" src="https://github.com/user-attachments/assets/192c301c-8971-42aa-a036-892d1be7ca0c" />

## Repository Structure

```text
Church_Evangelism/
|-- frontend/    # React + TypeScript + Vite application
|-- backend/     # Initial API/services structure
|-- docs/        # Functional and technical documentation
|-- database/    # Scripts, schema, migrations, and seeds
`-- README.md
```

## Frontend

The web application is already implemented and lives inside the `frontend/` folder.

### Stack

- React 18
- TypeScript 5
- Vite 5
- Tailwind CSS v3
- Zustand
- TanStack Query
- React Hook Form + Zod
- Framer Motion
- Recharts
- Lucide React
- Sonner

### Run Locally

```bash
cd frontend
npm install
npm run dev
```

### Production Build

```bash
cd frontend
npm run build
```

## Demo Access

- Username: `pastor`
- Password: `123456`

## Project Folders

### `frontend/`

Contains the current web application for Painel Pastoral.

### `backend/`

Reserved for the future API, real authentication, business rules, integrations, and automated tests.

### `docs/`

Reserved for technical documentation, user flows, architecture decisions, and API specifications.

### `database/`

Reserved for schema files, migrations, seeds, and other database-related assets.

## Suggested Next Steps

- implement the API inside `backend/`
- define the database model inside `database/`
- document endpoints and business rules inside `docs/`
- connect the `frontend/` app to a real backend
