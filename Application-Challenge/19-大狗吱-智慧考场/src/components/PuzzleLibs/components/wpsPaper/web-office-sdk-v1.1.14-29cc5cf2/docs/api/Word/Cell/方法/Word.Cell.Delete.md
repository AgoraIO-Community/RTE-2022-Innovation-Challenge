# Cell.Delete 方法
            
---

## 语法

### 表达式.Delete(ShiftCells)

表达式必选。一个代表`Cell`对象的变量。

## 参数

|名称|必选/可选|数据类型|说明|
|-|-|-|-|
|ShiftCells|可选|Variant|剩余单元格移动的方向。可以是任意 WdDeleteCells 常量。如果省略，最后删除的单元格的右侧单元格向左移动。|

## 示例

本示例删除活动文档中第一个表格中的第一个单元格。

```javascript
function DeleteCells() {
    let intResponse = MsgBox("Are you sure you want to delete the cells?", jsYesNo)
    if(intResponse == jsResultYes) {
        ActiveDocument.Tables.Item(1).Cell(1, 1).Delete()
    }
}
```
