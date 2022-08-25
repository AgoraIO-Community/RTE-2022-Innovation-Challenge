# Table.Borders 属性
            
---

## 语法

### 表达式.Borders

表达式必选。一个代表`Table`对象的变量。

## 说明

有关返回集合中单个成员的信息，请参阅返回集合中的对象。

## 示例

本示例对活动文档中的第一个表格应用内部和外部边框。

```javascript
let myTable = ActiveDocument.Tables.Item(1)

myTable.Borders.InsideLineStyle = wdLineStyleSingle
myTable.Borders.OutsideLineStyle = wdLineStyleDouble
```
