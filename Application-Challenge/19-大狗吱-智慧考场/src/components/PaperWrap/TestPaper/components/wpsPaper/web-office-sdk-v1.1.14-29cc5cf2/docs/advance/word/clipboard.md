# 剪切板相关

## copy动作回调事件

```javascript
await demo.ready()
const app = demo.Application
app.Sub.ClipboardCopy = async function(e) {
    // do sth
}
```
