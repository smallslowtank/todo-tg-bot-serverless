from datetime import datetime

from core.entities import CreateTask

from database.repositories.task import task_repository_factory
from database.uow import unit_of_work


class TaskService:

    def __init__(self, repository_factory):
        self.task_repository_factory = repository_factory

    async def create(self, task_title: str):
        """
        создать задачу
        """
        async with unit_of_work() as uow:
            task_repository = self.task_repository_factory(uow.session)
            existing_task = await task_repository.get_by_title(task_title)
            if existing_task:
                return False
            else:
                task = CreateTask(
                    task_id=int(datetime.now().strftime("%Y%m%d%H%M%S")),
                    task_title=task_title,
                )
                await task_repository.add(task)
                return True

    async def get_all(self):
        """
        получить все задачи
        """
        async with unit_of_work() as uow:
            task_repository = self.task_repository_factory(uow.session)
            list_of_tasks = await task_repository.get_all()
            if len(list_of_tasks) != 0:
                tasks = []
                for i in list_of_tasks:
                    tasks.append(i)
                return tasks
            else:
                return ["Список пуст"]

    async def complete(self, task_for_compliting: int):
        """
        изменить статус задачи
        на входе получает номер задачи в списке невыполненных задач
        на выходе True, если получилось изменить статус задачи, наче - False
        """
        # получить task_id задачи и изменить статус задачи на выполнено

        async with unit_of_work() as uow:
            task_repository = self.task_repository_factory(uow.session)
            list_of_tasks = await task_repository.get_all()
            if 0 < task_for_compliting <= len(list_of_tasks):
                if await task_repository.complete(
                    task_id=list_of_tasks[task_for_compliting - 1][0]
                ):
                    return True
                else:
                    return False


task_service = TaskService(task_repository_factory)
