import PDFViewer from './viewer';
export declare const EVENTS: {
    [prop: string]: string;
};
export declare class PVEventHandler {
    private events;
    constructor();
    addHandler(name: string, handler: Function, callback?: Function): void;
    removeHandler(name: string, handler: Function, callback?: Function): void;
    hasListener(name: string): boolean;
    trigger(name: string, value: any): void;
}
export declare class PVLoadEvent {
    pv: PDFViewer;
    constructor(pv: PDFViewer);
}
export declare class PVPageChangeEvent {
    pv: PDFViewer;
    page: number;
    totalPages: number;
    constructor(pv: PDFViewer, page: number, totalPages: number);
}
declare type highlightList = Array<{
    page: number;
    id: Symbol;
}>;
export declare class PVHighlightClickEvent {
    private _e;
    pv: PDFViewer;
    highlights: highlightList;
    constructor(e: MouseEvent, pv: PDFViewer, highlights: highlightList);
    stopPropagation(): void;
}
declare type pageSizes = {
    [prop: number]: {
        w: number;
        h: number;
    };
};
export declare class PVPageResizeEvent {
    pv: PDFViewer;
    pageSizes: pageSizes;
    constructor(pv: PDFViewer, pageSizes: pageSizes);
}
export declare class PVScrollEvent {
    pv: PDFViewer;
    scrollTop: number;
    scrollLeft: number;
    constructor(pv: PDFViewer, scrollTop: number, scrollLeft: number);
}
export {};
//# sourceMappingURL=event.d.ts.map