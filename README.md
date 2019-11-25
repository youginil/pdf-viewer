# pdf-viewer

PDF viewer for web.

### Usage
````
import {PDFViewer} from 'web-pdf-viewer';

const pv = new PDFViewer({...});
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
* `PDFViewer.prototype.rerender()`重新渲染页面。可用于容器尺寸变化后重新渲染
* `PDFViewer.prototype.destroy()`销毁实例

### 事件
* `load`PDFViewer加载数据完成
* `pagechange`滚动时页数变化
* `highlightclick`点击高亮区域
* `pageresize`页面尺寸变化 ({[pageNumber]: {w: 100, h: 100}}) => {}
