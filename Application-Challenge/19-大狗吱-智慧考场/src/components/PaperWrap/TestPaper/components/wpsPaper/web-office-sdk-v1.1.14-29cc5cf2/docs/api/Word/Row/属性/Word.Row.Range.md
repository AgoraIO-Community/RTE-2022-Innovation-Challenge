# Row.Range 属性
            
---

## 语法

### 表达式.Range

表达式必选。一个代表`Row`对象的变量。

## 示例

以下示例复制表格1中的第一行。

```javascript
if(ActiveDocument.Tables.Count >= 1) {
    ActiveDocument.Tables.Item(1).Rows.Item(1).Range.Copy()
}
```
