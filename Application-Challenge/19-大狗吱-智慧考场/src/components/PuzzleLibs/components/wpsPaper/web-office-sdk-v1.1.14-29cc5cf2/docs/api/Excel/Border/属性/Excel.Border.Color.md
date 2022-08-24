# Border.Color 属性
            
---

## 语法

### 表达式.Color

表达式一个返回`Border`对象的表达式。

## 说明

|对象|对应颜色|
|-|-|
|边框|边框的颜色。|
|Borders|一个区域的所有四条边的颜色。如果四边不是同一种颜色，则 Color 返回的是 0（零）。|
|Font|字体的颜色。|
|Interior|单元格底纹的颜色或图形对象的填充颜色。|
|Tab|选项卡的颜色。|

## 示例

此示例对Chart1中数值坐标轴的刻度线标志颜色进行设置。

```javascript
Charts.Item("Chart1").Axes(xlValue).TickLabels.Font.Color = (0, 255, 0)
```
