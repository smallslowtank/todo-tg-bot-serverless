_Бот: Кто понял жизнь, тот не спешит._

### ToDo telegram bot

Это простой и неспешный телеграм-бот для ведения списка задач. Задачи в списке располагаются в порядке добавления.

Бот написан на Python 3 с испольлзованием библиотеки aiogram 3 (webhook) и стека serverless-технологий Yandex Cloud (Cloud Function, API Gateway, Message Queue, Managed Service for YDB). Для взаимодействия с БД используется асинхронная SQLAlchemy. Если потребление ресурсов Yandex Cloud будет укладываться во free tier (https://yandex.cloud/ru/docs/billing/concepts/serverless-free-tier), то бот будет работать бесплатно.

Бот общается в приватном чате с тем пользователем, чей идентификатор указан в файле с настройками (```.env```). Фильтрация реализована в файле ```src/routers/__init__.py``` .

#### Добавление задачи
Чтобы добавить задачу, нужно написать её текст в чат бота и в ответном сообщении нажать кнопку 'Add this message as a new Task'. Текст сообщения не должен полностью совпадать с текстом уже существующей задачи.

#### Удаление задачи
Для удаления задачи из списка, нужно отправить боту команду /del и через пробел указать номер задачи в списке (например, ```/del 1```).

#### Файл настроек .env
В качестве шаблона можно использовать файл .env.example

```
BOT_TOKEN=<токен телеграм бота>
TG_ID=<идентификатор пользователя>
CLOUD_ID=<идентификатор облака>
DB_ID=<идентификатор базы данных>
```
Создание и получение токена телеграм бота через BotFather https://core.telegram.org/bots/features#botfather

Получение идентификатора пользователя Телеграма: погуглить и воспользваться одним из ботов.

Идентификатор облака, документация https://yandex.cloud/ru/docs/resource-manager/operations/cloud/get-id

Идентификатор базы данных можно найти в её свойствах, например, в Консоли Yandex Cloud. Документация https://yandex.cloud/ru/docs/ydb/operations/manage-databases 

#### Развёртывание бота (руками через Консоль Yandex Cloud)
1. Создать сервисные аккаунты:
- В самом простом случае можно создать один аккаунт с ролью ```editor``` на каталог и везде его использовать.
- В идеале нужно ограничивать права минимально необходимыми. Не уверен, что в случае с телеграм-ботом стоит так заморачиваться. Но если в облаке кроме бота есть что-то ещё и важное, то стоит заморочиться.
- Вариант попроще: создать два сервисных аккаунта с ролями на каталог (как в варианте развёртывании через Terraform). Один для работы с БД и функцией (роли ```ydb.editor``` и ```functions.functionInvoker```), другой для работы с очередью сообщений (роли ```ymq.writer``` и ```ymq.reader```).
- Документация. Создание сервисного аккаунта https://yandex.cloud/ru/docs/iam/operations/sa/create . Назначить роль на каталог или облако https://yandex.cloud/ru/docs/iam/operations/roles/grant#cloud-or-folder .
2. Создать БД и таблицу:
- Создать Serverless базу данных https://yandex.cloud/ru/docs/ydb/operations/manage-databases#create-db-serverless .
- Создать таблицу https://yandex.cloud/ru/docs/ydb/operations/schema#create-table . Название таблицы и столбцов можно посмотреть в файле ```src/database/models/task.py``` .
- Либо для создания таблицы возспользоваться SQL-запросом из файла ```create-db.sql```. Для этого в Консоли Yandex Cloud нужно в базе данных перейти во вкладку "Навигация" и там нажать кнопку "Новый SQL-запрос", скопировать туда запрос и выполнить его.
3. Создать очередь и шлюз:
- Создание новой очереди сообщений https://yandex.cloud/ru/docs/message-queue/operations/message-queue-new-queue . Срок хранения сообщений 1 минута.
- Создание API-шлюза для очереди сообщений https://yandex.cloud/ru/docs/api-gateway/operations/spec-constructor/ymq . Путь указать ```/todo-tg-bot``` .
4. Создать функцию и триггер:
- Создать функцию https://yandex.cloud/ru/docs/functions/operations/function/function-create .
- Создать версию функции из zip-архива (лежит в папке terraform) https://yandex.cloud/ru/docs/functions/operations/function/version-manage .
- Не забыть нажать "Сохранить изменения".
- Создать триггер для Message Queue, который передает сообщения в функцию Cloud Functions https://yandex.cloud/ru/docs/functions/operations/trigger/ymq-trigger-create .
5. В "Редакторе" функции:
- Создать файл ```.env``` и задать в нём переменные.
- Установить значения: "Таймаут" 30 секунтд, "Память" 256 МБ.
- Не забыть нажать "Сохранить изменения".
6. Подключить webhook.
- Например, воспользоваться кодом из файла ```set-webhook.txt``` .
- Для выполнения кода можно воспользоваться Cloud Shell https://yandex.cloud/ru/docs/console/quickstart/cloud-shell
```
curl \
  --request POST \
  --url https://api.telegram.org/bot<токен_бота>/setWebhook \
  --header 'content-type: application/json' \
  --data '{"url": "<домен_API-шлюза>/todo-tg-bot"}'
  ```
- При успешном подключении вебхука в консоли будет сообщение, содержащее текст ```{"ok":true,"result":true,"description":"Webhook was set"}```

#### Развёртывание бота (Terraform)
Подразумевается, что все действия будут выполняться в **Yandex Cloud Shell** (поэтому иногда нужно будет использовать sudo).
1. Получить файлы проекта (```sudo git clone https://github.com/smallslowtank/todo-tg-bot-serverless.git```) и перейти в папку terraform проекта (```cd todo-tg-bot-serverless/terraform```).
2. При необходимости инициализировать Terraform (```cp .terraformrc ~``` и ```sudo terraform init```) и задать переменные (```nano terraform.tfvars```)
```
token     = "<OAuth-токен>"
cloud_id  = "<идентификатор_облака>"
folder_id = "<идентификатор_каталога>"
zone      = "ru-central1-d"
```
- ```token``` OAuth-токен в сервисе Яндекс ID, для получения нужно перейти по ссылке и от туда его скопировать. Ссылка https://oauth.yandex.ru/authorize?response_type=token&client_id=1a6990aa636648e9b2ef855fa7bec2fb . Документация https://yandex.cloud/ru/docs/iam/concepts/authorization/oauth-token

- ```cloud_id``` Идентификатор облака, документация https://yandex.cloud/ru/docs/resource-manager/operations/cloud/get-id

- ```folder_id``` Идентификатор каталога, документация https://yandex.cloud/ru/docs/resource-manager/operations/folder/get-id

- ```zone``` При необходимости можно изменить зону на a или b, документация https://yandex.cloud/ru/docs/overview/concepts/geo-scope
3. Проверить файлы (```terraform validate```), посмотреть план (```terraform plan```) и создать ресурсы:
- БД, сервисные  аккаунты и статический ключ
```
terraform apply \
    -target=yandex_ydb_database_serverless.todo-tg-bot-ydb \
    -target=yandex_iam_service_account.sa-todo-tg-bot-ydb-cf \
    -target=yandex_resourcemanager_folder_iam_binding.sa-todo-tg-bot-ydb-cf \
    -target=yandex_iam_service_account.sa-todo-tg-bot-ymq \
    -target=yandex_resourcemanager_folder_iam_binding.sa-todo-tg-bot-ymq \
    -target=yandex_iam_service_account_static_access_key.sa-todo-tg-bot-ymq-static-key
```
- Остальные ресурсы
```
terraform apply
```
4. В "Редакторе" функции:
- Создать файл ```.env``` и задать в нём переменные.
- Не забыть нажать "Сохранить изменения".
5. Подключить webhook.
- Например, воспользоваться кодом из файла ```set-webhook.txt``` .
- Для выполнения кода можно воспользоваться Cloud Shell https://yandex.cloud/ru/docs/console/quickstart/cloud-shell

```
curl \
  --request POST \
  --url https://api.telegram.org/bot<токен_бота>/setWebhook \
  --header 'content-type: application/json' \
  --data '{"url": "<домен_API-шлюза>/todo-tg-bot"}'
  ```
- При успешном подключении вебхука в консоли будет сообщение, содержащее текст ```{"ok":true,"result":true,"description":"Webhook was set"}```

#### Удаление ресурсов (Terraform)

Не получится удалить все ресурсы за один проход командой ```terraform destroy```, т.к. как минимум у сервисного аккаунта, созданного для очереди сообщений, не хватит прав на её удаление. Варианты:
1. Выдать сервисному аккаунту роль ```ymq.admin``` или выше и удалять ресурссы за два прохода ```terraform destroy```
2. Удалить оставшиеся ресурсы другим способом, например, руками через Консоль Yandex Cloud.
3. Мой выбор:
- Редактировать файл ```create-service-account.tf``` и выдать сервисному аккаунту роль ```ymq.admin```
- Удалить таблицу и очередь сообщений (вместе с ней удалятся шлюз и триггер)
```
terraform destroy \
  -target=yandex_ydb_table.todo-tg-bot-ydb-table-tasks \
  -target=yandex_message_queue.todo-tg-bot-message-queue 
```
- Удалить всё остальное
```
terraform destroy
```

#### Логгирование в Yandex Cloud

Обычно включается автоматически по умолчанию. При желании можно отключить.