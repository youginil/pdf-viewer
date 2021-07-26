# pdf-viewer
![npm](https://img.shields.io/npm/v/web-pdf-viewer)
![pdf.js](https://img.shields.io/badge/dependency-mozilla%2Fpdf.js-green)
![browsers](https://img.shields.io/badge/Browsers-Chrome%2C%20IE11%2C%20Edge%2C%20Safari%2C%20Firefox-brightgreen)

PDF viewer for web base on [pdf.js](https://github.com/mozilla/pdf.js).

### Usage
###### Step1
copy `node_modules/web-pdf-viewer/cmaps` to public directory
###### Step2
````
import PDFViewer from 'web-pdf-viewer';

const pv = new PDFViewer({
  cmaps: {url from step1}
});
pv.addEventListener('load', (e) => {...});
pv.destroy();
````

### `PDFViewer` Option
property            |type                      |required  |description
--------------------|--------------------------|----------|-------------------
container           |HTMLElement               |N         |Container
url                 |string                    |N         |pdf file url
data                |TypedArray,Array,String   |N         |pdf binary data
file                |File                      |N         |Local file
gap                 |number                    |N         |Gap between container and content
cmaps               |string                    |N         |Chars url
isRenderText        |boolean                   |N         |Render text layer
containerBackground |string                    |N         |Container background
borderStyle         |string                    |N         |Border style. '1px solid red'
logTitle            |string                    |N         |Log title for different files
pdfjsParams         |Object                    |N         |Same as parameter of `pdfjsLib.getDocument`


### 接口
* `PDFViewer.prototype.addEventListener(eventName: string, handler: Function)`Add event listener
* `PDFViewer.prototype.removeEventListener(eventName: string, handler: Function)`Remove event listener.
* `PDFViewer.prototype.getPDFInfo(): Object`PDF infomation
* `PDFViewer.prototype.scrollTo(page: number, pageTop: number, cb?: Function)`Scroll
* `PDFViewer.prototype.highlight({page: number, x: number, y: number, w: number, h: number, highlightClass?: string', attrs: {[key: string]: string}}): String`Set highlight
* `PDFViewer.prototype.removeHighlight(page: number, id: String)`Delete highlight. Delete all while id is not passed
* `PDFViewer.prototype.highlightFocus(page: number, id: string, highlightFocusClass?: string')`Focus on highlight area
* `PDFViewer.prototype.highlightBlur(page, id)`Highlight area blur
* `PDFViewer.prototype.renderPage(page: number, width: number, cb: (canvas) => {}, devicePixelCompatible = true)`Render one page
* `PDFViewer.prototype.resize(width?: number)`Resize page width.
* `PDFViewer.prototype.destroy()`Destroy instance

### 事件
> online - Rendered on page<br>
> offline - Rendered offline<br>
> both - Both online and offline

* `load`PDFViewer is ready (both)
````
class PVLoadEvent {
    pv: PDFViewer;
}
````
* `pagechange`Page changed (online)
````
class PVPageChangeEvent {
    pv: PDFViewer;
    page: number;
    totalPages: number;
}
````
* `highlightclick`Click highlight area (online)
````
type highlightList = Array<{page: number, id: Symbol}>;

class PVHighlightClickEvent {
    pv: PDFViewer;
    highlights: highlightList;

    stopPropagation() {}
}
````
* `pageresize`Page size changed (online)
````
type pageSizes = {
    [prop: number]: {
        w: number
        h: number
    }
};

class PVPageResizeEvent {
    pv: PDFViewer;
    pageSizes: pageSizes;
}
````
* `scroll`Scroll event (online)
````
class PVScrollEvent {
    pv: PDFViewer;
    scrollTop: number;
    scrollLeft: number;
}
````

### Changelog
[changelog](https://github.com/yinliguo/pdf-viewer/blob/master/CHANGELOG.md)
