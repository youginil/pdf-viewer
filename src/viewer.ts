import {
  EVENTS,
  PVEventHandler,
  PVHighlightClickEvent,
  PVLoadEvent,
  PVPageChangeEvent,
  PVPageResizeEvent,
  PVScrollEvent,
} from "./event";
import { getViewSize, PDFPage } from "./page";
import { getEventPath } from "./dom";
import { animate, Animation } from "./animtion";
import { extendObject, isDef, isUndef, TaskQueue } from "./utils";
import { Log, LOG_LEVEL } from "./log";
import "./style.scss";

const pkg = require("../package.json");
const pdfjs = require('pdfjs-dist/webpack.js');

const PAGE_GAP = 10;
const DPR = window.devicePixelRatio || 1;
const CLASS_NAME = "pdf-viewer-666";

type Options = {
  container?: HTMLElement;
  url?: string;
  data?: [Uint8Array];
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

export default class PDFViewer {
  static version = pkg.version;
  private elem: HTMLDivElement | null = null;
  private isRenderText: boolean = false;

  private pdfTask: PDFDocumentLoadingTask | null = null;
  private dc: PDFDocumentProxy | null = null;

  private pages: Array<PDFPage> = [];
  private width: number;
  private firstPageOriginWidth: number = 0;
  private firstPageOriginHeight: number = 0;
  private currentPage: number = 0;

  private eventHandler: PVEventHandler;

  private renderTimer: number | null = null;
  private renderQueue: TaskQueue = new TaskQueue();
  private scrollAnimation: Animation | null = null;

  private ready: boolean = false;
  // 在container中插入一个辅助元素，用来正确获取页面的宽度（因为滚动条的原因）(离线无效)
  private pageHelper: HTMLElement | null = document.createElement("div");

  private logger: Log;

  constructor(options: Options) {
    this.isRenderText = isDef(options.isRenderText)
      ? !!options.isRenderText
      : false;
    this.width = options.container ? options.container.clientWidth : 0;
    const offline = isUndef(options.container);

    this.logger = new Log(
      options.logTitle || "",
      options.logLevel || LOG_LEVEL.WARN,
    );

    this.eventHandler = new PVEventHandler();

    if (!offline) {
      this.elem = document.createElement("div");
      this.elem.className = CLASS_NAME;
      this.elem.style.background = isDef(options.containerBackground)
        ? (options.containerBackground as string)
        : "#808080";
      this.elem.style.border = isDef(options.borderStyle)
        ? (options.borderStyle as string)
        : "none";
      this.elem.style.overflow = "auto";
      this.elem.style.padding = `0 ${isDef(options.gap) ? options.gap : 10}px`;
      this.elem.appendChild(this.pageHelper as HTMLElement);
      this.elem.addEventListener("scroll", onscroll);
      this.elem.addEventListener("click", onclick);
      (options.container as HTMLElement).appendChild(this.elem);
      // @ts-ignore
      this.elem["pv"] = this;
    }

    let cfg: DocumentInitParameters = {
      cMapUrl: options.cmaps,
      cMapPacked: true,
    };
    if ("pdfjsParams" in options) {
      extendObject(cfg, options.pdfjsParams || {});
    }
    if (isDef(options.url)) {
      cfg["url"] = options.url;
      this._getDocument(cfg);
    } else if (isDef(options.data)) {
      cfg["data"] = options.data;
      this._getDocument(cfg);
    } else if (isDef(options.file)) {
      if (!(options.file instanceof File)) {
        this.logger.error('Invalid param "file"');
      }
      const fr = new FileReader();
      fr.readAsArrayBuffer(options.file as File);
      fr.onload = () => {
        cfg["data"] = new Uint8Array(fr.result as ArrayBuffer);
        this._getDocument(cfg);
      };
      fr.onerror = () => {
        this.logger.error('The param "file" cannot be loaded');
      };
    } else {
      this.logger.error(
        'You must specify the pdf source by "url", "data" or "file"'
      );
    }
  }

  private _handlePageResize(ps: {
    [pageNum: number]: { w: number; h: number };
  }) {
    this.eventHandler.trigger(
      EVENTS.PAGE_RESIZE,
      new PVPageResizeEvent(this, ps)
    );
  }

  private async _render() {
    if (!this.ready || !this.elem || this.pages.length === 0) {
      return;
    }
    await this.renderQueue.stop();
    this.renderQueue.clear();
    const vh = this.elem.clientHeight;
    const scrollTop = this.elem.scrollTop;
    let currentPage = 0;
    let currentPageVisibleHeight = 0;
    let prevPageHeight = 0;
    this.pages.forEach((page, pageIdx) => {
      const pageElem = page.getPageElement();
      const pageHeight = (pageElem as HTMLElement).clientHeight;
      const tmpPageTop = scrollTop - prevPageHeight;
      const tmpGap = pageIdx === 0 ? 0 : PAGE_GAP; // 加上页面的margin-top，这个margin很少变动，所以写死
      if (
        tmpPageTop < vh + 2 * pageHeight &&
        tmpPageTop > -vh - 2 * pageHeight
      ) {
        // 页面顶部在可视上下浮动5个页面高度的范围内都渲染
        this.renderQueue.add(() => page.render());
        // 哪个页面在container中占的空间大就使用哪个页面作为当前页面，如果相同，页码小优先
        let tmpCurrentPage = 0;
        let tmpCurrentPageVisibleHeight = 0;
        if (prevPageHeight >= scrollTop && prevPageHeight < scrollTop + vh) {
          tmpCurrentPage = pageIdx + 1;
          tmpCurrentPageVisibleHeight =
            pageHeight +
            tmpGap -
            Math.max(prevPageHeight + pageHeight - scrollTop - vh, 0);
        } else if (
          prevPageHeight + pageHeight + tmpGap > scrollTop &&
          prevPageHeight + pageHeight + tmpGap <= scrollTop + vh
        ) {
          tmpCurrentPage = pageIdx + 1;
          tmpCurrentPageVisibleHeight =
            pageHeight + tmpGap - Math.max(scrollTop - prevPageHeight, 0);
        } else if (
          prevPageHeight <= scrollTop &&
          prevPageHeight + pageHeight + tmpGap >= scrollTop + vh
        ) {
          tmpCurrentPage = pageIdx + 1;
          tmpCurrentPageVisibleHeight = vh;
        }
        if (
          tmpCurrentPage > 0 &&
          tmpCurrentPageVisibleHeight > currentPageVisibleHeight
        ) {
          currentPage = tmpCurrentPage;
          currentPageVisibleHeight = tmpCurrentPageVisibleHeight;
        }
      } else {
        page.revoke();
      }
      prevPageHeight += pageHeight + tmpGap;
    });
    if (currentPage !== this.currentPage) {
      this.currentPage = currentPage;
      this.eventHandler.trigger(
        EVENTS.PAGE_CHANGE,
        new PVPageChangeEvent(this, this.currentPage, this.dc?.numPages || 0)
      );
    }
  }

  private async _getDocument(cfg: DocumentInitParameters) {
    this.pdfTask = pdfjs.getDocument(cfg);
    this.dc = await this.pdfTask!.promise;
    const numPages = this.dc.numPages;
    if (numPages === 0) {
      this.ready = true;
      return;
    }
    if (!this.elem) {
      this.eventHandler.trigger(EVENTS.LOAD, new PVLoadEvent(this));
      return;
    }
    /* choose the first page size as initial size for all pages */
    const page = await this.dc.getPage(1);
    const vp = page.getViewport({});
    this.firstPageOriginWidth = vp.viewBox[2];
    this.firstPageOriginHeight = vp.viewBox[3];
    for (let i = 1; i <= numPages; i++) {
      const p = new PDFPage({
        pdfjs,
        dc: this.dc,
        pageNum: i,
        pdfPage: i === 1 ? page : null,
        width: this.width,
        height:
          (this.width * this.firstPageOriginHeight) / this.firstPageOriginWidth,
        isRenderText: this.isRenderText,
        pageResizeCallback: this._handlePageResize.bind(this),
        logger: this.logger
      });
      this.pages.push(p);
      this.elem!.appendChild(p.getPageElement() as HTMLElement);
    }
    this.ready = true;

    // 再次调用then方法是为了延迟渲染的执行，以便上面的页面元素都插入到container中，并且样式得到正确应用
    // 因为可能产生滚动条，所以重置页面尺寸
    this.width = (this.pageHelper as HTMLElement).clientWidth;
    const height =
      (this.width / this.firstPageOriginWidth) * this.firstPageOriginHeight;
    const pageSizes: {
      [key: number]: {
        w: number;
        h: number;
      };
    } = {};
    this.pages.forEach((p, pi) => {
      p.resize(this.width);
      pageSizes[pi + 1] = {
        w: this.width,
        h: height,
      };
    });
    Promise.resolve()
      .then(() => {
        this.eventHandler.trigger(EVENTS.LOAD, new PVLoadEvent(this));
      })
      .then(() => {
        this.eventHandler.trigger(
          EVENTS.PAGE_RESIZE,
          new PVPageResizeEvent(this, pageSizes)
        );
      })
      .then(() => {
        this._render();
      });
  }

  addEventListener(name: string, handler: Function): PDFViewer {
    this.eventHandler.addHandler(name, handler);
    return this;
  }

  removeEventListener(eventName: string, handler: Function): PDFViewer {
    this.eventHandler.removeHandler(eventName, handler);
    return this;
  }

  getPDFInfo() {
    return {
      // 总页数
      totalPages: this.dc?.numPages || 0,
      // 页面间距
      pageGap: PAGE_GAP,
    };
  }

  scrollTo(page: number, pageTop: number, cb: Function = () => {}): PDFViewer {
    if (!this.ready || !this.elem) {
      return this;
    }
    if (page < 1 || page > this.pages.length) {
      return this;
    }
    if (this.scrollAnimation) {
      this.scrollAnimation.stop();
      this.scrollAnimation = null;
    }
    const pageInstance = this.pages[page - 1];
    const pageElement = pageInstance.getPageElement();
    const scrollTop =
      (pageElement as HTMLElement).offsetTop +
      pageInstance.calcSize(pageTop) -
      this.elem.offsetHeight / 2;
    this.scrollAnimation = animate(
      this.elem.scrollTop,
      scrollTop,
      300,
      (v) => {
        (this.elem as HTMLElement).scrollTop = v;
      },
      cb
    );
    return this;
  }

  highlight(params: HighlightParams): symbol | null {
    if (!this.ready) {
      return null;
    }
    if (params.page < 1 || params.page > this.pages.length) {
      return null;
    }
    return this.pages[params.page - 1].highlight(
      params.x,
      params.y,
      params.w,
      params.h,
      params.highlightClass ?? "pdf-highlight",
      params.attrs ?? {}
    );
  }

  removeHighlight(page: number, id: symbol): PDFViewer {
    if (!this.elem) {
      return this;
    }
    if (page >= 1) {
      if (page > this.pages.length) {
        return this;
      }
      if (id !== undefined) {
        this.pages[page - 1].removeHighlight(id);
      } else {
        this.pages[page - 1].removeAllHighlights();
      }
    } else {
      this.pages.forEach((p) => {
        p.removeAllHighlights();
      });
    }
    return this;
  }

  highlightFocus(
    page: number,
    id: symbol,
    highlightFocusClass = "pdf-highlight-focus"
  ): PDFViewer {
    if (!this.ready || !this.elem) {
      return this;
    }
    if (page >= 1 && page <= this.pages.length) {
      this.pages[page - 1].highlightFocus(id, highlightFocusClass);
    }
    return this;
  }

  highlightBlur(page: number, id: symbol): PDFViewer {
    if (!this.ready || !this.elem) {
      return this;
    }
    if (page >= 1 && page <= this.pages.length) {
      this.pages[page - 1].highlightBlur(id);
    }
    return this;
  }

  renderPage(
    page: number,
    width: number,
    cb: (canvas: HTMLCanvasElement) => void,
    devicePixelCompatible = true
  ) {
    (this.pdfTask as PDFDocumentLoadingTask).promise
      .then((dc) => {
        dc.getPage(page).then((pdfPage: PDFPageProxy) => {
          width = (width || this.width) * (devicePixelCompatible ? DPR : 1);
          const viewport = pdfPage.getViewport();
          const vs = getViewSize(viewport);
          const scale = width / vs.w;
          const height = scale * vs.h;
          const vp = pdfPage.getViewport({ scale });
          /* render canvas layer */
          const canvas = document.createElement("canvas");
          const canvasCtx = canvas.getContext("2d");
          canvas.width = width;
          canvas.height = height;
          const canvasRenderTask = pdfPage.render({
            canvasContext: canvasCtx,
            viewport: vp,
          });
          canvasRenderTask.promise
            .then(() => {
              cb(canvas);
            })
            .catch((err) => {
              this.logger.error(
                "Render offline page canvas fail.",
                `page: ${page}, width: ${width}`,
                err
              );
            });
        });
      })
      .catch((err) => {
        this.logger.error(
          "Render offline page fail.",
          `page: ${page}, width: ${width}`,
          err
        );
      });
  }

  resize(width?: number): PDFViewer {
    if (this.firstPageOriginWidth === 0 || !this.elem) {
      return this;
    }
    if (isUndef(width)) {
      width = (this.elem.parentElement as HTMLElement).clientWidth;
    }
    this.elem.style.width = `${width}px`;
    Promise.resolve().then(() => {
      const tmpWidth = (this.pageHelper as HTMLElement).clientWidth;
      if (this.width !== tmpWidth) {
        this.width = tmpWidth;
        const pageSizes: { [key: number]: { w: number; h: number } } = {};
        this.pages.forEach((p, i) => {
          p.resize(this.width);
          pageSizes[i + 1] = {
            w: tmpWidth,
            h: p.getHeight(),
          };
        });
        this._render();
        this.eventHandler.trigger(
          EVENTS.PAGE_RESIZE,
          new PVPageResizeEvent(this, pageSizes)
        );
      }
    });
    return this;
  }

  destroy() {
    if (this.renderTimer) {
      clearTimeout(this.renderTimer);
    }
    // 销毁页面
    this.pages.forEach((page) => {
      page.destroy();
    });
    this.pages.length = 0;
    // 销毁viewer element
    if (this.elem) {
      (this.pageHelper as HTMLElement).remove();
      this.pageHelper = null;
      this.elem.removeEventListener("scroll", onscroll);
      this.elem.removeEventListener("click", onclick);
      this.elem.remove();
      this.elem = null;
    }
    // 销毁pdf.js相关的变量
    (this.dc as PDFDocumentProxy).destroy();
    this.dc = null;
    this.pdfTask = null;
  }
}

function onclick(e: MouseEvent) {
  const eventPath = getEventPath(e);
  const pvElem = eventPath.filter((item: HTMLElement) => {
    return item.className === CLASS_NAME;
  })[0];
  if (!pvElem) {
    return;
  }
  const pv = pvElem["pv"];
  if (!pv.eventHandler.hasListener(EVENTS.HIGHLIGHT_CLICK)) {
    return;
  }
  if (
    eventPath.some(
      (elem) => elem instanceof HTMLElement && elem.hasAttribute("data-page")
    )
  ) {
    let x = e.offsetX;
    let y = e.offsetY;
    let page = 0;
    for (let i = 0; i < eventPath.length; i++) {
      const elem = eventPath[i];
      if (elem instanceof HTMLElement && elem.hasAttribute("data-page")) {
        // @ts-ignore
        page = +elem.getAttribute("data-page");
        break;
      } else {
        x += elem.offsetLeft;
        y += elem.offsetTop;
      }
    }
    const highlights = pv.pages[page - 1].getHighlightsByPoint(x, y);
    if (highlights.length > 0) {
      pv.eventHandler.trigger(
        EVENTS.HIGHLIGHT_CLICK,
        new PVHighlightClickEvent(e, pv, highlights)
      );
    }
  }
}

function onscroll(e: Event) {
  const pvElem = e.target as HTMLElement;
  // @ts-ignore
  const pv = pvElem["pv"];
  if (pv.renderTimer) {
    clearTimeout(pv.renderTimer);
    pv.renderTimer = null;
  }
  pv.renderTimer = setTimeout(() => {
    pv._render();
  }, 50);
  pv.eventHandler.trigger(
    EVENTS.SCROLL,
    new PVScrollEvent(pv, pvElem["scrollTop"], pvElem["scrollLeft"])
  );
}
