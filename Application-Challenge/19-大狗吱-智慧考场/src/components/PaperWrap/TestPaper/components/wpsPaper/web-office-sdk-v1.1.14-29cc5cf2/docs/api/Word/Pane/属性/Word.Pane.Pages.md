# Pane.Pages 属性
            
---

## 语法

### 表达式.Pages

表达式返回`Pane`对象的表达式。

## 示例

下列示例从活动文档左上角0.5英寸处穿过页面向页面右下角（距页面右边缘和下边缘0.5英寸处）创建一条线。

```javascript
let objPage = ActiveDocument.ActiveWindow.Panes.Item(1).Pages.Item(1)

//Add new line to document
ActiveDocument.Shapes.AddLine(InchesToPoints(0.5), InchesToPoints(0.5), objPage.Width - InchesToPoints(0.5), objPage.Height - InchesToPoints(0.5))
```
