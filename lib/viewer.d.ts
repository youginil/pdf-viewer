import './style.scss';
import { TypedArray } from 'pdfjs-dist/types/display/api';
declare type Options = {
    container?: HTMLElement;
    url?: string;
    data?: TypedArray;
    file?: File;
    cmaps?: string;
    gap?: number;
    isRenderText?: boolean;
    logTitle?: string;
    logLevel?: number;
    containerBackground?: string;
    borderStyle?: string;
    pdfjsParams?: {
        [key: string]: any;
    };
};
interface HighlightParams {
    page: number;
    x: number;
    y: number;
    w: number;
    h: number;
    highlightClass?: string;
    attrs?: {
        [key: string]: string;
    };
}
/**
 * @public
 */
export default class PDFViewer {
    static version: any;
    private elem;
    private isRenderText;
    private pdfTask;
    private dc;
    private pages;
    private width;
    private firstPageOriginWidth;
    private firstPageOriginHeight;
    private currentPage;
    private eventHandler;
    private renderTimer;
    private renderQueue;
    private scrollAnimation;
    private ready;
    private pageHelper;
    private logger;
    constructor(options: Options);
    private _handlePageResize;
    private _render;
    private _getDocument;
    addEventListener(name: string, handler: Function): PDFViewer;
    removeEventListener(eventName: string, handler: Function): PDFViewer;
    getPDFInfo(): {
        totalPages: number;
        pageGap: number;
    };
    scrollTo(page: number, pageTop: number, cb?: Function): PDFViewer;
    highlight(params: HighlightParams): symbol | null;
    removeHighlight(page: number, id: symbol): PDFViewer;
    highlightFocus(page: number, id: symbol, highlightFocusClass?: string): PDFViewer;
    highlightBlur(page: number, id: symbol): PDFViewer;
    renderPage(page: number, width: number, cb: (canvas: HTMLCanvasElement) => void, devicePixelCompatible?: boolean): void;
    resize(width?: number): PDFViewer;
    destroy(): void;
}
export {};
//# sourceMappingURL=viewer.d.ts.map