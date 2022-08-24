# Columns.Add 方法
            
---

## 语法

### 表达式.Add(BeforeColumn)

表达式必选。一个代表`Columns`集合的变量。

## 参数

|名称|必选/可选|数据类型|说明|
|-|-|-|-|
|BeforeColumn|可选|Variant|代表将会直接显示在新列右侧的 Column 对象。|

## 返回值Column

## 示例

本示例在活动文档中创建一个有两行两列的表格，然后在第一列之前添加一列。新列的宽度设为1.5英寸。

```javascript
function AddATable(){
    let myTable = ActiveDocument.Tables.Add(Selection.Range, 2, 2)
    let newCol = myTable.Columns.Add(myTable.Columns.Item(1))
        newCol.SetWidth(InchesToPoints(1.5), wdAdjustNone)
}
```
