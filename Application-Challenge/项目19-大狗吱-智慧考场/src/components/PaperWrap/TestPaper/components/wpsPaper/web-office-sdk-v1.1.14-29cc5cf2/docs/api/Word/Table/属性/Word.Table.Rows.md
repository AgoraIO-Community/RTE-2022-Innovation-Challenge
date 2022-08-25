# Table.Rows 属性
            
---

## 语法

### 表达式.Rows

表达式一个代表`Table`对象的变量。

## 说明

有关返回集合中单个成员的信息，请参阅返回集合中的对象。

## 示例

以下示例删除活动文档第一个表格的第二行。

```javascript
ActiveDocument.Tables.Item(1).Rows.Item(2).Delete()
```
