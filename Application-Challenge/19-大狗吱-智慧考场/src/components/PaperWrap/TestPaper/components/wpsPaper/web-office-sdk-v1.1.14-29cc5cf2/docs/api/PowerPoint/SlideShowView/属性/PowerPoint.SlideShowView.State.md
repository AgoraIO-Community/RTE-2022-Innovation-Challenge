# SlideShowView.State 属性
            
---

## 语法

### 表达式.State

表达式一个代表`SlideShowView`对象的变量。

## 返回值PpSlideShowState

## 说明

|PpSlideShowState 可以是下列 PpSlideShowState 常量之一。|
|-|
|ppSlideShowBlackScreen|
|ppSlideShowDone|
|ppSlideShowPaused|
|ppSlideShowRunning|
|ppSlideShowWhiteScreen|

## 示例

本示例将第一个幻灯片放映窗口的视图状态设为黑屏。

```javascript
SlideShowWindows.Item(1).View.State = ppSlideShowBlackScreen
```
