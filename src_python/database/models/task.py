from sqlalchemy import Integer, Column, String, Boolean

from database.base import Base


class Task(Base):
    __tablename__ = "tasks"

    task_id = Column(Integer, primary_key=True)
    task_title = Column(String, nullable=False)
    task_completed = Column(Boolean, nullable=False)
