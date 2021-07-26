export interface Animation {
    stop(): void;
}
declare class RafAnimation {
    private readonly start;
    private readonly end;
    private readonly duration;
    private readonly cb;
    private readonly endCb;
    private readonly flag;
    private readonly startTime;
    private raf;
    constructor(start: number, end: number, duration: number, cb: (v: number) => void, endCb: Function);
    private stepByStep;
    stop(): void;
}
declare class TimerAnimation {
    static step: number;
    private value;
    private readonly stepValue;
    private times;
    private timer;
    private readonly cb;
    private readonly endCb;
    constructor(start: number, end: number, duration: number, cb: (v: number) => void, endCb: Function);
    private stepByStep;
    stop(): void;
}
export declare function animate(start: number, end: number, duration: number, cb: (v: number) => void, endCb: Function): RafAnimation | TimerAnimation;
export {};
//# sourceMappingURL=animtion.d.ts.map