# Bookmarks.Add 方法
            
---

## 语法

### 表达式.Add(Name, Range)

表达式必选。一个代表`Bookmarks`集合的变量。

## 参数

|名称|必选/可选|数据类型|说明|
|-|-|-|-|
|Name|必选|String|书签名。书签名不能多于一个单词。|
|Range|可选|Variant|书签标记的文本区域。可将书签设置到一个折叠的区域（插入点）。|

## 返回值书签

## 示例

本示例为活动文档中的所选区域添加名为myplace的书签。

```javascript
function BMark(){
    //  Select some text in the active document prior
    //  to execution.
    ActiveDocument.Bookmarks.Add("myplace", Selection.Range)
}

```

本示例在插入点添加名为mark的书签。

```javascript
function Mark(){
    ActiveDocument.Bookmarks.Add("mark", null)
}

```

本示例在Letter.doc中的第三段添加名为third_para的书签。然后在活动窗口中显示该文档的所有书签。

```javascript
function ThirdPara(){
    //  To best illustrate this example,
    //  Letter.doc must be opened, not active,
    //  and contain more than 3 paragraphs.
    let myDoc = Documents.Item("Letter.doc")
    myDoc.Bookmarks.Add("third_para",myDoc.Paragraphs.Item(3).Range)
    myDoc.ActiveWindow.View.ShowBookmarks = true
}

```
