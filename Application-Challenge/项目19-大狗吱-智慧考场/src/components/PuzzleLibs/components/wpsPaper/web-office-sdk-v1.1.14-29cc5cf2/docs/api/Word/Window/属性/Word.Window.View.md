# Window.View 属性
            
---

## 语法

### 表达式.View

表达式必选。一个代表`Window`对象的变量。

## 示例

以下示例将活动窗口切换为全屏显示。

```javascript
ActiveDocument.ActiveWindow.View.FullScreen = true
```

以下示例设置### Windows集合中所有窗口的视图选项。

```javascript
let myWindow

for(let i=1; i<=Windows.Count; i++) {
    myWindow = Windows.Item(i)
    myWindow.View.ShowTabs = true
    myWindow.View.ShowParagraphs = true
    myWindow.View.Type = wdNormalView
}
```
