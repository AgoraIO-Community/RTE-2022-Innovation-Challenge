# ContentControl.SetPlaceholderText 方法
            
---

## 语法

### 表达式.SetPlaceholderText(BuildingBlock, Range, Text)

表达式返回`ContentControl`对象的表达式。

## 参数

|名称|必选/可选|数据类型|说明|
|-|-|-|-|
|BuildingBlock|可选|BuildingBlock|指定 BuildingBlock 对象，该对象包含占位符文本的内容。|
|Range|可选|Range|指定 Range 对象，该对象包含占位符文本的内容。|
|Text|可选|String|指定占位符文本的内容。|

## 说明

在指定占位符文本时，只使用一个参数。如果使用多个参数，则WPS将使用在第一个参数中指定的文本。如果省略所有参数，则占位符文本将为空白。

## 示例以下示例在活动文档中插入新的下拉列表内容控件，设置标题和占位符文本，然后在列表中插入几个新项。

```javascript
let objMap
let objCC = ActiveDocument.ContentControls.Add(wdContentControlDropdownList)
objCC.Title = "My Favorite Animal"
objCC.SetPlaceholderText , "Select your favorite animal "

/*List entries*/
objCC.DropdownListEntries.Add("Cat")
objCC.DropdownListEntries.Add("Dog")
objCC.DropdownListEntries.Add("Horse")
objCC.DropdownListEntries.Add("Monkey")
objCC.DropdownListEntries.Add("Snake")
objCC.DropdownListEntries.Add("Other")
```
