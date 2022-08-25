# Font.ColorIndex 属性
            
---

## 语法

### 表达式.ColorIndex

表达式必选。一个代表`Font`对象的变量。

## 说明

### wdByAuthor常量不是有效的字体颜色。

## 示例

本示例更改活动文档首段的文字颜色。

```javascript
ActiveDocument.Paragraphs.Item(1).Range.Font.ColorIndex = wdGreen
```

本示例将所选文本的格式设置为红色。

```javascript
Selection.Font.ColorIndex = wdRed
```
