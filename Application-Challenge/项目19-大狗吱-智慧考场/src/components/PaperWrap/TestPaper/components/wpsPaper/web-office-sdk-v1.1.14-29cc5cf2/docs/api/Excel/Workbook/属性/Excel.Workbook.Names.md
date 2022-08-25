# Workbook.Names 属性
            
---

## 语法

### 表达式.Names

表达式一个代表`Workbook`对象的变量。

## 说明

在不使用对象识别符的情况下使用此属性等效于使用。

## 示例

本示例是将Sheet1中的A1单元格的名称定义为“myName”。

```javascript
ActiveWorkbook.Names.Add("myName",null,null,null,null,null,null,null,null,"=Sheet1!R1C1")
```
