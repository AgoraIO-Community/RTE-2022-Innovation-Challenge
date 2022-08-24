# Window.DocumentMap 属性
            
---

## 语法

### 表达式.DocumentMap

表达式一个代表`Window`对象的变量。

## 示例

本示例切换活动窗口的文档结构图的显示。

```javascript
ActiveDocument.ActiveWindow.DocumentMap = !ActiveDocument.ActiveWindow.DocumentMap
```

本示例显示Sales.doc窗口的文档结构图。

```javascript
let docSales = Documents.Open("C:\\Documents\\Sales.doc")
docSales.ActiveWindow.DocumentMap = true
```
