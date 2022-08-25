# 内容控件

## 获取文档内容控件的数量

```javascript
  /*
  * @return: number
  */
  let ContentControlsCount = await demo.WordApplication().ActiveDocument.ContentControls.Count
```

## 获取内容控件指定属性(Title, Tag, PlaceholderText)

```javascript
  /*
  * @return: string
  */
  // 获取第一个控件的指定属性
  const contentControl = await demo.WordApplication().ActiveDocument.ContentControls.Item(1)
  // 获取Title
  let contentTitle = await contentControl.Title
  // 获取Tag
  let contentTag = await contentControl.Tag
  // 获取PlaceholderText
  let contentPlaceholderText = await contentControl.PlaceholderText
```

## 设置内容控件指定属性(Title, Tag, PlaceholderText)

```javascript
  /*
  * @param: string
  */
  const text = 'webOffice demo'
  // 设置第一个控件的指定属性
  const contentControl = await demo.WordApplication().ActiveDocument.ContentControls.Item(1)
  contentControl.Title = text
  contentControl.Tag = text
  contentControl.SetPlaceholderText({Text: text})
```
