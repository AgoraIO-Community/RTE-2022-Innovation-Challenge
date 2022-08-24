# SlideShowWindow.View 属性
            
---

## 语法

### 表达式.View

表达式一个代表`SlideShowWindow`对象的变量。

## 示例

本示例使用### View属性退出当前幻灯片放映，并将当前窗口中的视图设为幻灯片视图，然后显示第三张幻灯片。

```javascript
Application.SlideShowWindows.Item(1).View.Exit()
Application.ActiveWindow.ViewType = ppViewSlide
Application.ActiveWindow.View.GotoSlide(3)
```
