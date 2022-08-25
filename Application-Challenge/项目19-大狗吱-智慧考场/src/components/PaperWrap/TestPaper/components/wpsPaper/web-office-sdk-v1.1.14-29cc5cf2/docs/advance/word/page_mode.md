# 分页/连页模式以及相关属性设置

## 分页/连页模式切换
> 最低支持版本 v1.1.3

```javascript
  /*
  * @param: bool
  * @return: bool 切换成功返回true，否则返回false
  */
  // 将当前文档状态切换成连页模式
  await demo.WordApplication().ActiveDocument.SwitchTypoMode(true)
  // 将当前文档的状态切换成分页模式
  await demo.WordApplication().ActiveDocument.SwitchTypoMode(false)
```

## 显示/不显示文件名栏 (需要连页模式下才生效，非连页模式下设置了也不会生效)
> 最低支持版本 v1.1.3

```javascript
/*
  * @param: bool
  */
  //  显示文件名栏
  await demo.WordApplication().ActiveDocument.SwitchFileName(true)
  // 隐藏文件名栏
  await demo.WordApplication().ActiveDocument.SwitchFileName(false)
```
