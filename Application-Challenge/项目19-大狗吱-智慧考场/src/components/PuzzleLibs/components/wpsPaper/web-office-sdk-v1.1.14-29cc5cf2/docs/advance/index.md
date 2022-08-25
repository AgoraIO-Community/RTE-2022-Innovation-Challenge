# 高级用法

js-sdk除了提供基础的文档配置，还提供了高级API来直接操作文档，接口风格与`VBA`一致，原则上兼容`VBA`的接口和参数，以下是高级API通用调用流程。

> 文档中的demo对象是指js-sdk实例化后的对象，具体请看[快速开始 > 初始化](../base/quick-start.md?id=第三步：-初始化)篇。

### 第一步：等待ready

!> `ready()`完成之后再调用高级api

```javascript
await demo.ready() // 一定等待demo ready之后再调用高级api
```



### 第二步：取到文档类型应用对象

```javascript
// 文字
const wordApp = demo.WordApplication()
// 表格
const excelApp = demo.ExcelApplication()
// 演示
const pptApp = demo.PPTApplication()
// PDF
const pdfApp = demo.PDFApplication()

// 自动识别
const app = demo.Application
```

> 温馨提醒： 可以根据 `WordApplication`, `ExcelApplication`, `PPTApplication`,`PDFApplication` 来判断当前是什么文档类型

### 第三步：使用高级API

下面以文字导出PDF为例
```javascript
  // 文字导出PDF
  async function exportPdf() {
    await wordApp.ActiveDocument.ExportAsFixedFormat()
  }
```

!> 如果需要大量使用高级API，请认真阅读 [注意事项](./warn.md) 篇
