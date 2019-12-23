import {Log} from "./log";
import {PDFViewer} from "./viewer";

export const EVENTS: {[prop: string]: string} = {
    LOAD: 'load',
    PAGE_CHANGE: 'pagechange',
    HIGHLIGHT_CLICK: 'highlightclick',
    PAGE_RESIZE: 'pageresize',
    SCROLL: 'scroll'
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

    addHandler(name: string, handler: Function, callback?: Function) {
        if (!this.events.has(name)) {
            this.log.warn(`Invalid event: ${name}. Available events: ${eventNames.join(', ')}`);
            return;
        }
        if (typeof handler !== 'function') {
            this.log.warn(`Invalid event handler`);
            return;
        }
        (this.events.get(name) as Array<Function>).push(handler);
        if (typeof callback === 'function') {
            callback();
        }
    }

    removeHandler(name: string, handler: Function, callback?: Function) {
        if (!this.events.has(name)) {
            this.log.warn(`Invalid event: ${name}. Available events: ${eventNames.join(', ')}`);
            return;
        }
        if (typeof handler !== 'function') {
            this.log.warn(`Invalid event handler`);
            return;
        }
        const hs = this.events.get(name) as Array<Function>;
        const idx = hs.indexOf(handler);
        if (idx >= 0) {
            hs.splice(idx, 1);
        }
        if (typeof callback === 'function') {
            callback();
        }
    }

    hasListener(name: string): boolean {
        if (!this.events.has(name)) {
            this.log.warn(`Invalid event: ${name}. Available events: ${eventNames.join(', ')}`);
            return false;
        }
        return (this.events.get(name) as Array<Function>).length > 0;
    }

    trigger(name: string, value: any) {
        (this.events.get(name) as Array<Function>).forEach((h) => {
            h(value);
        });
    }
}

export class PVLoadEvent {
    pv: PDFViewer;

    constructor(pv: PDFViewer) {
        this.pv = pv;
    }
}

export class PVPageChangeEvent {
    pv: PDFViewer;
    page: number;
    totalPages: number;

    constructor(pv: PDFViewer, page: number, totalPages: number) {
        this.pv = pv;
        this.page = page;
        this.totalPages = totalPages;
    }
}

type highlightList = Array<{ page: number, id: Symbol }>;

export class PVHighlightClickEvent {
    private _e: MouseEvent;
    pv: PDFViewer;
    highlights: highlightList;

    constructor(e: MouseEvent, pv: PDFViewer, highlights: highlightList) {
        this._e = e;
        this.pv = pv;
        this.highlights = highlights;
    }

    stopPropagation() {
        this._e.stopPropagation();
    }
}

type pageSizes = {
    [prop: number]: {
        w: number
        h: number
    }
};

export class PVPageResizeEvent {
    pv: PDFViewer;
    pageSizes: pageSizes;

    constructor(pv: PDFViewer, pageSizes: pageSizes) {
        this.pv = pv;
        this.pageSizes = pageSizes;
    }
}

export class PVScrollEvent {
    pv: PDFViewer;
    scrollTop: number;
    scrollLeft: number;

    constructor(pv: PDFViewer, scrollTop: number, scrollLeft: number) {
        this.pv = pv;
        this.scrollTop = scrollTop;
        this.scrollLeft = scrollLeft;
    }
}
