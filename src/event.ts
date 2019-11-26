import {Log} from "./log";

export const EVENTS = {
    LOAD: 'load',
    PAGE_CHANGE: 'pagechange',
    HIGHLIGHT_CLICK: 'highlightclick',
    PAGE_RESIZE: 'pageresize'
};

const eventNames = Object.keys(EVENTS).map((k) => {
    return EVENTS[k];
});

export class PVEventHandler {
    private events: Map<string, Array<Function>>;
    private log: Log;

    constructor(log: Log) {
        this.events = new Map<string, Array<Function>>();
        eventNames.forEach((n) => {
            this.events.set(n, []);
        });
        this.log = log;
    }

    addHandler(name: string, handler: Function) {
        if (!this.events.has(name)) {
            this.log.warn(`Invalid event: ${name}. Available events: ${eventNames.join(', ')}`);
            return;
        }
        if (typeof handler !== 'function') {
            this.log.warn(`Invalid event handler`);
            return;
        }
        this.events.get(name).push(handler);
    }

    removeHandler(name: string, handler: Function) {
        if (!this.events.has(name)) {
            this.log.warn(`Invalid event: ${name}. Available events: ${eventNames.join(', ')}`);
            return;
        }
        if (typeof handler !== 'function') {
            this.log.warn(`Invalid event handler`);
            return;
        }
        const hs = this.events.get(name);
        const idx = hs.indexOf(handler);
        if (idx >= 0) {
            hs.splice(idx, 1);
        }
    }

    hasListener(name: string): boolean {
        if (!this.events.has(name)) {
            this.log.warn(`Invalid event: ${name}. Available events: ${eventNames.join(', ')}`);
            return false;
        }
        return this.events.get(name).length > 0;
    }

    trigger(name: string, value: any) {
        this.events.get(name).forEach((h) => {
            h(value);
        });
    }
}

export class PVLoadEvent {
    constructor() {
    }
}

export class PVPageChangeEvent {
    page: number;
    totalPages: number;

    constructor(page: number, totalPages: number) {
        this.page = page;
        this.totalPages = totalPages;
    }
}

type highlightList = Array<{page: number, id: Symbol}>;

export class PVHighlightClickEvent {
    highlights: highlightList;

    constructor(highlights: highlightList) {
        this.highlights = highlights;
    }
}

type pageSizes = {
    [prop: number]: {
        w: number
        h: number
    }
};

export class PVPageResizeEvent {
    pageSizes: pageSizes;

    constructor(pageSizes: pageSizes) {
        this.pageSizes = pageSizes;
    }
}
