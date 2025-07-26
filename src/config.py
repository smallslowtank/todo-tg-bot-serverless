import os
import ydb.iam
from dotenv import load_dotenv

load_dotenv()


class Settings:
    # токен телеграм бота
    BOT_TOKEN = os.getenv("BOT_TOKEN")

    # идентификатор пользователя в телеграм
    TG_ID = os.getenv("TG_ID")

    # url баннера
    # URL_IMG = os.getenv("URL_IMG")

    CLOUD_ID = os.getenv("CLOUD_ID")  # идентификатор облака, в котором находится БД
    DB_ID = os.getenv("DB_ID")  # идентификатор БД

    # yql+ydb_async асинхронный диалект
    YDB_CS = f"yql+ydb_async://ydb.serverless.yandexcloud.net:2135//ru-central1/{CLOUD_ID}/{DB_ID}"

    # для авторизации в БД используются метаданные сервисного аккаунта
    # от имени которого запускается функция
    # параметры подключения
    ARGS = {
        "_add_declare_for_yql_stmt_vars": True,
        "connect_args": {
            "protocol": "grpcs",
            "credentials": ydb.iam.MetadataUrlCredentials(),
        },
    }


settings = Settings()
