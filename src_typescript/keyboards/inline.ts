import { Markup } from "telegraf";

export const keyboard_help = Markup.inlineKeyboard([
    Markup.button.callback('Help page', 'task_help'),
]);

export const keyboard_list = Markup.inlineKeyboard([
    Markup.button.callback("List Task 📝", "task_list"),
]);

export const keyboard_help_list = Markup.inlineKeyboard([
    Markup.button.callback('Help page', 'task_help'),
    Markup.button.callback("List Task 📝", "task_list"),
]);

export const keyboard_help_list_create = Markup.inlineKeyboard([
    [
        Markup.button.callback('Help page', 'task_help'),
        Markup.button.callback("List Task 📝", "task_list"),
    ],
    [
        Markup.button.callback("Add this message as a new Task", "msg_to_task"),
    ]
]);
