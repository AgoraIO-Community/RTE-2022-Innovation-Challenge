# Tables.Add 方法
            
---

## 语法

### 表达式.Add(Range, NumRows, NumColumns, DefaultTableBehavior, AutoFitBehavior)

表达式必选。一个代表`Tables`集合的变量。

## 参数

|名称|必选/可选|数据类型|说明|
|-|-|-|-|
|Range|必选|Range object|表格出现的区域。如果该区域未折叠，表格将替换该区域。|
|NumRows|必选|Long|要在表格中包括的行数。|
|NumColumns|必选|Long|要在表格中包括的列数。|
|DefaultTableBehavior|可选|Variant|设置一个值来指定 WPS 是否要根据单元格的内容自动调整表格单元格的大小（“自动调整”功能）。可以是下列常量之一： wdWord8TableBehavior（禁用“自动调整”功能）或 wdWord9TableBehavior（启用“自动调整”功能）。默认常量为 wdWord8TableBehavior。|
|AutoFitBehavior|可选|Variant|用于设置 WPS 调整表格大小的“自动调整”规则。可以为一个 WdAutoFitBehavior 常量。|

## 返回值Table
