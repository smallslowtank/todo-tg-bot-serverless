from aiogram import Router, types, F

from keyboards.inline import get_callback_buttons
from core.services import task_service

router = Router(name=__name__)


async def create_list_of_tasks():
    """
    формирование списка текущих задач для сообщения
    """
    list_tasks = await task_service.get_all()
    text = ""
    count_task = 1
    for i in list_tasks:
        if i != "Список пуст":
            text = text + str(count_task) + " " + i[1] + "\n"
            count_task += 1
        else:
            text = i
    return text


@router.callback_query(
    F.data == "msg_to_task",
)
async def msg_to_task(callback: types.CallbackQuery):
    """
    добавить задачу из сообщения
    """
    task_title = callback.message.text
    if await task_service.create(task_title) == True:
        await callback.message.edit_text(
            text=f"📝 ToDo Bot\nДобавлена задача:\n{task_title}",
            reply_markup=get_callback_buttons(
                buttons={
                    "Tasks 📝": "list_task",
                    "Help page": "help",
                },
                sizes=(2,),
            ),
        )
    else:
        await callback.message.edit_text(
            text=f"📝 ToDo Bot\nУже есть задача:\n{task_title}",
            reply_markup=get_callback_buttons(
                buttons={
                    "Tasks 📝": "list_task",
                    "Help page": "help",
                },
                sizes=(2,),
            ),
        )


@router.callback_query(
    F.data == "list_task",
)
async def list_task(callback: types.CallbackQuery):
    """
    посмотреть список задач
    """
    text = await create_list_of_tasks()
    await callback.message.edit_text(
        text=f"📝 ToDo Bot\nСписок задач:\n{text}",
        reply_markup=get_callback_buttons(
            buttons={
                "Help page": "help",
            },
            sizes=(1,),
        ),
    )


@router.message(F.text.startswith("/del "))
async def delete_task(message: types.Message):
    """
    удаление задачи из списка невыполненных
    """
    list_of_task = await create_list_of_tasks()
    try:
        task_for_compliting = int(message.text.split(" ")[1])
        if await task_service.complete(task_for_compliting):
            list_of_task = await create_list_of_tasks()
            text = f"📝 ToDo Bot\nЗадача удалена.\nСписок задач:\n{list_of_task}"
        else:
            text = f"📝 ToDo Bot\nНе получилось удалить задачу.\nСписок задач:\n{list_of_task}"
        await message.answer(
            text=text,
            reply_markup=get_callback_buttons(
                buttons={
                    "Help page": "help",
                },
                sizes=(1,),
            ),
        )
    except:
        await message.answer(
            text=f"📝 ToDo Bot \
                \nЧтобы удалить задачу из списка, нужно отправить в чат команду, которая будет начинаться на /del \
                \nи через пробел будет указан номер задачи в списке. \
                \nСписок задач: \
                \n{list_of_task}",
            reply_markup=get_callback_buttons(
                buttons={
                    "Help page": "help",
                },
                sizes=(1,),
            ),
        )
