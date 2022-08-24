# 窗口缩放相关

## 以正常大小的百分比形式返回或设置指定视图的缩放设置。 读/写

> 最低支持版本 v1.1.3
读：

```javascript
  /*
  * @return: number
  */
  await demo.ExcelApplication().ActiveWorkbook.ActiveSheetView.Zoom
```

写：

* 备注(缩放属性值在10%到 500%之间。)

```js
/*
  * @param : 10 <= number <= 500
  */
  demo.ExcelApplication().ActiveWorkbook.ActiveSheetView.Zoom = 10
```
