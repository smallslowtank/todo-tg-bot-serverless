import { configService } from "../config/config.service";
import { IDataBase } from "./database.interface";
import { MetadataCredentialsProvider } from '@ydbjs/auth/metadata';
import { Driver } from '@ydbjs/core';
import { query } from '@ydbjs/query'


export class DataBaseService implements IDataBase {

    private cloud_id: string = configService.get("CLOUD_ID");
    private db_id: string = configService.get("DB_ID");
    private ydb_cs: string = `grpcs://ydb.serverless.yandexcloud.net:2135/?database=/ru-central1/${this.cloud_id}/${this.db_id}`;
    private credentialsProvider = new MetadataCredentialsProvider();

    private async formatToYYYYMMDDHHmmss(): Promise<number> {
        const date = new Date;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return Number(`${year}${month}${day}${hours}${minutes}${seconds}`);
    };

    // инициализация базы данных
    private async initDb(): Promise<Driver> {
        const driver = new Driver(this.ydb_cs,
            {
                'credentialsProvider': this.credentialsProvider,
                'ydb.sdk.enable_discovery': false, // Улучшает производительность холодного старта
            });
        return driver;
    };

    async task_exist(task_title: string): Promise<boolean> {
        const driver = await this.initDb();
        await driver.ready();

        let sql = query(driver);

        let result: boolean = false;
        try {
            const [resultSets]: any[][] = await sql(`
                SELECT task_title
                FROM tasks
                WHERE task_title = '${task_title}' AND task_completed = FALSE
            `);
            if (resultSets[0]) {
                result = true
            };
        } finally {
            driver.close();
            return result;
        };
    };

    async task_create(task_title: string): Promise<boolean> {
        const driver = await this.initDb();
        await driver.ready();

        let sql = query(driver);

        let result: boolean = false;
        const task_id: number = await this.formatToYYYYMMDDHHmmss();
        const task_completed: boolean = false;
        try {
            await sql(`
                INSERT INTO tasks (task_id, task_title, task_completed)
                VALUES (${task_id}, '${task_title}', ${task_completed})
            `);
            result = true;
        } finally {
            driver.close();
            return result;
        };
    };

    async task_get_all(): Promise<any[]> {
        const driver = await this.initDb();
        await driver.ready();

        let sql = query(driver);

        let result: any[] = [];
        let result_query: any[][] = [];
        try {
            const resultSets: any[][] = await sql(`
                SELECT task_id, task_title
                FROM tasks
                WHERE task_completed = FALSE
                ORDER BY task_id ASC;
            `);
            const result_json = JSON.stringify(resultSets, (key, value) => {
                return typeof value === 'bigint' ? Number(value) : value;
            });
            result_query = JSON.parse(result_json);
            result = result_query[0];

        } finally {
            driver.close();
            // результат запроса в виде списка из объектов [{task_id: number, task_title: string}]
            return result;
        };
    };

    async task_completed(task_id: number): Promise<boolean> {
        const driver = await this.initDb();
        await driver.ready();

        let sql = query(driver);

        let result: boolean = false;
        try {
            await sql(`
                UPDATE tasks
                SET task_completed = TRUE
                WHERE task_id = ${task_id};
            `);
            result = true;
        } finally {
            driver.close();
            return result;
        };
    };

};

export const databaseService = new DataBaseService();

/*
async task_get_all(): Promise<any[][]> {

    const driver = await this.initDb();
    await driver.ready();

    let sql = query(driver);

    let result: any[][] = [];
    try {
        // Выполняем запрос
        const resultSets = await sql(`
            SELECT task_id, task_title, task_completed
            FROM tasks
            WHERE task_completed = FALSE
            ORDER BY task_id ASC;
        `);
        const result_json = JSON.stringify(resultSets, (key, value) => {
            return typeof value === 'bigint' ? Number(value) : value;
        });
        result = JSON.parse(result_json);
    } finally {
        // ОБЯЗАТЕЛЬНО закрываем драйвер
        driver.close();
        // Возвращаем результат запроса в виде списка из списка объектов
        // [[{task_id: number, task_title: string, task_completed: boolean}]]
        return result;
    };
};
*/
