# Borders.Item 属性
            
---

## 语法

### 表达式.Item(Index)

表达式一个代表`Borders`对象的变量。

## 参数

|名称|必选/可选|数据类型|说明|
|-|-|-|-|
|Index|必选|XlBordersIndex|XlBordersIndex 的常量之一。|

## 说明

|XlBordersIndex 可为下列 XlBordersIndex 常量之一。|
|-|
|xlDiagonalDown|
|xlDiagonalUp|
|xlEdgeBottom|
|xlEdgeLeft|
|xlEdgeRight|
|xlEdgeTop|
|xlInsideHorizontal|
|xlInsideVertical|

## 示例

下例设置单元格区域A1:G1的底部边界的颜色。

```javascript
Worksheets.Item("Sheet1").Range("a1:g1").Borders.Item(xlEdgeBottom).Color = (255, 0, 0)
```
