# 导出文件

## 导出PDF

```javascript
  /*
  * @param: { Range?: WdExportRange, From?: number, To?: number, Item?: WdExportItem, IncludeDocProps?: bool }
  * WdExportRange: {
  *      wdExportAllDocument: 0,
  *      wdExportCurrentPage: 2,
  *      wdExportFromTo: 3,
  *      wdExportSelection: 1,
  *  },
  * WdExportItem: {
  *      wdExportDocumentContent: 0,
  *      wdExportDocumentWithMarkup: 7
  *  }
  * @return: {url: string}
  */
  const pdfUrl = await demo.WordApplication().ActiveDocument.ExportAsFixedFormat()
```
