# Column.SetWidth 方法
            
---

## 语法

### 表达式.SetWidth(ColumnWidth, RulerStyle)

表达式必选。一个代表`Column`对象的变量。

## 参数

|名称|必选/可选|数据类型|说明|
|-|-|-|-|
|ColumnWidth|必选|Single|指定列的宽度，以磅为单位。|
|RulerStyle|必选|WdRulerStyle|控制 WPS 调整单元格宽度的方式。|

## 说明

上述`WdRulerStyle`行为应用于左对齐的表格。`WdRulerStyle`行为应用于中对齐和右对齐的表格时可能会出现未知效果，因此应谨慎使用`SetWidth`方法。
