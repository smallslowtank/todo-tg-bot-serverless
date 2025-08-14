import { message } from "telegraf/filters";
import { keyboard_help, keyboard_list } from "../keyboards/inline";
import { Command } from "./command.class";
import { create_list_of_tasks } from "./todo.commands";

export class BaseCommands extends Command {
    handle(): void {
        // Start command
        this.bot.hears(/\/start|start|старт/i, async (ctx) => {
            ctx.react('🔥');
            let list_of_task = await create_list_of_tasks();
            ctx.reply(
                `📝 ToDo Bot\nСписок задач:\n${list_of_task}`,
                keyboard_help,
            );
        });
        // Halp page
        let help_page_text = `Это телеграм-бот для ведения списка задач. \
            \nЧтобы добавить задачу, \
            \nнужно написать её текст в чат бота \
            \nи в ответном сообщении нажать кнопку \
            \n'Add this message as a new Task' \
            \nДля удаления задачи из списка, \
            \nнужно отправить боту команду /del \
            \nи через пробел указать номер задачи в списке. \
            \nVersion: TypeScript`;
        // Help command and text
        this.bot.hears(/\/help|help/i, async (ctx) => {
            ctx.react('👀');
            ctx.reply(
                `📝 Help page\n${help_page_text}`,
                keyboard_list,
            );
        });
        // Help callback
        this.bot.action('task_help', async (ctx) => {
            ctx.editMessageText(
                `📝 Help page\n${help_page_text}`,
                keyboard_list,
            );
        });
    };
};
