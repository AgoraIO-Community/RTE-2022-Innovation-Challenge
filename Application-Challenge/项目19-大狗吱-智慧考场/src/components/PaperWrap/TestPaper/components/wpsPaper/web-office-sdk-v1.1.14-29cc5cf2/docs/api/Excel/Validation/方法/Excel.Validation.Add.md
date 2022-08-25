# Validation.Add 方法
            
---

## 语法

### 表达式.Add(Type, AlertStyle, Operator, Formula1, Formula2)

表达式一个代表`Validation`对象的变量。

## 参数

|名称|必选/可选|数据类型|说明|
|-|-|-|-|
|Type|必选|XlDVType|有效性验证类型。|
|AlertStyle|可选|Variant|有效性验证警告的样式。可为以下 XlDVAlertStyle 常量之一：xlValidAlertInformation、xlValidAlertStop 或 xlValidAlertWarning。|
|Operator|可选|Variant|数据有效性验证运算符。可为以下 XlFormatConditionOperator 常量之一：xlBetween、xlEqual、xlGreater、xlGreaterEqual、xlLess、xlLessEqual、xlNotBetween 或 xlNotEqual。|
|Formula1|可选|Variant|数据有效性验证等式中的第一部分。|
|Formula2|可选|Variant|当 Operator 为 xlBetween 或 xlNotBetween 时，数据有效性验证等式的第二部分（其他情况下，此参数被忽略）。|

## 说明

### Add方法所要求的参数依有效性验证的类型而定，如下表所示。

|有效性验证类型|参数|
|-|-|
|xlValidateCustom|Formula1 必需，忽略 Formula2。Formula1 必须包含一个表达式，数据项有效时该表达式的值为 True，数据项无效时，该值为 False。|
|xlInputOnly|使用 AlertStyle、Formula1 或 Formula2。|
|xlValidateList|Formula1 必需，忽略 Formula2。Formula1 必须包含以逗号分隔的值列表，或对该列表的工作表引用。|
|xlValidateWholeNumber、xlValidateDate、xlValidateDecimal、xlValidateTextLength 或 xlValidateTime|必须指定 Formula1 或 Formula2 之一，或两者均指定。|

## 示例

本示例向单元格E5添加数据有效性验证。

```javascript
let rng = Range("e5").Validation
rng.Add(xlValidateWholeNumber,  xlValidAlertStop, xlBetween, "5", "10")
rng.InputTitle = "Integers"
rng.ErrorTitle = "Integers"
rng.InputMessage = "Enter an integer from five to ten"
rng.ErrorMessage = "You must enter a number from five to ten"
```
