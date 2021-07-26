import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist/types/display/api';
import { PageViewport } from 'pdfjs-dist/types/display/display_utils';
import { Log } from './log';
declare type PDFPageOptions = {
    dc: PDFDocumentProxy;
    pageNum: number;
    pdfPage: PDFPageProxy | null;
    width: number;
    height: number;
    isRenderText: boolean;
    pageResizeCallback: Function;
    logger: Log;
};
export declare class PDFPage {
    private dc;
    private pageNum;
    private pdfPage;
    private width;
    private height;
    private originWidth;
    private originHeight;
    private scale;
    private isRenderText;
    private pageResizeCallback;
    private pageElement;
    private loadingElement;
    private highlights;
    private status;
    private renderWidth;
    private logger;
    private logPrefix;
    constructor(options: PDFPageOptions);
    getPageElement(): HTMLElement | null;
    resize(w: number): void;
    render(): Promise<void>;
    getHeight(): number;
    calcSize(originSize: number): number;
    highlight(x: number, y: number, w: number, h: number, highlightClass: string, attrs: {
        [key: string]: string;
    }): symbol;
    private _highlight;
    removeHighlight(id: symbol, del?: boolean): void;
    removeAllHighlights(del?: boolean): void;
    highlightFocus(id: symbol, highlightFocusClass: string): void;
    highlightBlur(id: symbol): void;
    getHighlightsByPoint(x: number, y: number): Array<{
        page: number;
        id: symbol;
    }>;
    revoke(): void;
    destroy(): void;
}
export declare function getViewSize(vp: PageViewport): {
    w: number;
    h: number;
};
export {};
//# sourceMappingURL=page.d.ts.map