# Bookmarks.Item 方法
            
---

## 语法

### 表达式.Item(Index)

表达式必选。一个代表`Bookmarks`集合的变量。

## 参数

|名称|必选/可选|数据类型|说明|
|-|-|-|-|
|Index|必选|Variant|要返回的单个对象。可以是代表序号位置的 Long 类型值，或代表单个对象名称的 String 类型值。|

## 返回值Bookmark

## 示例

本示例选定活动文档中名为“temp”的书签。

```javascript
function BookmarkItem() {
    if(ActiveDocument.Bookmarks.Exists("temp") == true) {
        ActiveDocument.Bookmarks.Item("temp").Select()
    }
}
```
