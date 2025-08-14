import { Telegraf, Context } from "telegraf";
import { configService } from "./config/config.service";
import { Command } from "./commands/command.class";
import { BaseCommands } from "./commands/base.commands";
import { Echo } from "./commands/echo.command";
import { TodoCommands } from "./commands/todo.commands";


class Bot {
    bot: Telegraf<Context> = new Telegraf<Context>(configService.get("BOT_TOKEN"));
    tg_id: number = Number(configService.get("TG_ID"));
    commands: Command[] = [];

    //init() {
    async init(message: any) {
        // Filter by telegram ID
        this.bot.drop(ctx => {
            if (ctx.from && ctx.from.id !== this.tg_id) {
                return true
            } else {
                return false
            };
        });
        // Filter by chat type
        this.bot.drop(ctx => {
            if (ctx.message && ctx.message.chat.type !== 'private') {
                return true
            } else {
                return false
            };
        });
        // Add routers (Echo router should come at the end!!!)
        this.commands = [
            new BaseCommands(this.bot),
            new TodoCommands(this.bot),
            new Echo(this.bot)
        ];
        for (const command of this.commands) {
            command.handle();
        }
        // Start bot
        this.bot.handleUpdate(message);
    };
};

// Entry point for Cloud Function (webhook)
module.exports.handler = async function (event: any, context: any) {
    const message = JSON.parse(event['messages'][0]['details']['message']['body']);
    const bot = new Bot();
    await bot.init(message);
};
