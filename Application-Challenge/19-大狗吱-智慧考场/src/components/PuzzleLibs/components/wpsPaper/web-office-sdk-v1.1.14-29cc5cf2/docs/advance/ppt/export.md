# 导出文件

## 导出PDF

```javascript
  /*
  * 目前只支持两个参数RangeType以及FrameSlides
  * @param: { RangeType?: MsoTriState, FrameSlides?: MsoTriState }
  * MsoTriState: {
  *      msoFalse: 0,
  *      msoTrue: -1
  *  }
  * @return: {url: string}
  */
  const pdfUrl = await demo.PPTApplication().ActivePresentation.ExportAsFixedFormat()
```
