const ENABLE_RAF = 'performance' in window && 'requestAnimationFrame' in window;

export interface Animation {
    stop()
}

const requestAnimationFrame = window.requestAnimationFrame;

class RafAnimation {
    private readonly start: number;
    private readonly end: number;
    private readonly duration: number;
    private readonly cb: (v: number) => void;
    private readonly endCb: Function;

    private readonly flag: boolean;
    private readonly startTime: number;
    private raf;

    constructor(start, end, duration: number, cb: (v: number) => void, endCb: Function) {
        this.start = start;
        this.end = end;
        this.duration = duration;
        this.flag = end > start;
        this.cb = cb;
        this.endCb = endCb;
        this.startTime = window.performance.now();
        this.stepByStep();
    }

    private stepByStep() {
        let current = (window.performance.now() - this.startTime) / this.duration * (this.end - this.start) + this.start;
        current = this.flag ? Math.min(current, this.end) : Math.max(current, this.end);
        this.cb(current);
        if (current === this.end) {
            if (typeof this.endCb === 'function') {
                this.endCb();
            }
        } else {
            this.raf = requestAnimationFrame(() => {
                this.stepByStep();
            });
        }
    }

    stop() {
        window.cancelAnimationFrame(this.raf);
    }
}

class TimerAnimation {
    static step = 40;
    private value: number;
    private readonly stepValue: number;
    private times: number;
    // @ts-ignore
    private timer: Timeout;
    private readonly cb: (v: number) => void;
    private readonly endCb: Function;


    constructor(start, end, duration, cb, endCb) {
        this.value = start;
        this.times = Math.ceil(duration / TimerAnimation.step);
        this.stepValue = (end - start) / this.times;
        this.cb = cb;
        this.endCb = endCb;
        this.stepByStep();
    }

    private stepByStep() {
        this.value += this.stepValue;
        this.cb(this.value);
        this.times--;
        if (this.times > 0) {
            this.timer = setTimeout(() => {
                this.stepByStep();
            }, TimerAnimation.step);
        } else if (typeof this.endCb === 'function') {
            this.endCb();
        }
    }

    stop() {
        window.clearTimeout(this.timer);
    }
}

export function animate(start: number, end: number, duration: number, cb: (v: number) => void, endCb: Function) {
    return ENABLE_RAF ? new RafAnimation(start, end, duration, cb, endCb) : new TimerAnimation(start, end, duration, cb, endCb);
}
