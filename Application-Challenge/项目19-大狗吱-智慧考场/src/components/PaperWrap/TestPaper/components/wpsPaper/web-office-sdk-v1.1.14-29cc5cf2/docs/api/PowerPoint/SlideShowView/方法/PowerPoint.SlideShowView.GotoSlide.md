# SlideShowView.GotoSlide 方法
            
---

## 语法

### 表达式.GotoSlide(Index, ResetSlide)

表达式一个代表`SlideShowView`对象的变量。

## 参数

|名称|必选/可选|数据类型|描述|
|-|-|-|-|
|Index|必选|Integer|要切换到的幻灯片的编号。|
|ResetSlide|可选|MsoTriState|如果将 ResetSlide 设置为 msoFalse，那么在幻灯片放映期间，当您从一张幻灯片切换到另一张，再返回到第一张幻灯片时，动画将从刚刚中断的位置继续播放。如果将 ResetSlide 设置为 msoTrue，当从一张幻灯片切换到另一张幻灯片，再返回到第一张幻灯片时，将重新播放整个动画。默认值为 msoTrue。|

## 说明

|MsoTriState 可以是下列 MsoTriState 常量之一。|
|-|
|msoCTrue|
|msoFalse|
|msoTriStateMixed|
|msoTriStateToggle|
|msoTrue 默认值。|

## 示例

本示例在第一个幻灯片放映窗口中从当前幻灯片切换到第三张幻灯片。如果在幻灯片放映过程中切换回当前幻灯片，将重新播放整个动画。

```javascript
SlideShowWindows.Item(1).View.GotoSlide(3)
```

本示例在第一个幻灯片放映窗口中从当前幻灯片切换到第三张幻灯片。如果在幻灯片放映过程中切换回当前幻灯片，动画将从中断位置重新播放。

```javascript
SlideShowWindows.Item(1).View.GotoSlide(3, msoFalse)
```
