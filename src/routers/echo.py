import asyncio
from aiogram import Router, types

from keyboards.inline import get_callback_buttons

router = Router(name=__name__)


@router.message()
async def handle_echo(message: types.Message):
    """
    Обработка сообщений из чата (эхо)
    """
    text = f"Добавить как новую задачу? 👀"
    await message.answer(
        text=text,
    )
    await asyncio.sleep(1)
    text = message.text
    await message.answer(
        text=text,
        reply_markup=get_callback_buttons(
            buttons={
                "Help page": "help",
                "List Task 📝": "list_task",
                "Add this message as a new Task": "msg_to_task",
            },
            sizes=(2,),
        ),
    )
