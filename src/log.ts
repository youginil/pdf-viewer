enum LOG_LEVEL {
    DEBUG,
    INFO,
    WARN,
    ERROR
}

const enablePerformance = 'performance' in window;

function logFn(type: string) {
    return console[type] || function (...messsages) {
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
    private readonly level: LOG_LEVEL = LOG_LEVEL.DEBUG;
    private title: string;
    private timing: Map<string, number> = new Map<string, number>();
    private readonly enableTiming: boolean;

    constructor(title: string, level: LOG_LEVEL, enableTiming: boolean) {
        this.title = title;
        this.level = level;
        this.enableTiming = enableTiming;
    }

    info(...messages) {
        if (this.level >= LOG_LEVEL.INFO) {
            info(...messages);
        }
    }

    warn(...messages) {
        if (this.level >= LOG_LEVEL.WARN) {
            warn(...messages);
        }
    }

    error(...messages) {
        if (this.level >= LOG_LEVEL.ERROR) {
            error(...messages);
        }
    }

    mark(name: string) {
        if (!this.enableTiming) {
            return;
        }
        if (this.timing.has(name)) {
            warn(`Mark: ${name} already exist`);
        } else {
            this.timing.set(name, now());
        }
    }

    measure(name: string, desc: string) {
        if (!this.enableTiming) {
            return;
        }
        if (this.timing.has(name)) {
            info('⏱ Time consuming:', desc, `${now() - this.timing.get(name)}ms`);
        } else {
            warn(`Mark: ${name} not exist`);
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
