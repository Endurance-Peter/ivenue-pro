# iVenue Pro

## Development

### Backend

Install dependencies with UV:

```bash
cd backend
uv sync
```

Run the API with Uvicorn:

```bash
cd backend
uv run uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Or with Docker Compose:

```bash
docker compose up --build
```

### Database Migrations

See [backend/migrations/README](backend/migrations/README) for the complete Alembic workflow, including creating, applying, inspecting, and undoing migrations.

### Seed a Super Admin

Copy the values from [backend/.env.admin.example](backend/.env.admin.example), replace them with your own details, and run:

```powershell
cd backend
uv run alembic upgrade head
uv run python scripts/seed_admin.py
```

The migration command must run first. The seed script does not create tables or modify migrations; it only creates or updates the explicitly supplied `admin` or `super_admin` account.

The seeded account signs in through the same phone OTP endpoints as customers and hosts. Its database role determines its admin permissions:

```text
super_admin: all platform permissions
admin: operational permissions, no admin-management permissions
```

### Mobile API Testing

Copy [mobile/.env.example](mobile/.env.example) to `mobile/.env` and choose the API URL for your target:

```powershell
cd mobile
Copy-Item .env.example .env
npm start
```

Use `http://10.0.2.2:8000` for an Android emulator, your computer's LAN IP for a physical device, or `http://127.0.0.1:8000` for web.

