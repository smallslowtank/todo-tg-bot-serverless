__all__ = ("router",)

from aiogram import F, Router
from config import settings

from .base_commands import router as base_commands_router
from .todo_commands import router as todo_commands_router
from .echo import router as echo_router

router = Router(name=__name__)

# фильтры для сообщений
router.message.filter(
    F.from_user.id == int(settings.TG_ID),
    F.chat.type == "private",
)

router.include_routers(
    base_commands_router,
    todo_commands_router,
    # Эхо-роутер должен быть подключен последним
    echo_router,
)
