# ParagraphFormat.CharacterUnitFirstLineIndent 属性
            
---

## 语法

### 表达式.CharacterUnitFirstLineIndent

表达式必选。一个代表`ParagraphFormat`对象的变量。

## 示例

本示例将活动文档中第一段的首行缩进设为一个字符。

```javascript
ActiveDocument.Paragraphs.Item(1).CharacterUnitFirstLineIndent = 1
```

本示例将活动文档中第二段的悬挂缩进设为1.5个字符。

```javascript
ActiveDocument.Paragraphs.Item(2).CharacterUnitFirstLineIndent = -1.5
```
