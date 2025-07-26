//
// Создать функцию
//
resource "yandex_function" "todo-tg-bot-function" {
  name               = "todo-tg-bot-function"
  user_hash          = "v1"
  runtime            = "python312"
  entrypoint         = "index.handler"
  memory             = "256"
  execution_timeout  = "30"
  service_account_id = yandex_iam_service_account.sa-todo-tg-bot-ydb-cf.id
  description        = "ToDo телеграм-бот"
  content {
    zip_filename = "todo-tg-bot.zip"
  }
}

//
// Создать триггер
//
resource "yandex_function_trigger" "todo-tg-bot-trigger" {
  name        = "todo-tg-bot-trigger"
  description = "триггер для ToDo телеграм-бота"
  folder_id   = var.folder_id
  message_queue {
    service_account_id = yandex_iam_service_account.sa-todo-tg-bot-ymq.id
    queue_id           = yandex_message_queue.todo-tg-bot-message-queue.arn
    batch_cutoff       = 0
    batch_size         = 1
  }
  function {
    id                 = yandex_function.todo-tg-bot-function.id
    tag                = "$latest"
    service_account_id = yandex_iam_service_account.sa-todo-tg-bot-ydb-cf.id
  }
}