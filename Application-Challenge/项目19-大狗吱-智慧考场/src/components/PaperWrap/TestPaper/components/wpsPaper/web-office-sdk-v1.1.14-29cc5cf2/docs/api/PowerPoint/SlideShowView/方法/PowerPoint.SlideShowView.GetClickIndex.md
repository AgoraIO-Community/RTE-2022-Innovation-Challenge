# SlideShowView.GetClickIndex 方法
            
---

## 语法

### 表达式.GetClickIndex

表达式一个代表`SlideShowView`对象的变量。

## 返回值Long

## 说明

使用### GetClickCount方法可返回为幻灯片定义的鼠标单击次数。

如果幻灯片不包含任何动画或者用户尚未换到某个动画，则`GetClickIndex`方法返回0。如果幻灯片包含自动播放的动画并且该用户移到上一页，则`GetClickIndex`方法返回`msoClickStateBeforeAutomaticAnimcations`。
