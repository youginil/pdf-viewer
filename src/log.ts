interface Console {
    [key: string]: any
}

enum LOG_LEVEL {
    INFO,
    WARN,
    ERROR
}

const enablePerformance = 'performance' in window;

function logFn(type: string) {
    return (console as Console)[type] || function (...messsages: Array<any>) {
        console.log(`${type.toUpperCase()}: `, ...messsages);
    }
}

const info = logFn('info');
const warn = logFn('warn');
const error = logFn('error');

function now() {
    return enablePerformance ? performance.now() : Date.now();
}

class Log {
    private readonly level: LOG_LEVEL = LOG_LEVEL.INFO;
    private title: string;
    private timing: Map<string, number> = new Map<string, number>();
    private readonly enableTiming: boolean;

    constructor(title: string, level: LOG_LEVEL, enableTiming: boolean) {
        this.title = title ? `[${title}]` : '';
        this.level = level;
        this.enableTiming = enableTiming;
    }

    info(...messages: Array<any>) {
        if (this.level >= LOG_LEVEL.INFO) {
            info(this.title, ...messages);
        }
    }

    warn(...messages: Array<any>) {
        if (this.level >= LOG_LEVEL.WARN) {
            warn(this.title, ...messages);
        }
    }

    error(...messages: Array<any>) {
        if (this.level >= LOG_LEVEL.ERROR) {
            error(this.title, ...messages);
        }
    }

    mark(name: string) {
        if (!this.enableTiming) {
            return;
        }
        if (this.timing.has(name)) {
            warn(this.title, `Mark: ${name} already exist`);
        } else {
            this.timing.set(name, now());
        }
    }

    measure(name: string, desc: string) {
        if (!this.enableTiming) {
            return;
        }
        if (this.timing.has(name)) {
            info(this.title, '⏱ Time consuming:', desc, `${now() - (this.timing.get(name) as number)}ms`);
        } else {
            warn(this.title, `Mark: ${name} not exist`);
        }
    }

    removeMark(name: string) {
        this.timing.delete(name);
    }

    clearMarks() {
        this.timing.clear();
    }
}

export {LOG_LEVEL, Log};
