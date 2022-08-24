# 剪切板

从移动APP粘贴时需要从系统剪切板获取数据后粘贴进文档里。

## 获取系统剪切板数据 (目前仅移动端表格以及文字支持) 1.1.6

可以通过传入`获取系统剪切板数据函数`在文档粘贴的时候调用传入函数获取系统剪切板数据, 返回一个promise或obj

```javascript
// 获取统剪切板数据函数
const getClipboardData = () => {
  // 自身业务处理...

  return Promise.resolve({
    text: 'xxx', // text 格式数据
    html: 'xxx', //  html 格式数据， 目前仅表格支持
    updateExternal: true // 是否从外部粘贴数据，为false则从内部剪切板取
  })
}
// 配置获取系统剪切板数据函数
WebOfficeSDK.config({getClipboardData})
```
