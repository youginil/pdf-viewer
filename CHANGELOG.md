# Changelog
### v2.1.2
* PDFViewer修改为默认导出，引入时`import PDFViewer from 'web-pdf-viewer'`
* 去掉PDFViewer的debug选项
* PDFViewer增加选项logLevel: 1 - debug; 2 - info; 3 - warn; 4 - error
### v2.0.1
* Lock pdfjs's version（重要升级，避免pdfjs-dist版本升级导致本库无法使用）
### v2.0.0
* `highlight({page: number, x: number, y: number, w: number, h: number, highlightClass?: string', attrs: {[key: string]: string}}): string`修改highlight方法参数为对象格式，并加入`attrs`参数用于传递节点属性

### v1.3.0
* `PVHighlightClickEvent`加入`stopPropagation()`方法用于禁止冒泡

### v1.2.0
* PDFViewer加入参数`logTitle`，可以传入字符串用来标志日志属于哪个文件，在同时运行多个实例时方便看区分日志
* PDFViewer加入参数`pdfjsParams`，用于传入pdf.js的`pdfjsLib.getDocument`参数，可以自定义很多东西，比如http header。

### v1.1.3
* 修改引入方式。直接引入npm包，无须引入css文件和设置container的类名pjs-pdf-viewer，只需要引入这个包即可。建议在实例化时需要传递cmaps参数
* 规范事件名。`onload`改为`load`，`onpagechange`改为`pagechange`；传给回调函数的参数也改成SomeEvent对象，与原生事件语法一致且具有可扩展性
* 修改PDFViewer.prototype.resize(width?: number)参数，去掉了百分比的支持，参数为可选，不传则表示适配container的宽度
* 加入`scroll`事件

### v1.0.8
* 调整容器宽度的方式由修改container.style.width变为接口PDFViewer.prototype.resize(width: Number|String)，可以接收百分比或数字（像素）
* 增加pageresize事件。回调函数接收{[pageNumber]: {w: 100, h: 100}}
* 在没有点击到高亮时，不再触发highlightclick事件
* PDFViewer.prototype.getPDFInfo()方法返回对象中加入pageGap字段表示页面之间的空隙（px）
* 修复点击高亮不准确的问题（由判断在高亮区域改为高亮元素的区域，但没解决伪元素的点击问题）
* 修复没有处理页面旋转的问题

### v1.0.7
* 修复页数计算问题
* PDFViewer属性设置为私有，避免直接使用（只能调用非下划线开头的方法）

### v1.0.6
* PDFViewer.prototype.scrollTo加入滚动后结束后的回调函数

### v1.0.5
* 加了highlightclick事件，返给回调函数的参数为[{page: 1, id: 'abc'}]

### v1.0.4
* 修改`PDFViewer.prototype.highlight(page, x, y, w, h, color)`为`highlight(page, x, y, w, h, highlightClass = 'pdf-highlight')`。可以传递自定义的高亮样式名，注意不能修改尺寸和z-index
* 新增2个方法。`PDFViewer.prototype.highlightFocus(page, id, highlightFocusClass = 'pdf-highlight-focus')`、`PDFViewer.prototype.highlightBlur(page, id)`，分别用于聚焦/取消聚焦高亮标注

### v1.0.3
* PDFViewer构造函数中的参数cMapUrl和cMapPacked。因为这两个参数对正确渲染pdf是必须，因此不需要每次传递，而在代码中写死
* PDFViewer构造函数增加file参数，传递File对象。因为页面中选择本地pdf文件进行展示的需求很强，每次都需要将选择的File文件进行转换才能作为url或data参数传递进去，所以做成参数
* 增加接口PDFViewer.prototype.getPDFInfo(): Object，可以获取PDF的信息

### v1.0.2
* 修复container尺寸变化过快导致pdf页面尺寸无法准确适应的问题
* 优化高亮区域颜色显示。优先使用mix-blend-mode: darken，不支持则退回opacity: .3

### v1.0.1
* PDFViewer构造方法去掉了scrollElements参数，取而代之的是必须指定container的高度
* PDFViewer.onReady方法修改为onload事件，通过PDFViewer.addEventListener('onload', cb)来替换
* 增加了onpagechange事件，通过PDFViewer.addEventListener('onpagechange', cb(pageNum))来注册
* 增加了PDFViewer.removeEventListener(eventName, cb)来取消事件监听
* 删除了PDFViewer.status方法
