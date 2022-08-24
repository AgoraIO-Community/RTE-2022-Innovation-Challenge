# Cell.Range 属性
            
---

## 语法

### 表达式.Range

表达式一个代表`Cell`对象的变量。

## 示例

本示例复制第一个表格首行中第一个单元格中的内容。

```javascript
if(ActiveDocument.Tables.Count >= 1) {
    ActiveDocument.Tables.Item(1).Rows.Item(1).Cells.Item(1).Range.Copy()
}
```
