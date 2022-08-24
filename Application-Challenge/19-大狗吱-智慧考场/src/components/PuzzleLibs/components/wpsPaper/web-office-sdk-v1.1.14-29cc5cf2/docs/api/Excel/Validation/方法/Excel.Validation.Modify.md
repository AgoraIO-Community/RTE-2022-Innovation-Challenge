# Validation.Modify 方法
            
---

## 语法

### 表达式.Modify(Type, AlertStyle, Operator, Formula1, Formula2)

表达式一个代表`Validation`对象的变量。

## 参数

|名称|必选/可选|数据类型|说明|
|-|-|-|-|
|Type|可选|Variant|一个代表有效性验证类型的 XlDVType 值。|
|AlertStyle|可选|Variant|一个代表有效性验证警告样式的 XlDVAlertStyle 值。|
|Operator|可选|Variant|一个代表数据有效性验证运算符的 XlFormatConditionOperator 值。|
|Formula1|可选|Variant|数据有效性验证等式中的第一部分。|
|Formula2|可选|Variant|当 Operator 为 xlBetween 或 xlNotBetween 时，数据有效性的第二部分；其他情况下，此参数被忽略。|

## 说明

### Modify方法所要求的参数依有效性验证的类型而定，如下表所示。

|有效性验证类型|参数|
|-|-|
|xlInputOnly|不使用 AlertStyle、Formula1 和 Formula2。|
|xlValidateCustom|Formula1 必需，忽略 Formula2。Formula1 必须包含一个表达式，数据项有效时该表达式的值为 True，数据项无效时，该值为 False。|
|xlValidateList|Formula1 必需，忽略 Formula2。Formula1 必须包含一个以逗号分隔的值列表，或对该列表的工作表引用。|
|xlValidateDate、xlValidateDecimal、xlValidateTextLength、 xlValidateTime 或 xlValidateWholeNumber|必须指定 Formula1 或 Formula2，或两者均指定。|

## 示例

本示例更改单元格E5的数据有效性验证。

```javascript
Range("e5").Validation.Modify(xlValidateList, xlValidAlertStop, xlBetween, "=$A$1:$A$10")
```
