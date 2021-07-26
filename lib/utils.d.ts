export declare function isUndef(v: any): v is null | undefined;
export declare function isDef(v: any): boolean;
export declare function isNull(v: any): v is null;
export declare function extendObject(target: {
    [key: string]: any;
}, source: {
    [key: string]: any;
}): void;
declare type Task = () => Promise<void>;
export declare class TaskQueue {
    private queue;
    private status;
    private afterStop;
    constructor(queue?: Task[]);
    private exec;
    add(task: Task): TaskQueue;
    stop(): Promise<void>;
    clear(): TaskQueue;
}
export {};
//# sourceMappingURL=utils.d.ts.map