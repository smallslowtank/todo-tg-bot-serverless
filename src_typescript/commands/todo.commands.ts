import { Command } from "./command.class";
import { taskService } from '../core/task.service'
import { keyboard_help, keyboard_help_list } from "../keyboards/inline";

// формирование списка текущих задач для сообщения
export async function create_list_of_tasks(): Promise<string> {
    const list_tasks = await taskService.get_all();
    let text = "";
    let count_task = 1;
    for (let i in list_tasks) {
        if (list_tasks[i] != "Список пуст") {
            text = text + `${count_task} ${list_tasks[i]} \n`;
            count_task += 1;
        } else {
            text = list_tasks[i];
        };
    };
    return text;
};

export class TodoCommands extends Command {
    handle(): void {
        // task_list callback (список задач)
        this.bot.action('task_list', async (ctx) => {
            let list_of_task = await create_list_of_tasks();
            ctx.editMessageText(
                `📝 ToDo Bot\nСписок задач:\n${list_of_task}`,
                keyboard_help
            );
        });
        // msg_to_task callback (создать новую задачу из текста сообщения)
        this.bot.action('msg_to_task', async (ctx) => {
            let task_title = String(ctx.text);
            if (await taskService.create(task_title)) {
                ctx.editMessageText(
                    `📝 ToDo Bot\nДобавлена задача:\n${task_title}`,
                    keyboard_help_list
                );
            } else {
                ctx.editMessageText(
                    `📝 ToDo Bot\nУже есть задача:\n${task_title}`,
                    keyboard_help_list
                );
            };
        });
        // del command (удалить задачу из списка невыполненных)
        this.bot.hears(/^\/del /, async (ctx) => {
            let list_of_task = await create_list_of_tasks();
            let task_for_completing: number = Number(ctx.text.split(' ')[1]);
            if (task_for_completing === task_for_completing) {
                if (await taskService.complete(task_for_completing)) {
                    let list_of_task = await create_list_of_tasks();
                    let text_for_reply = `📝 ToDo Bot\nЗадача удалена.\nСписок задач:\n${list_of_task}`;
                    ctx.reply(
                        text_for_reply,
                        keyboard_help
                    );
                } else {
                    let text_for_reply = `📝 ToDo Bot\nНе получилось удалить задачу.\nСписок задач:\n${list_of_task}`;
                    ctx.reply(
                        text_for_reply,
                        keyboard_help
                    );
                };
            } else {
                let text_for_reply = `📝 ToDo Bot \
                \nЧтобы удалить задачу из списка, нужно отправить в чат команду, которая будет начинаться на /del \
                \nи через пробел будет указан номер задачи в списке. \
                \nСписок задач: \
                \n${list_of_task}`;
                ctx.reply(
                    text_for_reply,
                    keyboard_help
                );
            };
        });
    };
};
