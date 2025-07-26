from pydantic import BaseModel


class CreateTask(BaseModel):
    task_id: int
    task_title: str


class BaseTask(CreateTask):
    task_completed: bool
