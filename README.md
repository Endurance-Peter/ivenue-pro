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

### Attach Existing Supabase Images

Images must be stored in the same Supabase project configured in the backend. Place them under an existing venue ID:

```text
venue-images/<venue_id>/cover.jpg
venue-images/<venue_id>/second-image.jpg
```

Then run:

```powershell
cd backend
uv run python scripts/sync_supabase_images.py
```

The script creates missing `VenueImage` records for existing venues. The customer landing page then receives the public Supabase URLs from `GET /api/v1/venues`.

### Full-Stack Debugging

Install the recommended VS Code extensions when prompted. Open **Run and Debug** and select:

```text
iVenue: Mobile + Backend
```

This starts FastAPI under `debugpy` and Expo Web on port `8082`. Set Python breakpoints in `backend/app` and TypeScript breakpoints in `mobile/src`; a request from the mobile UI will stop in both layers as it crosses the API.

For a physical phone with Expo Go:

1. Start the backend with the `Backend: FastAPI` debug profile.
2. Start Expo with `npx expo start --lan` from `mobile`.
3. Use the **React Native: Attach to packager** command from the React Native Tools extension.
4. Keep `mobile/.env` pointed at your computer LAN address, for example `EXPO_PUBLIC_API_URL=http://10.170.196.55:8000`.

The browser debug profile is the recommended first path because JavaScript and Python breakpoints can be launched together reliably.

