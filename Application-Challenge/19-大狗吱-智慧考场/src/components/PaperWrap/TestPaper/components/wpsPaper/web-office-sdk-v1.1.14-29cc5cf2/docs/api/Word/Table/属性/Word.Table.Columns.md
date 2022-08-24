# Table.Columns 属性
            
---

## 语法

### 表达式.Columns

表达式一个代表`Table`对象的变量。

## 说明

有关返回集合中单个成员的信息，请参阅返回集合中的对象。

## 示例

本示例显示活动文档的第一个表格中的列数。

```javascript
if(ActiveDocument.Tables.Count >= 1){
    MsgBox(ActiveDocument.Tables.Item(1).Columns.Count)
}
```
