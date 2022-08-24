# Border.LineStyle 属性
            
---

## 语法

### 表达式.LineStyle

表达式一个代表`Border`对象的变量。

## 说明

`xlDouble`和`xlSlantDashDot`不适用于图表。

## 示例

本示例为Chart1的图表区和绘图区域设置边框。

```javascript
let charts = Charts.Item("Chart1")
charts.ChartArea.Border.LineStyle = xlDashDot
let border = charts.PlotArea.Border
border.LineStyle = xlDashDotDot
border.Weight = xlThick
```
