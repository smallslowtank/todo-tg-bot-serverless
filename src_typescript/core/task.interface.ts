export interface ITaskService {

    create(task_title: string): Promise<boolean>;

    get_all(): Promise<string[]>;

    complete(task_for_completing: number): Promise<boolean>;
};
