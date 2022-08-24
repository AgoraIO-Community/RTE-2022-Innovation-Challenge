# InlineShape.ConvertToShape 方法
            
---

## 语法

### 表达式.ConvertToShape

表达式必选。一个代表`InlineShape`对象的变量。

## 说明

使用`ConvertToShape`方法前，最少应该已经对`FreeformBuilder`对象用过一次`AddNodes`方法。

## 示例

本示例将活动文档的第一个嵌入式图形转化为浮动的图形。

```javascript
ActiveDocument.InlineShapes.Item(1).ConvertToShape()
```
