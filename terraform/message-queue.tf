//
// Создать очередь
//
resource "yandex_message_queue" "todo-tg-bot-message-queue" {
  name                      = "todo-tg-bot-message-queue"
  message_retention_seconds = 60
  access_key                = yandex_iam_service_account_static_access_key.sa-todo-tg-bot-ymq-static-key.access_key
  secret_key                = yandex_iam_service_account_static_access_key.sa-todo-tg-bot-ymq-static-key.secret_key
}

//
// Создать шлюз
//
resource "yandex_api_gateway" "todo-tg-bot-api-gateway" {
  name        = "todo-tg-bot-api-gateway"
  description = "шлюз для ToDo телеграм-бота"
  spec        = <<-EOT
openapi: 3.0.0
info:
  title: Sample API
  version: 1.0.0
paths:
  /todo-tg-bot:
    post:
      x-yc-apigateway-integration:
        queue_url: ${yandex_message_queue.todo-tg-bot-message-queue.id}
        action: SendMessage
        type: cloud_ymq
        payload_format_type: body
        folder_id: ${var.folder_id}
        service_account_id: ${yandex_iam_service_account.sa-todo-tg-bot-ymq.id}
EOT
}