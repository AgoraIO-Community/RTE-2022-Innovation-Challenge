# ContentControl.Title 属性
            
---

## 语法

### 表达式.Title

表达式返回`ContentControl`对象的表达式。

## 示例以下示例在活动文档中插入新的下拉列表内容控件，设置标题和占位符文本，然后向列表中添加几个新项。

```javascript
let objMap
let objCC = ActiveDocument.ContentControls.Add(wdContentControlDropdownList)
objCC.Title = "My Favorite Animal"
objCC.SetPlaceholderText( null,null, "Select your favorite animal ")
/*List entries*/
objCC.DropdownListEntries.Add("Cat")
objCC.DropdownListEntries.Add("Dog")
objCC.DropdownListEntries.Add("Horse")
objCC.DropdownListEntries.Add("Monkey")
objCC.DropdownListEntries.Add("Snake")
objCC.DropdownListEntries.Add("Other")
```
