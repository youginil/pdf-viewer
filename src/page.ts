import { Log } from "./log";

const DPR = window.devicePixelRatio || 1;

enum PageRenderStatus {
  Blank,
  Rendering,
  Rendered,
}

type Highlight = {
  elem: HTMLElement | null;
  pos: [number, number, number, number];
  highlightClass: string;
  highlightFocusClass: string;
  attrs: {
    [key: string]: string;
  };
};

type PDFPageOptions = {
  pdfjs: any;
  dc: PDFDocumentProxy;
  pageNum: number;
  pdfPage: PDFPageProxy | null;
  width: number;
  height: number;
  isRenderText: boolean;
  pageResizeCallback: Function;
};

export class PDFPage {
  private pdfjs: any;
  private dc: PDFDocumentProxy;
  private pageNum: number;
  private pdfPage: PDFPageProxy | null;
  private width: number;
  private height: number;
  private originWidth: number = 0;
  private originHeight: number = 0;
  private scale: number = 1;
  private isRenderText: boolean;
  private pageResizeCallback: Function;

  private pageElement = document.createElement("div");
  private loadingElement: HTMLElement = document.createElement("div");

  private highlights: Map<symbol, Highlight> = new Map<symbol, Highlight>();

  private status = PageRenderStatus.Blank;
  private renderWidth = 0;

  constructor(options: PDFPageOptions) {
    this.pdfjs = options.pdfjs;
    this.dc = options.dc;
    this.pageNum = options.pageNum;
    this.pdfPage = options.pdfPage;
    this.width = options.width;
    this.height = options.height;
    this.isRenderText = options.isRenderText;
    this.pageResizeCallback = options.pageResizeCallback;
    this.pageElement.style.width = options.width + "px";
    this.pageElement.style.height = options.height + "px";
    this.pageElement.className = "pdf-page";
    this.pageElement.setAttribute("data-page", "" + this.pageNum);
    this.loadingElement.innerText = "LOADING...";
    this.loadingElement.className = "pdf-loading";
    this.pageElement.appendChild(this.loadingElement);
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
    this.pageElement.style.width = `${this.width}px`;
    this.pageElement.style.height = `${this.height}px`;
  }

  async render() {
    if (this.status === PageRenderStatus.Rendering) {
      if (this.width === this.renderWidth) {
        return;
      }
    } else if (this.status === PageRenderStatus.Rendered) {
      if (this.width === this.renderWidth) {
        return;
      }
      this.revoke();
    }
    this.renderWidth = this.width;
    if (!this.pdfPage) {
      this.pdfPage = await this.dc.getPage(this.pageNum);
    }
    if (this.originWidth === 0) {
      const viewport = (this.pdfPage as PDFPageProxy).getViewport();
      const vs = getViewSize(viewport);
      this.originWidth = vs.w;
      this.originHeight = vs.h;
      if (
        this.originHeight > 0 &&
        this.originWidth / this.originHeight !== this.width / this.height
      ) {
        this.height = (this.width * this.originHeight) / this.originWidth;
        this.pageResizeCallback({
          [this.pageNum]: {
            w: this.width,
            h: this.height,
          },
        });
      }
    }
    const scale = (this.scale = this.width / this.originWidth);
    this.height = this.originHeight * scale;
    this.pageElement.style.height = this.height + "px";
    const vp = (this.pdfPage as PDFPageProxy).getViewport({
      scale: scale * DPR,
    });
    /* render canvas layer */
    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.left = "0";
    canvas.style.top = "0";
    canvas.style.width = this.width + "px";
    canvas.width = this.width * DPR;
    canvas.height = this.height * DPR;
    const canvasCtx = canvas.getContext("2d");
    const canvasRenderTask = (this.pdfPage as PDFPageProxy).render({
      canvasContext: canvasCtx,
      viewport: vp,
    });
    const p1 = canvasRenderTask.promise;
    /* render text layer */
    let p2 = Promise.resolve();
    let textElement: HTMLElement | null = null
    if (this.isRenderText) {
      textElement = document.createElement("div");
      textElement.style.position = "absolute";
      textElement.style.top = "0";
      textElement.style.left = "0";
      textElement.className = "text-layer";
      textElement.style.width = this.width + "px";
      textElement.style.height = this.height + "px";
      const textContentStream = (this
        .pdfPage as PDFPageProxy).streamTextContent({
          normalizeWhitespace: true,
        });
      const textRenderTask = this.pdfjs.renderTextLayer({
        textContent: null,
        textContentStream,
        container:textElement,
        viewport: (this.pdfPage as PDFPageProxy).getViewport({ scale }),
        textDivs: [],
        textContentItemsStr: [],
        enhanceTextSelection: false,
      }) as RenderTask;
      p2 = textRenderTask.promise;
    }
    /* all render done */
    await Promise.all([p1, p2]);
    if (canvas.width !== this.renderWidth * DPR) {
      return;
    }
    this.status = PageRenderStatus.Rendered;
    this.loadingElement.style.display = 'none';
    this.pageElement.appendChild(canvas);
    if (textElement) {
      this.pageElement.appendChild(textElement);
    }
    this.pageElement.setAttribute("data-load", "true");
    this.highlights.forEach((hl, id) => {
      this._highlight(id);
    });
  }

  getHeight() {
    return this.height;
  }

  calcSize(originSize: number) {
    return this.scale * originSize;
  }

  highlight(
    x: number,
    y: number,
    w: number,
    h: number,
    highlightClass: string,
    attrs: { [key: string]: string }
  ): symbol {
    let id = Symbol(Date.now() + "_" + Math.random());
    this.highlights.set(id, {
      elem: null,
      pos: [x, y, w, h],
      highlightClass,
      highlightFocusClass: "",
      attrs: attrs,
    });
    if (this.status === PageRenderStatus.Rendered) {
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
    hd.elem = document.createElement("div");
    hd.elem.className = hd.highlightClass;
    hd.elem.setAttribute("pdf-highlight", "true");
    hd.elem.style.display = "inline-block";
    hd.elem.style.position = "absolute";
    hd.elem.style.zIndex = "1";
    const scale = this.scale;
    hd.elem.style.width = `${Math.floor(pos[2] * scale)}px`;
    hd.elem.style.height = `${Math.floor(pos[3] * scale)}px`;
    hd.elem.style.left = `${Math.floor(pos[0] * scale)}px`;
    hd.elem.style.top = `${Math.floor(pos[1] * scale)}px`;
    Object.keys(hd.attrs).forEach((k) => {
      hd.elem!.setAttribute(k, hd.attrs[k]);
    });
    this.pageElement.appendChild(hd.elem);
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

  getHighlightsByPoint(
    x: number,
    y: number
  ): Array<{ page: number; id: symbol }> {
    const hls: Array<{ page: number; id: symbol }> = [];
    this.highlights.forEach((hl, id) => {
      const elem = (this.highlights.get(id) as Highlight).elem;
      if (
        (elem as HTMLElement).offsetLeft <= x &&
        (elem as HTMLElement).offsetLeft + (elem as HTMLElement).offsetWidth >=
        x &&
        (elem as HTMLElement).offsetTop <= y &&
        (elem as HTMLElement).offsetTop + (elem as HTMLElement).offsetHeight >=
        y
      ) {
        hls.push({
          page: this.pageNum,
          id,
        });
      }
    });
    return hls;
  }

  revoke() {
    if (this.status === PageRenderStatus.Rendered) {
      this.pageElement.innerHTML = '';
      this.pageElement.removeAttribute('data-load');
      this.loadingElement.style.display = 'block';
      this.pageElement.appendChild(this.loadingElement);
    }
    this.status = PageRenderStatus.Blank;
  }

  destroy() {
    this.pageElement.remove();
    if (this.pdfPage) {
      this.pdfPage.cleanup();
      this.pdfPage = null;
    }
  }
}

export function getViewSize(vp: PageViewport) {
  const vb = vp.viewBox;
  if ((vp.rotation / 90) % 2 !== 0) {
    return {
      w: vb[3],
      h: vb[2],
    };
  }
  return {
    w: vb[2],
    h: vb[3],
  };
}
