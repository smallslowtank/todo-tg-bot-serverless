import { databaseService } from "../database/database.service";
import { ITaskService } from "./task.interface";

export class TaskService implements ITaskService {

    async create(task_title: string): Promise<boolean> {
        if (await databaseService.task_exist(task_title)) {
            return false;
        } else {
            databaseService.task_create(task_title);
            return true;
        };
    };

    async get_all(): Promise<string[]> {
        let result: string[] = [];
        let res = await databaseService.task_get_all();
        if (res[0] === undefined) {
            result = ['Список пуст'];
        } else {
            for (let i in res) {
                result.push(res[i]['task_title']);
            };
        };
        return result;
    };

    async complete(task_for_completing: number): Promise<boolean> {
        let list_of_tasks = await databaseService.task_get_all();
        if (0 < task_for_completing && task_for_completing <= list_of_tasks.length) {
            let task_id: number = list_of_tasks[task_for_completing - 1]['task_id'];
            if (await databaseService.task_completed(task_id)) {
                return true;
            } else {
                return false;
            };
        } else {
            return false;
        };
    };

};

export const taskService = new TaskService();
