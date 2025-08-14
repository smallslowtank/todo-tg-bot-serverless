from aiogram import Router, types, F
from aiogram.filters import CommandStart, Command, or_f

from keyboards.inline import get_callback_buttons
from routers.todo_commands import create_list_of_tasks

router = Router(name=__name__)

help_page_text = "Это телеграм-бот для ведения списка задач. \
        \nЧтобы добавить задачу, \
        \nнужно написать её текст в чат бота \
        \nи в ответном сообщении нажать кнопку \
        \n'Add this message as a new Task' \
        \nДля удаления задачи из списка, \
        \nнужно отправить боту команду /del \
        \nи через пробел указать номер задачи в списке. \
        \nVersion: Python"

@router.message(
    or_f(
        CommandStart(),
        F.text.lower() == "start",
        F.text.lower() == "старт",
    )
)
async def start_command(message: types.Message):
    """
    Команда "старт"
    """
    await message.react(reaction=[{"type": "emoji", "emoji": "🔥"}])
    text = await create_list_of_tasks()
    await message.answer(
        text=f"📝 ToDo Bot\nСписок задач:\n{text}",
        reply_markup=get_callback_buttons(
            buttons={
                "Help page": "help",
            },
            sizes=(1,),
        ),
    )


@router.message(
    or_f(
        Command("help"),
        F.text.lower() == "help",
    )
)
async def help_command(message: types.Message):
    """
    Команда "help"
    """
    await message.react(reaction=[{"type": "emoji", "emoji": "👀"}])
    text = help_page_text
    await message.answer(
        text=f"📝 Help page\n{text}",
        reply_markup=get_callback_buttons(
            buttons={
                "Tasks 📝": "list_task",
            },
            sizes=(1,),
        ),
    )


@router.callback_query(
    F.data == "help",
)
async def help_callback(callback: types.CallbackQuery):
    """
    Команда "help" (коллбэк)
    """
    text = help_page_text
    await callback.message.edit_text(
        text=f"📝 Help page\n{text}",
        reply_markup=get_callback_buttons(
            buttons={
                "Tasks 📝": "list_task",
            },
            sizes=(1,),
        ),
    )
