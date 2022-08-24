# View.RevisionsView 属性
            
---

## 语法

### 表达式.RevisionsView

表达式必选。一个代表`View`对象的变量。

## 示例

本示例在显示文档的原始版本和最终版本之间切换。本示例假定活动窗口中的文档包含由一个或多个审阅者所做的修订，并且修订显示于气球中。

```javascript
function ToggleRevView(){
    if(ActiveWindow.View.RevisionsMode == wdBalloonRevisions){
        if(ActiveWindow.View.RevisionsView == wdRevisionsViewFinal){
            ActiveWindow.View.RevisionsView = wdRevisionsViewOriginal
        }
        else{
            ActiveWindow.View.RevisionsView = wdRevisionsViewFinal
        }
    }
}
```
