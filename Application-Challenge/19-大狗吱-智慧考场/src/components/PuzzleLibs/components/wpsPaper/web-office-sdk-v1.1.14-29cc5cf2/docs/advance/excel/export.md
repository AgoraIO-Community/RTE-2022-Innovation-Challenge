# 导出文件

## 导出pdf

```javascript
  /*
  * @return: {url: string}
  */
  // 导出workbook
  const workbookPdfUrl = await demo.ExcelApplication().ActiveWorkbook.ExportAsFixedFormat()
  // 导出当前sheet
  const sheetPdfUrl = await demo.ExcelApplication().ActiveWorkbook.ActiveSheet.ExportAsFixedFormat()
```
