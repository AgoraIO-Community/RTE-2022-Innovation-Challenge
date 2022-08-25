# View.ShowRevisionsAndComments 属性
            
---

## 语法

### 表达式.ShowRevisionsAndComments

表达式返回`View`对象的表达式。

## 示例

本示例隐藏文档中的修订和备注。本示例假定活动窗口中的文档包括一个或多个审阅者所作的修订。

```javascript
function ShowRevsComments(){
    ActiveWindow.View.ShowRevisionsAndComments = false
}
```
