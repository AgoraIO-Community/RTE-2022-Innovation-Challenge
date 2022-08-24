# 主动保存接口

> 最低支持版本 v1.1.0

## save

**描述：** 主动触发保存

| 保存状态 | 说明  |
| ----- | ----  |
| ok | 版本保存成功，可在历史版本中查看 |
| nochange | 文档无更新，无需保存版本 |
| SavedEmptyFile | 暂不支持保存空文件 触发场景：内核保存完后文件为空 |
| SpaceFull | 空间已满 |
| QueneFull | 保存中请勿频繁操作 触发场景：服务端处理保存队列已满，正在排队 |
| fail | 保存失败 |

**返回参数：**
```javascript
{
  result: "nochange", // 保存状态
  size: 15302, // 文件大小，单位byte
  version: 16, // 版本
}
```

**例子：**
```javascript
let result = await demo.save()
```
