# Range.ParagraphFormat 属性
            
---

## 语法

### 表达式.ParagraphFormat

表达式一个代表`Range`对象的变量。

## 示例

本示例对包含MyDoc.doc所有内容的有关范围设置段落格式：2倍行距，并且在0.25英寸的位置设置一个自定义制表位。

```javascript
let myRange = Documents.Item("MyDoc.doc").Content
let myPFormat = myRange.ParagraphFormat
    myPFormat.Space2()
    myPFormat.TabStops.Add(InchesToPoints(.25))
```
