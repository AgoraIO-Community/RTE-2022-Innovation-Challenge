# 获取页码、跳转页

为了方便演示，先定义下面需要用到的变量
```javascript
const app = demo.WordApplication()
const {Enum} = app
```

## 获取总页数

```javascript
  /*
  * @param: WdInformation: {
  *      wdNumberOfPagesInDocument: 4
  *  }
  * @return: {PagesCount: number, End: boolean}
  */
  let totalPages = await app.ActiveDocument.Range.Information(Enum.WdInformation.wdNumberOfPagesInDocument)
  if (totalPages.End) {
    console.log("加载完了！一共", totalPages.PagesCount, "页")
  }
```

!> 由于文字文档是流式排版，没办法一开始就确定最终页数，只有浏览到最底部才知道总页数。

## 获取当前页

```javascript
  /*
  * @param: WdInformation: {
  *      wdActiveEndPageNumber: 3
  *  }
  * @return: number
  */
  let currentPage = await app.ActiveDocument.Selection.Information(Enum.WdInformation.wdActiveEndPageNumber)
```

## 跳转到指定页

```javascript
  /*
  * @param: { What?: WdGoToItem, Which?: WdGoToDirection.wdGoToAbsolute, Count?: number, Name?: string}
  * WdGoToItem: {
  *      wdGoToPage: 1,
  *  }
  *  WdGoToDirection: {
  *      wdGoToAbsolute: 1
  *  }
  * @return: number 返回跳转页
  */
  const page = await app.ActiveDocument.Selection.GoTo(Enum.WdGoToItem.wdGoToPage, Enum.WdGoToDirection.wdGoToAbsolute, 10)
  // 或者
  const page = await app.ActiveDocument.Selection.GoTo({
    What: Enum.WdGoToItem.wdGoToPage,
    Which: Enum.WdGoToDirection.wdGoToAbsolute,
    Count: 10
  })
```

!> 由于文字文档是流式排版, 大文档时，跳转时间会比较长，建议加一个中间loading过渡效果。 

## 当前页改变事件

```javascript
  function eventHandle() {
    // do something
  }
  // 监听
  app.Sub.CurrentPageChange = eventHandle
  // 销毁
  app.Sub.CurrentPageChange = null
```

!>  由于文字在移动端和不分页文档下，没有页数这个概念，因此只在pc分页文档有次事件
