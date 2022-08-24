# Row.SetHeight 方法
            
---

## 语法

### 表达式.SetHeight(RowHeight, HeightRule)

表达式必选。一个代表`Row`对象的变量。

## 参数

|名称|必选/可选|数据类型|说明|
|-|-|-|-|
|RowHeight|必选|Single|行的高度，以磅为单位。|
|HeightRule|必选|WdRowHeightRule|用于确定指定行的高度的规则。|

## 示例

以下示例创建一张表格，然后将首行的固定行高设置为0.5英寸（36磅）。

```javascript
let newDoc = Documents.Add()
let aTable = newDoc.Tables.Add(Selection.Range, 3, 3)
aTable.Rows.Item(1).SetHeight(InchesToPoints(0.5), wdRowHeightExactly)
```
