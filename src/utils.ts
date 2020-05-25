export function isUndef(v: any): boolean {
  return v === undefined || v === null;
}

export function isDef(v: any): boolean {
  return v !== undefined && v !== null;
}

export function extendObject(
  target: { [key: string]: any },
  source: { [key: string]: any }
) {
  Object.keys(source).forEach((k) => {
    target[k] = source[k];
  });
}

enum TimingSliceStatus {
  Ready,
  Executing,
  Stopping,
}

export class TaskQueue {
  private actions: Array<Function>;

  private p: Promise<unknown> = Promise.resolve();

  private index = 0;

  private status: TimingSliceStatus = TimingSliceStatus.Ready;

  private afterStop: Array<Function> = [];

  constructor(actions: Array<() => Promise<unknown>> = []) {
    this.actions = actions;
  }

  private exec(): TaskQueue {
    if (this.status === TimingSliceStatus.Stopping) {
      console.warn("Fail to execute timing slice because it is stopping.");
      return this;
    }
    if (this.actions.length === 0 || this.actions.length - 1 < this.index) {
      console.warn(
        "Fail to execute timing slice, because it has no more action to execute"
      );
      return this;
    }
    this.status = TimingSliceStatus.Executing;
    setTimeout(() => {
      try {
        this.actions[this.index]();
      } catch (e) {
        this.status = TimingSliceStatus.Ready;
        this.afterStop.forEach((cb) => {
          Promise.resolve().then(() => {
            cb();
          });
        });
        this.afterStop.length = 0;
        throw new Error(e);
      }
      setTimeout(() => {
        this.index += 1;
        if (this.status === TimingSliceStatus.Stopping) {
          this.status = TimingSliceStatus.Ready;
          this.afterStop.forEach((cb) => {
            cb();
          });
          this.afterStop.length = 0;
        } else if (this.index < this.actions.length) {
          this.exec();
        } else {
          this.status = TimingSliceStatus.Ready;
        }
      }, 0);
    }, 0);
    return this;
  }

  add(action: Function): TaskQueue {
    this.actions.push(action);
    return this;
  }

  start(): TaskQueue {
    if (this.status === TimingSliceStatus.Executing) {
      console.warn("Don't call execute duplicately.");
      return this;
    }
    if (this.status === TimingSliceStatus.Stopping) {
      console.warn("Fail to excute timing slice because it is stopping.");
      return this;
    }
    return this.exec();
  }

  stop(): Promise<void> {
    switch (this.status) {
      case TimingSliceStatus.Ready:
        return Promise.resolve();
      case TimingSliceStatus.Executing:
      case TimingSliceStatus.Stopping:
        this.status = TimingSliceStatus.Stopping;
        return new Promise((resolve) => {
          this.afterStop.push(resolve);
        });
      default:
        throw new Error("invalid timing slice status");
    }
  }

  get isStopping(): boolean {
    return this.status === TimingSliceStatus.Stopping;
  }

  clear(): TaskQueue {
    this.actions.length = 0;
    this.index = 0;
    return this;
  }
}
