# Borders.Item 方法
            
---

## 语法

### 表达式.Item(Index)

表达式必选。一个代表`Borders`集合的变量。

## 参数

|名称|必选/可选|数据类型|说明|
|-|-|-|-|
|Index|必选|WdBorderType|返回的边框。|

## 返回值Border

## 示例

本示例在活动文档的第一段之上插入双边框。

```javascript
function BorderItem() {
    ActiveDocument.Paragraphs.Item(1).Borders.Item(wdBorderTop).LineStyle = wdLineStyleDouble
}
```
