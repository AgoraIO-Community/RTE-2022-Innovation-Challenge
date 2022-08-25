# Slide.SlideIndex 属性
            
---

## 语法

### 表达式.SlideIndex

表达式一个代表`Slide`对象的变量。

## 返回值Long

## 说明

与`SlideID`属性不同，在演示文稿中添加或重新排列幻灯片时，`Slide`对象的`SlideIndex`属性会改变。因此，与使用具有幻灯片索引号的`Item`方法相比，使用具有幻灯片ID号的`FindBySlideID`方法是从`Slides`集合返回特定`Slide`对象的更可靠方法。

## 示例

以下示例显示第一个幻灯片放映窗口中当前放映幻灯片的索引号。

```javascript
MsgBox（SlideShowWindows.Item(1).View.Slide.SlideIndex)
```
