# Range.Information 属性
            
---

## 语法

### 表达式.Information(Type)

表达式必选。一个代表`Range`对象的变量。

## 参数

|名称|必选/可选|数据类型|说明|
|-|-|-|-|
|Type|必选|WdInformation|消息类型。|

## 示例

如果第十个单词位于某个表格中，则以下示例选定该表格。

```javascript
if(ActiveDocument.Words.Item(10).Information(wdWithInTable)) {
    ActiveDocument.Words.Item(10).Tables.Item(1).Select()
}
```
