# Sheet相关

### 获取所有sheet名称
```javascript
await demo.ready()
const app = demo.ExcelApplication()
const Names = []
// For(start, end, step, handle)
await app.For(1, app.Sheets.Count, 1, async (Index) => {
    Names.push(await app.Sheets.Item(Index).Name)
})
console.log(Names)
```

### 获取当前sheet名称

```javascript
await demo.ready()
const app = demo.ExcelApplication()
const name = await app.ActiveSheet.Name
console.log('ActiveSheet:', name)
```

### 切换到指定sheet
```javascript
await demo.ready()
const app = demo.ExcelApplication()
const sheetIndex = 1 // sheets序号， 从1开始
app.Sheets.Item(sheetIndex).Activate() // 切换sheet
```

### 切换sheet回调事件

```javascript
await demo.ready()
const app = demo.Application
app.Sub.Worksheet_Activate = async function() {
    console.log("ActiveSheet:", await app.ActiveSheet.Name)
}
```