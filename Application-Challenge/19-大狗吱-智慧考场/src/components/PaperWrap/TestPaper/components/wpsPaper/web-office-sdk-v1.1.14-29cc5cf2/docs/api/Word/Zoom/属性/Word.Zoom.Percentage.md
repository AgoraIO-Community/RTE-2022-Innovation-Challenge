# Zoom.Percentage 属性
            
---

## 语法

### 表达式.Percentage

表达式返回`Zoom`对象的表达式。

## 示例

本示例将活动窗口切换到普通视图并将显示比例设置为80%。

```javascript
let view = ActiveDocument.ActiveWindow.View
    view.Type = wdNormalView
    view.Zoom.Percentage = 80
```

本示例将活动窗口的显示比例增加10%。

```javascript
let myZoom = ActiveDocument.ActiveWindow.View.Zoom
myZoom.Percentage = myZoom.Percentage + 10
```
