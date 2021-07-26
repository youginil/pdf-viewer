declare enum LOG_LEVEL {
    DEBUG = 1,
    INFO = 2,
    WARN = 3,
    ERROR = 4
}
declare class Log {
    private readonly level;
    private title;
    private timing;
    constructor(title: string, level: LOG_LEVEL);
    debug(...messages: Array<any>): void;
    info(...messages: Array<any>): void;
    warn(...messages: Array<any>): void;
    error(...messages: Array<any>): void;
    mark(name: string): void;
    measure(name: string, desc: string, remove?: boolean): void;
    removeMark(name: string): void;
    clearMarks(): void;
}
export { LOG_LEVEL, Log };
//# sourceMappingURL=log.d.ts.map