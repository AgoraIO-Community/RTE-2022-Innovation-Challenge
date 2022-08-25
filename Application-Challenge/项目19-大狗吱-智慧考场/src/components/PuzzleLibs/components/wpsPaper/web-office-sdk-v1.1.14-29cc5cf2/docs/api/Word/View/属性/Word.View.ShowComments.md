# View.ShowComments 属性
            
---

## 语法

### 表达式.ShowComments

表达式返回`View`对象的表达式。

## 说明

如果修订标记显示在右边距或左边距的气球中，则备注也显示在气球中。如果修订标记显示在文本中，则应用备注的文本被括在方括号中。当将鼠标指针置于括号中的文本时，相关的备注就会显示在鼠标指针上方的方形气球中。

## 示例

本示例隐藏活动文档中的所有备注。本示例假定活动窗口中的文档包括一个或多个备注。

```javascript
function HideComments(){
    ActiveWindow.View.ShowComments = false
}
```
