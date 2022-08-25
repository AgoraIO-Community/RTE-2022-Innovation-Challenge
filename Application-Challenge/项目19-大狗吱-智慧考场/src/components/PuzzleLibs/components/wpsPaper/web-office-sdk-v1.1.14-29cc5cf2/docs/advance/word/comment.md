# 评论

## 获取全文评论

```javascript
  /*
  * @param: { Offset: number, Limit: number }
  */
  let operatorsInfo = await demo.WordApplication().ActiveDocument.GetComments({ Offset: 0, Limit: 20 })
```

!> 由于文字文档是流式排版, 在大文档时且Limit - Offset较大时，获取时间时间会比较长，建议加一个中间loading过渡效果。

## 控制评论显示与否
> 最低支持版本 v1.1.3

```javascript
  /*
  * @param: bool
  * true 为显示， false 为隐藏
  */

  // 隐藏评论
  demo.WordApplication().ActiveDocument.ActiveWindow.View.ShowComments = false
```

## 是否有评论
> 最低支持版本 v1.1.3

```javascript
  /*
  * @return: bool
  * true 为有， false 为无
  */
 const hasComments = await demo.WordApplication().ActiveDocument.HasComments()
```
