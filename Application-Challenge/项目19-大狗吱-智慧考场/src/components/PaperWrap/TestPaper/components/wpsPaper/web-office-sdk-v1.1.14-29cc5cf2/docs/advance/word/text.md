# 查找替换

## 根据传入数组全文匹配并替换文本

```javascript
  /*
  * @param: { Data: [ key: string, value: string, options: object ] }
  * eg： [{key: '被替换的文本', value: '替换的文本', options: { isWildcardMatched: false }}]
  * options - 替换配置
  *  isWildcardMatched： 使用通配符
  *  isCaseSensitive：区分大小写
  *  isWholeWordMatched：全字匹配
  *  isWidthIgnored：忽略全/半角
  * @return: boolean 替换成功返回true，否则返回false
  */
  const isSuccess = await demo.WordApplication().ActiveDocument.ReplaceText([{key: '123', value: '234'}])
```
