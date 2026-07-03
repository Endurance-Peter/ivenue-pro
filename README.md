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

