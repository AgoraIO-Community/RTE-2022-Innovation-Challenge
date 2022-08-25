# Zoom.PageFit 属性
            
---

## 语法

### 表达式.PageFit

表达式必选。一个代表`Zoom`对象的变量。

## 说明

如果文档不在页面视图内，则### wdPageFitFullPage常量无效。

如果将`PageFit`属性设置为`wdPageFitBestFit`，则在每次改变文档窗口的大小时，都将自动重新计算显示比例。如果该属性设置为`wdPageFitNone`，则在改变文档窗口的大小时，不会重新计算显示比例。

## 示例

本示例更改Letter.doc的窗口的显示比例，以便可查看整个文本宽度的范围。

```javascript
let view = Windows.Item("Letter.doc").View
    view.Type = wdNormalView
    view.Zoom.PageFit = wdPageFitBestFit
```

本示例将活动窗口切换到页面视图并更改显示比例，以便可查看整页。

```javascript
let view = ActiveDocument.ActiveWindow.View
    view.Type = wdPrintView
    view.Zoom.PageFit = wdPageFitFullPage
```
