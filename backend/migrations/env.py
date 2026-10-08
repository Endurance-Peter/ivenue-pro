import asyncio
from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# 1. Import your active iVenue configuration modules and ORM Metadata maps
from app.config import settings
from app.database import Base

import importlib
import sys
from pathlib import Path

# Ensure the server package (project root) is on sys.path so `import app` works
project_root = Path(__file__).resolve().parents[1]
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

# Import all ORM model modules in app/models so SQLAlchemy metadata is populated before autogenerate.
models_dir = project_root / "app" / "models"
if not models_dir.exists():
    raise RuntimeError(f"Models directory not found: {models_dir}")

for model_path in sorted(models_dir.glob("*.py")):
    if model_path.name.startswith("_") or model_path.name == "__init__.py":
        continue
    importlib.import_module(f"app.models.{model_path.stem}")
    
# This is the Alembic Config object, which provides access to the values within the .ini file.
config = context.config

# 2. Dynamic URL Injection: Override the template setting wrapper with your passwordless Docker URL string
config.set_main_option("sqlalchemy.url", settings.async_database_url)

# Interpret the config file for Python standard logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# 3. Target Metadata Configuration: Bind the target schemas to enable automated change tracking
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    """Helper execution execution thread running migrations under a synchronous wrapper."""
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Create an asynchronous database engine and execute migrations inside an isolated worker connection pool."""
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode using the async event loop worker context."""
    connectable = context.config.attributes.get("connection", None)

    if connectable is not None:
        do_run_migrations(connectable)
    else:
        asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()