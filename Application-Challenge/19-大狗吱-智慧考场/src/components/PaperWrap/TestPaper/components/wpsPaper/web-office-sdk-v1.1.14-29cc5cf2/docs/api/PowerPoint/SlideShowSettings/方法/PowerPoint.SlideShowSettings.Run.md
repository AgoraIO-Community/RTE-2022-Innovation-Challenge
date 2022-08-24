# SlideShowSettings.Run 方法
            
---

## 语法

### 表达式.Run

表达式一个代表`SlideShowSettings`对象的变量。

## 返回值SlideShowWindow

## 说明

要运行自定义幻灯片放映，请将`RangeType`属性设置为`ppShowNamedSlideShow`，并将`SlideShowName`属性设置为要运行的自定义放映的名称。

## 示例

本示例为活动演示文稿播放全屏幻灯片放映，并禁用快捷键。

```javascript
ActivePresentation.SlideShowSettings.ShowType = ppShowSpeaker
ActivePresentation.SlideShowSettings.Run().View.AcceleratorsEnabled = false
```

本示例运行名为“QuickShow”的幻灯片放映。

```javascript
ActivePresentation.SlideShowSettings.RangeType = ppShowNamedSlideShow
ActivePresentation.SlideShowSettings.SlideShowName = "Quick Show"
ActivePresentation.SlideShowSettings.Run()
```
