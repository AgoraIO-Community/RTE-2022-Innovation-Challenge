# Range.Font 属性
            
---

## 语法

### 表达式.Font

表达式一个代表`Range`对象的变量。

## 说明

要设置该属性，需指定一个返回### Font对象的表达式。

## 示例

本示例将取消活动文档的“标题1”样式中的加粗格式。

```javascript
ActiveDocument.Styles.Item(wdStyleHeading1).Font.Bold = false
```

本示例在Arial和TimesNewRoman之间切换活动文档中第二段的字体。

```javascript
let myRange = ActiveDocument.Paragraphs.Item(2).Range
if(myRange.Font.Name == "Times New Roman"){
    myRange.Font.Name = "Arial"
}
else{
    myRange.Font.Name = "Times New Roman"
}
```
