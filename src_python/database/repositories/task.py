from sqlalchemy import select, update
from sqlalchemy.orm import Session

from core.entities import CreateTask
from database.models.task import Task


class TaskRepository:

    def __init__(self, session: Session):
        self.session = session

    async def get_by_title(self, task_title: str):
        stmt = select(Task).filter(
            Task.task_title == task_title, Task.task_completed == False
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_by_id(self, task_id: int):
        stmt = select(Task).where(Task.task_id == task_id)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_all(self):
        stmt = (
            select(Task.task_id, Task.task_title)
            .where(Task.task_completed == False)
            .order_by(Task.task_id.asc())
        )
        result = await self.session.execute(stmt)
        return result.all()

    async def complete(self, task_id: int):
        stmt = (
            update(Task)
            .where(Task.task_id == task_id)
            .values(task_completed=True)
            .execution_options(synchronize_session="fetch")
        )
        try:
            await self.session.execute(stmt)
            return True
        except:
            return False

    async def add(self, task: CreateTask):
        self.session.add(
            Task(
                task_id=task.task_id,
                task_title=task.task_title,
                task_completed=False,
            )
        )


def task_repository_factory(session):
    return TaskRepository(session)
