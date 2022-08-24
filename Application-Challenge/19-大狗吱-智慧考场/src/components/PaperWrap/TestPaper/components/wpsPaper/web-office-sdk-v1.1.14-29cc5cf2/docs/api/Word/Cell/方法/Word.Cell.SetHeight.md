# Cell.SetHeight 方法
            
---

## 语法

### 表达式.SetHeight(RowHeight, HeightRule)

表达式必选。一个代表`Cell`对象的变量。

## 参数

|名称|必选/可选|数据类型|说明|
|-|-|-|-|
|RowHeight|必选|Variant|一行或多行的高度，以磅为单位。|
|HeightRule|必选|WdRowHeightRule|用于确定指定单元格高度的方法。|

## 说明

设置`Cell`对象的`SetHeight`属性可自动为整行设置该属性。

## 示例

本示例将选定单元格的行高设置为不小于18磅。

```javascript
if(Selection.Information(wdWithInTable) == true) {
    Selection.Cells.SetHeight(18, wdRowHeightAtLeast)
}
else {
    MsgBox("The insertion point is not in a table.")
}
```
