# 编辑与修订

## 编辑与修订模式切换

```javascript
  /*
  * @param: bool
  */
  // 将当前文档的编辑状态切换成编辑模式
  demo.WordApplication().ActiveDocument.TrackRevisions = false
  // 将当前文档的编辑状态切换成修订模式
  demo.WordApplication().ActiveDocument.TrackRevisions = true
```

## 获取全文修订

> 最低支持版本 v1.1.2

```javascript
  /*
  * @return {user: '修订名称', leader: '执行的操作', content: '对应的内容', begin: '开始的位置', end: '结束的位置', type: '类型'}
  */
  let revisionData = await demo.WordApplication().ActiveDocument.Revisions.Json()
```
