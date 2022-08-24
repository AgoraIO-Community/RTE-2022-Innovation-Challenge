# FormatConditions.Add 方法
            
---

## 语法

### 表达式.Add(Type, Operator, Formula1, Formula2)

表达式一个代表`FormatConditions`对象的变量。

## 参数

|名称|必选/可选|数据类型|说明|
|-|-|-|-|
|Type|必选|XlFormatConditionType|指定条件格式是基于单元格值还是基于表达式。|
|Operator|可选|Variant|条件格式运算符。可为以下 XlFormatConditionOperator 常量之一：xlBetween、xlEqual、xlGreater、xlGreaterEqual、xlLess、xlLessEqual、xlNotBetween 或 xlNotEqual。如果 Type 为 xlExpression，则忽略 Operator 参数。|
|Formula1|可选|Variant|与条件格式相关联的值或表达式。可为常量值、字符串值、单元格引用或公式。|
|Formula2|可选|Variant|当 Operator 为 xlBetween 或 xlNotBetween 时，它是与条件格式第二部分相关联的值或表达式（否则忽略该参数）。可为常量值、字符串值、单元格引用或公式。|

## 返回值

一个`FormatCondition`对象，它代表新的条件格式。

## 说明

对单个区域定义的条件格式不能超过三个。使用`Modify`方法可修改现有的条件格式，使用`Delete`方法可在添加新条件格式前删除现有的格式。

## 示例

本示例向单元格区域E1:E10中添加条件格式。

```javascript
let range2 = Worksheets.Item(1).Range("e1:e10").FormatConditions.Add(xlCellValue, xlGreater, "=$a$1")
    let range3 = range2.Borders
        range3.LineStyle = xlContinuous
        range3.Weight = xlThin
        range3.ColorIndex = 6
    let range4 = range2.Font
        range4.Bold = true
        range4.ColorIndex = 3
```
