import {Log} from './log';

const DPR = window.devicePixelRatio || 1;

type Highlight = {
    elem: HTMLElement | null
    pos: [number, number, number, number]
    highlightClass: string
    highlightFocusClass: string
    attrs: {
        [key: string]: string
    }
};

type PDFPageOptions = {
    pdfjs: any
    pageNum: number
    pdfPage: PDFPageProxy | null
    width: number
    height: number
    isRenderText: boolean
    pageResizeCallback: Function
    log: Log
}

export class PDFPage {
    private readonly pdfjs: any;
    private readonly pageNum: number;
    private pdfPage: PDFPageProxy | null;
    private width: number;
    private height: number;
    private originWidth: number = 0;
    private originHeight: number = 0;
    private scale: number = 1;
    private readonly isRenderText: boolean;
    private readonly pageResizeCallback: Function;

    private pageElement: HTMLElement | null = document.createElement('div');
    private loadingElement: HTMLElement = document.createElement('div');
    private canvas: HTMLCanvasElement | null = null;
    private textElement: HTMLElement | null = null;

    private highlights: Map<symbol, Highlight> = new Map<symbol, Highlight>();

    private canvasCtx: CanvasRenderingContext2D | null = null;
    private canvasRenderTask: RenderTask | null = null;
    private textRenderTask: RenderTask | null = null;

    private rendering: boolean = false;

    private readonly log: Log;

    private destroyed: Boolean = false;

    constructor(options: PDFPageOptions) {
        this.pdfjs = options.pdfjs;
        this.pageNum = options.pageNum;
        this.pdfPage = options.pdfPage;
        this.width = options.width;
        this.height = options.height;
        this.isRenderText = options.isRenderText;
        this.pageResizeCallback = options.pageResizeCallback;
        this.log = options.log;
        (this.pageElement as HTMLElement).style.width = options.width + 'px';
        (this.pageElement as HTMLElement).style.height = options.height + 'px';
        (this.pageElement as HTMLElement).className = 'pdf-page';
        (this.pageElement as HTMLElement).setAttribute('data-page', '' + this.pageNum);
        this.loadingElement.innerText = 'LOADING...';
        this.loadingElement.className = 'pdf-loading';
        (this.pageElement as HTMLElement).appendChild(this.loadingElement);
    }

    getPageElement(): HTMLElement | null {
        return this.pageElement;
    }

    resize(w: number) {
        if (this.width === w) {
            return;
        }
        this.height *= w / this.width;
        this.width = w;
        (this.pageElement as HTMLElement).style.width = `${this.width}px`;
        (this.pageElement as HTMLElement).style.height = `${this.height}px`;
    }

    private _render(force: boolean) {
        if (this.originWidth === 0) {
            const viewport = (this.pdfPage as PDFPageProxy).getViewport();
            const vs = getViewSize(viewport);
            this.originWidth = vs.w;
            this.originHeight = vs.h;
            if (this.originHeight > 0 && this.originWidth / this.originHeight !== this.width / this.height) {
                this.height = this.width * this.originHeight / this.originWidth;
                this.pageResizeCallback({
                    [this.pageNum]: {
                        w: this.width,
                        h: this.height
                    }
                });
            }
        }
        const scale = this.scale = this.width / this.originWidth;
        this.height = this.originHeight * scale;
        (this.pageElement as HTMLElement).style.height = this.height + 'px';
        const vp = (this.pdfPage as PDFPageProxy).getViewport({scale: scale * DPR});
        // 是否需要渲染
        let needRender = false;
        /* render canvas layer */
        let p1;
        if (force && this.canvas) {
            this.canvas.remove();
            this.canvas = null;
            this.canvasCtx = null;
        }
        if (!this.canvas) {
            needRender = true;
            this.canvas = document.createElement('canvas');
            this.canvas.style.position = 'absolute';
            this.canvas.style.left = '0';
            this.canvas.style.top = '0';
            this.canvas.style.width = this.width + 'px';
            this.canvas.width = this.width * DPR;
            this.canvas.height = this.height * DPR;
            this.canvasCtx = this.canvas.getContext('2d');
            this.canvasRenderTask = (this.pdfPage as PDFPageProxy).render({
                canvasContext: this.canvasCtx,
                viewport: vp
            });
            p1 = this.canvasRenderTask.promise;
        } else {
            p1 = Promise.resolve();
        }
        /* render text layer */
        let p2;
        if (this.isRenderText) {
            if (force && this.textElement) {
                this.textElement.remove();
                this.textElement = null;
            }
            if (!this.textElement) {
                needRender = true;
                this.textElement = document.createElement('div');
                this.textElement.style.position = 'absolute';
                this.textElement.style.top = '0';
                this.textElement.style.left = '0';
                this.textElement.className = 'text-layer';
                this.textElement.style.width = this.width + 'px';
                this.textElement.style.height = this.height + 'px';
                const textContentStream = (this.pdfPage as PDFPageProxy).streamTextContent({
                    normalizeWhitespace: true,
                });
                this.textRenderTask = this.pdfjs.renderTextLayer({
                    textContent: null,
                    textContentStream,
                    container: this.textElement,
                    viewport: (this.pdfPage as PDFPageProxy).getViewport({scale,}),
                    textDivs: [],
                    textContentItemsStr: [],
                    enhanceTextSelection: false,
                });
                p2 = (this.textRenderTask as RenderTask).promise;
            } else {
                p2 = Promise.resolve();
            }
        } else {
            p2 = Promise.resolve();
        }
        // 如果强制重新渲染，就把高亮清掉
        if (force) {
            this.highlights.forEach((hd) => {
                if (hd.elem) {
                    hd.elem.remove();
                    hd.elem = null;
                }
            });
        }
        if (needRender) {
            this.log.mark(`RP${this.pageNum}`);
        }
        /* all render done */
        Promise.all([p1 as Promise<undefined>, p2])
            .then(() => {
                this.loadingElement.style.display = 'none';
                (this.pageElement as HTMLElement).appendChild(this.canvas as HTMLCanvasElement);
                if (this.textElement) {
                    (this.pageElement as HTMLElement).appendChild(this.textElement);
                }
                (this.pageElement as HTMLElement).setAttribute('data-load', 'true');
                /* render highlight */
                this.highlights.forEach((hl, id) => {
                    this._highlight(id);
                });
            })
            .catch((e) => {
                this.log.error(`Page render fail. page: ${this.pageNum}. ${e}`);
            })
            .finally(() => {
                if (needRender) {
                    this.log.measure(`RP${this.pageNum}`, `Render page ${this.pageNum}`);
                    this.log.removeMark(`RP${this.pageNum}`);
                }
                this.canvasRenderTask = null;
                this.textRenderTask = null;
                if (this.destroyed) {
                    this.destroy();
                }
            });
    }

    render(dc: PDFDocumentProxy, force: boolean) {
        if (this.destroyed || this.canvasRenderTask) {
            return;
        }
        if (!force && (this.pageElement as HTMLElement).hasAttribute('data-load')) {
            return;
        }
        if (this.pdfPage) {
            this._render(force);
        } else {
            dc.getPage(this.pageNum)
                .then((pdfPage) => {
                    this.pdfPage = pdfPage;
                    this._render(force);
                });
        }
    }

    getHeight() {
        return this.height;
    }

    calcSize(originSize: number) {
        return this.scale * originSize;
    }

    highlight(x: number, y: number, w: number, h: number, highlightClass: string, attrs: { [key: string]: string }): symbol {
        let id = Symbol(Date.now() + '_' + Math.random());
        this.highlights.set(id, {
            elem: null,
            pos: [x, y, w, h],
            highlightClass,
            highlightFocusClass: '',
            attrs: attrs
        });
        if (this.canvasCtx) {
            this._highlight(id);
        }
        return id;
    }

    private _highlight(id: symbol) {
        if (!this.highlights.has(id)) {
            return;
        }
        const hd = this.highlights.get(id) as Highlight;
        if (hd.elem) {
            return;
        }
        const pos = hd.pos;
        hd.elem = document.createElement('div');
        hd.elem.className = hd.highlightClass;
        hd.elem.setAttribute('pdf-highlight', 'true');
        hd.elem.style.display = 'inline-block';
        hd.elem.style.position = 'absolute';
        hd.elem.style.zIndex = '1';
        const scale = this.scale;
        hd.elem.style.width = `${Math.floor(pos[2] * scale)}px`;
        hd.elem.style.height = `${Math.floor(pos[3] * scale)}px`;
        hd.elem.style.left = `${Math.floor(pos[0] * scale)}px`;
        hd.elem.style.top = `${Math.floor(pos[1] * scale)}px`;
        Object.keys(hd.attrs).forEach((k) => {
            hd.elem!.setAttribute(k, hd.attrs[k]);
        });
        (this.pageElement as HTMLElement).appendChild(hd.elem);
    }

    removeHighlight(id: symbol, del: boolean = true) {
        if (!this.highlights.has(id)) {
            return;
        }
        const hd = this.highlights.get(id) as Highlight;
        if (hd.elem) {
            hd.elem.remove();
            hd.elem = null;
        }
        if (del) {
            this.highlights.delete(id);
        }
    }

    removeAllHighlights(del: boolean = true) {
        this.highlights.forEach((v, id) => {
            this.removeHighlight(id, del);
        });
    }

    highlightFocus(id: symbol, highlightFocusClass: string) {
        const hd = this.highlights.get(id);
        if (!hd) {
            return;
        }
        hd.highlightFocusClass = highlightFocusClass;
        if (hd.elem) {
            hd.elem.classList.add(highlightFocusClass);
        }
    }

    highlightBlur(id: symbol) {
        const hd = this.highlights.get(id);
        if (!hd) {
            return;
        }
        if (hd.elem) {
            hd.elem.classList.remove(hd.highlightFocusClass);
        }
    }

    getHighlightsByPoint(x: number, y: number): Array<{ page: number, id: symbol }> {
        const hls: Array<{ page: number, id: symbol }> = [];
        this.highlights.forEach((hl, id) => {
            const elem = (this.highlights.get(id) as Highlight).elem;
            if ((elem as HTMLElement).offsetLeft <= x
                && (elem as HTMLElement).offsetLeft + (elem as HTMLElement).offsetWidth >= x
                && (elem as HTMLElement).offsetTop <= y
                && (elem as HTMLElement).offsetTop + (elem as HTMLElement).offsetHeight >= y) {
                hls.push({
                    page: this.pageNum,
                    id
                });
            }
        });
        return hls;
    }

    revoke() {
        if (!(this.pageElement as HTMLElement).hasAttribute('data-load')) {
            return;
        }
        if (this.canvas) {
            (this.canvas as HTMLCanvasElement).remove();
            this.canvas = null;
            this.canvasCtx = null;
        }
        if (this.isRenderText && this.textElement) {
            (this.textElement as HTMLElement).remove();
            this.textElement = null;
        }
        this.loadingElement.style.display = 'block';
        (this.pageElement as HTMLElement).removeAttribute('data-load');
        this.highlights.forEach((hl) => {
            if (hl.elem) {
                hl.elem.remove();
                hl.elem = null;
            }
        });
    }

    destroy() {
        (this.pageElement as HTMLElement).remove();
        this.pageElement = null;
        this.canvas = null;
        this.canvasCtx = null;
        this.pageElement = null;
        this.textElement = null;
        if (this.canvasRenderTask) {
            this.canvasRenderTask = null;
        }
        if (this.textRenderTask) {
            this.textRenderTask = null;
        }
        if (this.pdfPage) {
            this.pdfPage.cleanup();
            this.pdfPage = null;
        }
    }
}

export function getViewSize(vp: PageViewport) {
    const vb = vp.viewBox;
    if (vp.rotation / 90 % 2 !== 0) {
        return {
            w: vb[3],
            h: vb[2]
        };
    }
    return {
        w: vb[2],
        h: vb[3]
    };
}
