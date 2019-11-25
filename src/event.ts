import {Td, TdRange} from "./table";
import log from "./log";

export const EDITOR_EVENTS = {
    CELL_FOCUS: 'cellfocus',
    CELL_BLUR: 'cellblur',
    MOUSE_MOVE: 'mousemove'
};

const eventNames = Object.keys(EDITOR_EVENTS).map((k) => {
    return EDITOR_EVENTS[k];
});

export class EditorEventHandler {
    private events: Map<string, Array<Function>>;

    constructor() {
        this.events = new Map<string, Array<Function>>();
        eventNames.forEach((n) => {
            this.events.set(n, []);
        });
    }

    addHandler(name: string, handler: Function) {
        if (!this.events.has(name)) {
            log.warn(`Invalid event: ${name}. Available events: ${eventNames.join(', ')}`);
            return;
        }
        if (typeof handler !== 'function') {
            log.warn(`Invalid event handler`);
            return;
        }
        this.events.get(name).push(handler);
    }

    removeHandler(name: string, handler: Function) {
        if (!this.events.has(name)) {
            log.warn(`Invalid event: ${name}. Available events: ${eventNames.join(', ')}`);
            return;
        }
        if (typeof handler !== 'function') {
            log.warn(`Invalid event handler`);
            return;
        }
        const hs = this.events.get(name);
        const idx = hs.indexOf(handler);
        if (idx >= 0) {
            hs.splice(idx, 1);
        }
    }

    trigger(name: string, value: any) {
        this.events.get(name).forEach((h) => {
            h(value);
        });
    }
}

export class TECellFocusEvent {
    row: TdRange;
    col: TdRange;

    constructor(row: TdRange, col: TdRange) {
        this.row = row;
        this.col = col;
    }
}

export class TECellBlurEvent {
    row: TdRange;
    col: TdRange;

    constructor(row: TdRange, col: TdRange) {
        this.row = row;
        this.col = col;
    }
}

type mouseMoveParam = {
    offsetX: number
    offsetY: number
}

export class TEMouseMoveEvent {
    offsetX: number;
    offsetY: number;

    constructor(data: mouseMoveParam) {
        this.offsetX = data.offsetX;
        this.offsetY = data.offsetY;
    }
}
