# 窗口缩放相关

## 以正常大小的百分比形式返回或设置指定视图的缩放设置。 读/写

> 最低支持版本 v1.1.3

读：

```javascript
  /*
  * @return: number
  */
  await demo.PPTApplication().ActivePresentation.View.Zoom
```

写：

* 备注(缩放属性值在10%到 400%之间。)

```js
/*
  * @param : 10 <= number <= 400
  */
  demo.PPTApplication().ActivePresentation.View.Zoom = 10
```

## 确定每当对文档窗口大小进行调整后，是否缩放视图以适应文档窗口的尺寸

> 最低支持版本 v1.1.3

```js
  /*
    Enum: {
      ZoomToFitType: {
          msoFalse: 0, // 对文档窗口大小进行调整后不为适应文档窗口尺寸而缩放视图。
          msoTrue: -1 // 对文档窗口大小进行调整后缩放视图以适应文档窗口尺寸。
      }
    }
  */
  demo.PPTApplication().ActivePresentation.View.ZoomToFit = -1
```