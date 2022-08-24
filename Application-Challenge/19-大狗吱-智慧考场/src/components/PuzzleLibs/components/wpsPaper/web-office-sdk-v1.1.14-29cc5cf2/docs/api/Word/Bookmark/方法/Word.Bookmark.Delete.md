# Bookmark.Delete 方法
            
---

## 语法

### 表达式.Delete

表达式必选。一个代表`Bookmark`对象的变量。

## 示例

如果活动文档中存在名为“temp”的书签，则本示例删除该书签。

```javascript
function DeleteBookmark() {
    let strBookmark = "temp"
    let intResponse = MsgBox("Are you sure you want to delete " + "the bookmark named " + strBookmark + "?", jsYesNo)
    if (intResponse == jsResultYes){
        if (ActiveDocument.Bookmarks.Exists(strBookmark)) {
            ActiveDocument.Bookmarks.Item(strBookmark).Delete()
        }
    }
}
```
