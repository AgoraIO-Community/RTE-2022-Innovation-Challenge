# 获取页码、跳转页

## 获取总页数

```javascript
  /*
  * @return: number
  */
  let totalPages = await demo.PPTApplication().ActivePresentation.Slides.Count
```

## 获取当前页

```javascript
  /*
  * @return: number
  */
  let totalPages = await demo.PPTApplication().ActivePresentation.SlideShowWindow.View.Slide.SlideIndex
```

## 跳转到指定页

```javascript
  /*
  * @param: number
  */
  // 跳转到第三页
  await demo.PPTApplication().ActivePresentation.SlideShowWindow.View.GotoSlide(3)
```

## 当前页改变事件

```javascript
  function eventHandle() {
    // do something
  }
  // 监听
  demo.PPTApplication().Sub.SlideSelectionChanged = eventHandle
  // 销毁
  demo.PPTApplication().Sub.SlideSelectionChanged = null
```
