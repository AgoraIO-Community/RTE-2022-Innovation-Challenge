# 窗口缩放相关

## 以正常大小的百分比形式返回或设置指定视图的缩放设置。 读/写
> 最低支持版本 v1.1.3

读：

```javascript
  /*
  * @return: number
  */
  await demo.WordApplication().ActiveDocument.ActiveWindow.View.Zoom.Percentage
```

写：

* 备注(缩放属性值在50%到 300%之间。)

```js
/*
  * @param : 50 <= number <= 300
  */
  demo.WordApplication().ActiveDocument.ActiveWindow.View.Zoom.Percentage = 100
```

## 确定每当对文档窗口大小进行调整后，是否缩放视图以适应文档窗口的尺寸
> 最低支持版本 v1.1.3

```js
  /*
    Enum: {
      PageFitType: {
        wdPageFitBestFit: 2, 文档窗口大小进行调整后使页面以最佳尺寸适应活动窗口
        wdPageFitNone: 0  对文档窗口大小进行调整后不为适应文档窗口尺寸而缩放视图
      }
    }
  */
  demo.WordApplication().ActiveDocument.ActiveWindow.View.Zoom.PageFit = 2
```