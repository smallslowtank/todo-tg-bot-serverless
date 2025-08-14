from pydantic import BaseModel


class CreateTask(BaseModel):
    task_id: int
    task_title: str
