interface Console {
  [key: string]: any;
}

enum LOG_LEVEL {
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
}

const enablePerformance = 'performance' in window;

function logFn(type: 'debug' | 'info' | 'warn' | 'error') {
  return (
    (console as Console)[type] ||
    function (...messsages: Array<any>) {
      console.log(`${type.toUpperCase()}: `, ...messsages);
    }
  );
}

const debug = logFn('debug');
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

  constructor(title: string, level: LOG_LEVEL) {
    this.title = title ? `[${title}]` : '';
    this.level = level;
  }

  debug(...messages: Array<any>) {
    if (this.level === LOG_LEVEL.DEBUG) {
      debug(this.title, ...messages);
    }
  }

  info(...messages: Array<any>) {
    if (this.level <= LOG_LEVEL.INFO) {
      info(this.title, ...messages);
    }
  }

  warn(...messages: Array<any>) {
    if (this.level <= LOG_LEVEL.WARN) {
      warn(this.title, ...messages);
    }
  }

  error(...messages: Array<any>) {
    if (this.level <= LOG_LEVEL.ERROR) {
      error(this.title, ...messages);
    }
  }

  mark(name: string) {
    if (this.level !== LOG_LEVEL.DEBUG) {
      return;
    }
    if (this.timing.has(name)) {
      warn(this.title, `Mark: ${name} already exist`);
    } else {
      this.timing.set(name, now());
    }
  }

  measure(name: string, desc: string, remove = true) {
    if (this.level !== LOG_LEVEL.DEBUG) {
      return;
    }
    if (this.timing.has(name)) {
      info(
        this.title,
        name,
        '⏱ Time consuming:',
        desc,
        `${now() - (this.timing.get(name) as number)}ms`
      );
      if (remove) {
        this.timing.delete(name);
      }
    } else {
      warn(this.title, `Mark: ${name} not exist`);
    }
  }

  removeMark(name: string) {
    if (this.level !== LOG_LEVEL.DEBUG) {
      return;
    }
    this.timing.delete(name);
  }

  clearMarks() {
    if (this.level !== LOG_LEVEL.DEBUG) {
      return;
    }
    this.timing.clear();
  }
}

export { LOG_LEVEL, Log };
