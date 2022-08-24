# Range.End 属性
            
---

## 语法

### 表达式.End

表达式一个代表`Range`对象的变量。

## 说明

`Range`对象均包含开始位置和结束位置。结束位置是距文档开头部分最远的点。如果该属性的设置值小于`Start`属性值，则`Start`属性将设为同一值（即`Start`与`End`属性值相等）。

该属性返回结束字符相对于文档开头部分的位置。文档主体部分(### wdMainTextStory)的起始字符位置为0（零）。设置该属性可以改变选定内容、区域或者书签的大小。

## 示例

本示例将myRange的结束位置移动一个字符。

```javascript
let myRange = ActiveDocument.Paragraphs.Item(1).Range
myRange.End = myRange.End - 1
```
