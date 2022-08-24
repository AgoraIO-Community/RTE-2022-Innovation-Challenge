# Tabs 相关接口

> 最低支持版本 v1.1.2

## getTabs

**描述：** 获取所有pc头部tab

**返回参数：**
```javascript
[
  {"tabKey": "StartTab", "text": "开始"},
  {"tabKey": "InsertTab", "text": "插入"},
  {"tabKey": "ReviewTab", "text": "审阅"},
  {"tabKey": "PageTab", "text": "页面"}
]
```

**例子：**
```javascript
let tabs = await demo.tabs.getTabs()
```

## switchTab

**描述：** 控制pc头部tab切换

**参数：**
```javascript
{
  tabKey:  "InsertTab"// 当前tabKey id
}
```

**例子：**
```javascript
await demo.tabs.switchTab({tabKey: "InsertTab"}) // 切换到插入tab
```

## tabSwitch 事件
**描述：** tab切换的事件回调
**返回参数：**
```javascript
{
  tabKey:  "InsertTab"// 当前tabKey
}
```
**例子：**
```javascript
demo.on('tabSwitch', function(data) {
    // do something...
})
```
