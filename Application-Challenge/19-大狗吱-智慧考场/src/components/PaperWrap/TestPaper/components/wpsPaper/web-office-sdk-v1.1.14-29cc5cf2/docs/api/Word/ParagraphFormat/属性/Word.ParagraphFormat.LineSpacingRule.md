# ParagraphFormat.LineSpacingRule 属性
            
---

## 语法

### 表达式.LineSpacingRule

表达式必选。一个代表`ParagraphFormat`对象的变量。

## 说明

使用`wdLineSpaceSingle`、`wdLineSpace1pt5`或`wdLineSpaceDouble`可将行距设置为这些值之一。要将行距设置为固定磅值或多倍行距，还必须设置`LineSpacing`属性。

## 示例

以下示例为活动文档的第一段设置2倍行距。

```javascript
ActiveDocument.Paragraphs.Item(1).LineSpacingRule = wdLineSpaceDouble
```

以下示例返回所选内容的第一段所用的行距标准。

```javascript
let lrule = Selection.Paragraphs.Item(1).LineSpacingRule
```
