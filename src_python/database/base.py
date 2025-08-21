from sqlalchemy import AsyncAdaptedQueuePool
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base

from config import settings

engine = create_async_engine(
    url=settings.YDB_CS,
    poolclass=AsyncAdaptedQueuePool,
    **settings.ARGS,
)
async_session = async_sessionmaker(bind=engine, expire_on_commit=False)
Base = declarative_base()
