# pdf-viewer
![npm](https://img.shields.io/npm/v/web-pdf-viewer)
![pdf.js](https://img.shields.io/badge/dependency-mozilla%2Fpdf.js-green)
![browsers](https://img.shields.io/badge/Browsers-Chrome%2C%20IE11%2C%20Edge%2C%20Safari%2C%20Firefox-brightgreen)

PDF viewer for web base on [pdf.js](https://github.com/mozilla/pdf.js).

### Usage
###### Step1
复制node_modules/web-pdf-viewer/cmaps目录到项目的公共目录中
###### Step2
````
import {PDFViewer} from 'web-pdf-viewer';

const pv = new PDFViewer({
  cmaps: {Step1中cmaps的url路径}
});
pv.addEventListener('load', (e) => {...});
pv.destroy();
````

### `PDFViewer`参数
参数                 |类型                       | 是否必填  |  描述
--------------------|---------------------------|----------|-------------------
container           | HTMLElement               | N        |  容器元素（可选）
url                 | String                    | N        | pdf文件url。与data、file参数必须有一个作为pdf文件数据源
data                | TypedArray,Array,String   | N        | pdf二进制数据。使用Uint8Array改善内存使用；如果是base64编码，使用atob()转化为二进制字符串
file                | File                      | N        | 用户选择文件时可使用该参数
gap                 | Number                    | N        | container的左右间隙
cmaps               | String                    | N        | 字符文件url
isRenderText        | Boolean                   | N        | 是否渲染文字层（文字层用于鼠标拖动选择选择文字）
containerBackground | String                    | N        | 背景颜色
borderStyle         | String                    | N        | 边框颜色
logTitle            | String                    | N        | 日志前缀
pdfjsParams         | Object                    | N        | pdf.js的`pdfjsLib.getDocument`的参数


### 接口
* `PDFViewer.prototype.addEventListener(eventName: String, handler: Function)`监听事件
* `PDFViewer.prototype.removeEventListener(eventName: String, handler: Function)`移除事件监听。destroy后会自动移除，无须手动移除
* `PDFViewer.prototype.getPDFInfo(): Object`获取pdf文档信息
* `PDFViewer.prototype.scrollTo(page: Number, pageTop: Number, cb?: Function)`滚动到第{page}页的{pageTop}px
* `PDFViewer.prototype.highlight(page: Number, x: Number, y: Number, w: Number, h: Number, highlightClass?: String'): String`设置高亮标注，返回一个id
* `PDFViewer.prototype.removeHighlight(page: number, id: String)`删除高亮标注。如果不传id，则删除所有标注
* `PDFViewer.prototype.highlightFocus(page, id, highlightFocusClass?: String')`聚焦高亮标注
* `PDFViewer.prototype.highlightBlur(page, id)`高亮标注失去焦点
* `PDFViewer.prototype.renderPage(page: Number, width: Number, cb: (canvas) => {}, devicePixelCompatible = true)`渲染一个页面
* `PDFViewer.prototype.resize(width?: number)`重置pdf页面宽度。不传参数则与container宽度一致
* `PDFViewer.prototype.destroy()`销毁实例

### 事件
> online - 渲染页面时可用<br>
> offline - 不需渲染页面时可用<br>
> both - 都可用

* `load`PDFViewer加载数据完成 (both)
````
class PVLoadEvent {
    pv: PDFViewer;
}
````
* `pagechange`滚动时页数变化 (online)
````
class PVPageChangeEvent {
    pv: PDFViewer;
    page: number;
    totalPages: number;
}
````
* `highlightclick`点击高亮区域 (online)
````
type highlightList = Array<{page: number, id: Symbol}>;

class PVHighlightClickEvent {
    pv: PDFViewer;
    highlights: highlightList;

    stopPropagation() {}
}
````
* `pageresize`页面尺寸变化 (online)
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
* `scroll`页面滚动 (online)
````
class PVScrollEvent {
    pv: PDFViewer;
    scrollTop: number;
    scrollLeft: number;
}
````

### Changelog
[changelog](https://github.com/yinliguo/pdf-viewer/blob/master/CHANGELOG.md)

### TODO
