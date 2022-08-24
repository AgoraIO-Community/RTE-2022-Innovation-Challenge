# Rows.Add 方法
            
---

## 语法

### 表达式.Add(BeforeRow)

表达式必选。一个代表`Rows`集合的变量。

## 参数

|名称|必选/可选|数据类型|说明|
|-|-|-|-|
|BeforeRow|可选|Variant|代表将显示在新行正下方的行的 Row 对象。|

## 返回值Row

## 示例

本示例在选定内容的第一行之前插入一个新行。

```javascript
function AddARow() {
    if(Selection.Information(wdWithInTable)) {
        Selection.Rows.Add(Selection.Rows.Item(1))
    }
}
```

本示例在第一张表中添加一行，然后将文本Cell插入该行。

```javascript
function CountCells() {
    let intCount = 1
    let tblNew = ActiveDocument.Tables.Item(1)
    let rowNew = tblNew.Rows.Add(tblNew.Rows.Item(1))
    for(let celTable = 1; celTable <= rowNew.Cells.Count; celTable++) {
        rowNew.Cells.Item(celTable).Range.InsertAfter("Cell " + intCount)
        intCount = intCount + 1 
    }
}
```
