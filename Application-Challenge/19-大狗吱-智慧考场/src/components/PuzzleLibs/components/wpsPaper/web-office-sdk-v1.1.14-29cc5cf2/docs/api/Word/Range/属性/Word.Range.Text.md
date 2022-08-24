# Range.Text 属性
            
---

## 语法

### 表达式.Text

表达式一个代表`Range`对象的变量。

## 说明

### Text属性返回该区域的无格式纯文本。如果设置该属性，则将替换该区域中的现有文本。

## 示例

本示例用“Dear”替换活动文档的第一个词。

```javascript
let myRange = ActiveDocument.Words.Item(1)
myRange.Text = "Dear "
```
