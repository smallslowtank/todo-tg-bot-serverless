import { Command } from "./command.class";
import { keyboard_help_list_create } from "../keyboards/inline";


function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
};

export class Echo extends Command {
    handle(): void {
        // Echo
        this.bot.on("text", async ctx => {
            ctx.reply('Добавить как новую задачу? 👀');
            await sleep(1000);
            let new_task: string = ctx.text;
            ctx.reply(new_task, keyboard_help_list_create);
        });
    };
};
