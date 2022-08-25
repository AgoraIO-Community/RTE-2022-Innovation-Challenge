# View.ZoomToFit 属性
            
---

## 语法

### 表达式.ZoomToFit

表达式一个代表`View`对象的变量。

## 返回值MsoTriState

## 说明

如果明确地设置了`Zoom`属性的值，则`ZoomToFit`属性的值会自动设为`msoFalse`。

|MsoTriState 可以是下列 MsoTriState 常量之一。|
|-|
|msoCTrue|
|msoFalse|
|msoTriStateMixed|
|msoTriStateToggle|
|msoTrue 对文档窗口大小进行调整后缩放视图以适应文档窗口的尺寸。|

## 示例

以下示例将第一个文档窗口的视图设为幻灯片视图，并自动设置为适应该窗口大小。

```javascript
let w = Windows.Item(1)
w.ViewType = ppViewSlide
w.View.ZoomToFit = msoTrue
```
