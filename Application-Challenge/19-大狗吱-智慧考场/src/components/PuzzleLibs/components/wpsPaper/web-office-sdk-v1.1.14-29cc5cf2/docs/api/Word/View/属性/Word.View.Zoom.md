# View.Zoom 属性
            
---

## 语法

### 表达式.Zoom

表达式返回一个`View`对象的表达式。

## 示例

本示例将所有打开窗口的显示比例更改为125%。

```javascript
function wndBig(){
    for(let i = 1;i <= Windows.Count;i++){
        Windows.Item(i).View.Zoom.Percentage = 125
    }
}
```

本示例改变活动窗口的显示比例，以显示文本的全部宽度。

```javascript
ActiveDocument.ActiveWindow.View.Zoom.PageFit = wdPageFitBestFit
```
