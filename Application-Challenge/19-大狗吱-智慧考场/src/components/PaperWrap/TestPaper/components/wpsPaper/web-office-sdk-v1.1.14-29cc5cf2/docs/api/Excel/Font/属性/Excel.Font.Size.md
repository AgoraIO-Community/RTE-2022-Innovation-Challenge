# Font.Size 属性
            
---

## 语法

### 表达式.Size

表达式一个代表`Font`对象的变量。

## 示例

本示例将Sheet1的A1:D10单元格的字体大小设为12磅。

```javascript
let size = Worksheets.Item("Sheet1").Range("A1:D10")
size.Value2 = "Test"
size.Font.Size = 12
```
