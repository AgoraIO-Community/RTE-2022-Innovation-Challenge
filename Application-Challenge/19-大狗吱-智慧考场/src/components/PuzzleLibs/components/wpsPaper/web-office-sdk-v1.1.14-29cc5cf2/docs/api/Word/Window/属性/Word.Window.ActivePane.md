# Window.ActivePane 属性
            
---

## 语法

### 表达式.ActivePane

表达式一个代表`Window`对象的变量。

## 示例

本示例拆分活动窗口，然后激活活动窗格的下一个窗格。

```javascript
let win = ActiveDocument.ActiveWindow
win.Split = true
win.ActivePane.Next.Activate()
MsgBox("Pane " + win.ActivePane.Index + " is active")
```

本示例激活第一个窗口，并显示活动窗格中的制表符。

```javascript
Application.Windows.Item(1).Activate()
Application.Windows.Item(1).ActivePane.View.ShowTabs = true
```
