declare module pdfjsLib {
    export function getDocument(src: any): PDFDocumentLoadingTask;
}

interface TypedArray {}

declare type src = string | TypedArray | DocumentInitParameters | PDFDataRangeTransport;

declare interface DocumentInitParameters {
    url?: string
    data?: TypedArray | string
    cMapUrl?: string
    cMapPacked?: boolean
}

interface PDFDataRangeTransport {}

declare class PDFDocumentLoadingTask {
    promise: Promise<PDFDocumentProxy>
}

declare class PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>
    destroy(): void
}

declare class PDFPageProxy {
    getViewport(params?: {[key: string]: any}): PageViewport
    render(params: {[key: string]: any}): RenderTask
    streamTextContent(params: {[key: string]: any}): ReadableStream
    cleanup(): void
}

declare class PageViewport {
    viewBox: [number, number, number, number];
    rotation: number
}

declare class RenderTask {
    promise: Promise<undefined>;
    cancel(): void
}
