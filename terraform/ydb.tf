//
// Создать базу данных
//
resource "yandex_ydb_database_serverless" "todo-tg-bot-ydb" {
  name                = "todo-tg-bot-ydb"
  folder_id           = var.folder_id
  location_id         = "ru-central1"
  deletion_protection = false
  description = "база данных для ToDo телеграм-бота"
  sleep_after = 30

  serverless_database {
    storage_size_limit = 1
  }
}

//
// Создать таблицу в базе
//
resource "yandex_ydb_table" "todo-tg-bot-ydb-table-tasks" {
  path              = "tasks"
  connection_string = yandex_ydb_database_serverless.todo-tg-bot-ydb.ydb_full_endpoint

  column {
    name     = "task_id"
    type     = "Int64"
    not_null = true
  }
  column {
    name     = "task_title"
    type     = "Utf8"
    not_null = true
  }
  column {
    name     = "task_completed"
    type     = "Bool"
    not_null = true
  }

  primary_key = ["task_id"]

}