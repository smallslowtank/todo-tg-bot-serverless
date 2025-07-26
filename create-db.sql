-- создать базу данных
CREATE TABLE `tasks`
(   
    `task_id` Int64 NOT NULL,
    `task_title` Utf8 NOT NULL,
    `task_completed` Bool NOT NULL,
    PRIMARY KEY (`task_id`)
);