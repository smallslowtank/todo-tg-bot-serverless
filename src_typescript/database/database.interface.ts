export interface IDataBase {

    task_exist(task_title: string): Promise<boolean>;

    task_create(task_title: string): Promise<boolean>;

    task_get_all(): Promise<any>;

    task_completed(task_id: number): Promise<boolean>;

};
