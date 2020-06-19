export function isUndef(v: any): v is null | undefined {
  return v === undefined || v === null;
}

export function isDef(v: any): boolean {
  return v !== undefined && v !== null;
}

export function isNull(v: any): v is null {
  return v === null;
}

export function extendObject(
  target: { [key: string]: any },
  source: { [key: string]: any }
) {
  Object.keys(source).forEach((k) => {
    target[k] = source[k];
  });
}

enum QueueStatus {
  Ready,
  Executing,
  Stopping,
}

type Task = () => Promise<void>;

export class TaskQueue {
  private queue: Task[];

  private status = QueueStatus.Ready;

  private afterStop: Function[] = [];

  constructor(queue: Task[] = []) {
    this.queue = queue;
  }

  private exec() {
    if (this.status === QueueStatus.Stopping) {
      this.status = QueueStatus.Ready;
      this.afterStop.forEach((cb) => cb());
      this.afterStop.length = 0;
      return;
    }
    if (this.queue.length === 0) {
      this.status = QueueStatus.Ready;
      return;
    }
    this.status = QueueStatus.Executing;
    setTimeout(async () => {
      await this.queue.shift()!();
      this.exec();
    }, 0);
  }

  add(task: Task): TaskQueue {
    this.queue.push(task);
    if (this.status === QueueStatus.Ready) {
      this.exec();
    }
    return this;
  }

  stop(): Promise<void> {
    if (this.status === QueueStatus.Ready) {
      return Promise.resolve();
    }
    if (this.status === QueueStatus.Executing || this.status === QueueStatus.Stopping) {
      this.status = QueueStatus.Stopping;
      return new Promise((resolve) => {
        this.afterStop.push(resolve);
      });
    }
    return Promise.resolve();
  }

  clear(): TaskQueue {
    this.queue.length = 0;
    return this;
  }
}
