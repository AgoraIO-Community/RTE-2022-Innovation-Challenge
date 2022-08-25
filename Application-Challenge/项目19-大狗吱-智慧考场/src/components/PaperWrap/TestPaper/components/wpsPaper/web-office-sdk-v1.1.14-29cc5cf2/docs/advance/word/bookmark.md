# 书签功能

## 获取书签内容

```javascript
  /*
  * @param: string
  * @return: string
  */
  let bookmarkText = await demo.WordApplication().ActiveDocument.GetBookmarkText()
```

## 替换书签

```javascript
  /*
  * @param: {Data: [{name: string, type:'url'|'text', value: string}]}   参数[{书签名，替换成类型, 替换的value}]
  * @return: bool
  */
  let isReplaceSuccess = await demo.WordApplication().ActiveDocument.ReplaceBookmark([{name: '123', type: 'text', value: '234'} ])
```

## 获取所有书签

```javascript
  /*
  * @return: [{begin: string, end: string, name: string}]
  */
  let bookmarks = await demo.WordApplication().ActiveDocument.Bookmarks.Json()
```

## 添加书签

```javascript
  /*
  * @param: { Name: string, Range: { Start: number, End: number } } 必需
  * @return: string
  */
  await demo.WordApplication().ActiveDocument.Bookmarks.Add({Name, Range})
```

## 删除书签

```javascript
  /*
  * @param: { Index: string } 代表单个对象的名称的字符串, 序号位置暂不支持 必需
  * @return: string
  */
  await demo.WordApplication().ActiveDocument.Bookmarks.Item({Index}).Delete()
```

## 跳转到指定的书签

```javascript
 /*
  * @param: { What?: WdGoToItem, Which?: WdGoToDirection.wdGoToAbsolute, Count?: number, Name?: string}
  * Enum: {
  *  WdGoToItem: {
  *      wdGoToBookmark: -1,
  *  }
  *  WdGoToDirection: {
  *      wdGoToAbsolute: 1
  *  }
  * }
  */
  await demo.WordApplication().ActiveDocument.Selection.GoTo(Enum.WdGoToItem.wdGoToBookmark, Enum.WdGoToDirection.wdGoToAbsolute, undefined, 'bookmarkName')
  // 或者
  await demo.WordApplication().ActiveDocument.Selection.GoTo({
    What: Enum.WdGoToItem.wdGoToBookmark,
    Which: Enum.WdGoToDirection.wdGoToAbsolute,
    Name: 'bookmarkName' // 书签名
  })
```
