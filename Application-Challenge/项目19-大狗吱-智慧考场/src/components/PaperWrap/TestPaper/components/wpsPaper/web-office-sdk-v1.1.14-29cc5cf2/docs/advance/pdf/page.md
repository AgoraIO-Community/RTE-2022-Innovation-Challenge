# 获取页码、跳转页

## 获取总页数

```javascript
  /*
  * @return: number
  */
  let totalPages = await demo.PDFApplication().ActivePDF.PagesCount
```

## 获取当前页

```javascript
  /*
  * @return: number
  */
  let totalPages = await demo.PDFApplication().ActivePDF.CurrentPage
```

## 跳转到相应页

```javascript
  /*
  * @param : { PageNum: number }
  */
  let PageNum = 10
  await demo.PDFApplication().ActivePDF.JumpToPage({PageNum})
```

## 当前页改变事件

```javascript
  function eventHandle() {
    // do something
  }
  // 监听
  demo.PDFApplication().Sub.CurrentPageChange = eventHandle
  // 销毁
  demo.PDFApplication().Sub.CurrentPageChange = null
```