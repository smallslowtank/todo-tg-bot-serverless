//
// Создать сервисный аккаунт "sa-todo-tg-bot-ydb-cf"
//
resource "yandex_iam_service_account" "sa-todo-tg-bot-ydb-cf" {
  name      = "sa-todo-tg-bot-ydb-cf"
  folder_id = var.folder_id
  description = "сервисный аккаунт для ToDo телеграм-бота (YDB, Cloud Functions)"
}

//
// Выдать сервисному аккаунту "sa-todo-tg-bot-ydb-cf"
// роли ydb.viewer storage.viewer functions.functionInvoker на каталог
//
resource "yandex_resourcemanager_folder_iam_binding" "sa-todo-tg-bot-ydb-cf" {
  for_each = toset([
    "ydb.editor",
    "functions.functionInvoker",
  ])
  role      = each.value
  folder_id = var.folder_id
  members = [
    "serviceAccount:${yandex_iam_service_account.sa-todo-tg-bot-ydb-cf.id}",
  ]
  sleep_after = 5
}

//
// Создать сервисный аккаунт "sa-todo-tg-bot-ymq"
//
resource "yandex_iam_service_account" "sa-todo-tg-bot-ymq" {
  name      = "sa-todo-tg-bot-ymq"
  folder_id = var.folder_id
  description = "сервисный аккаунт для ToDo телеграм-бота (Message Queue)"
}

//
// Выдать сервисному аккаунту "sa-todo-tg-bot-ymq"
// роль ymq.writer на каталог
//
resource "yandex_resourcemanager_folder_iam_binding" "sa-todo-tg-bot-ymq" {
  for_each = toset([
    "ymq.writer",
    "ymq.reader",
  ])
  role      = each.value
  folder_id = var.folder_id
  members = [
    "serviceAccount:${yandex_iam_service_account.sa-todo-tg-bot-ymq.id}",
  ]
  sleep_after = 5
}

//
// Создать статический ключ для сервисного аккаунта "sa-todo-tg-bot-ymq" (для работы с очередью)
//
resource "yandex_iam_service_account_static_access_key" "sa-todo-tg-bot-ymq-static-key" {
  service_account_id = yandex_iam_service_account.sa-todo-tg-bot-ymq.id
  description        = "static access key"
}
