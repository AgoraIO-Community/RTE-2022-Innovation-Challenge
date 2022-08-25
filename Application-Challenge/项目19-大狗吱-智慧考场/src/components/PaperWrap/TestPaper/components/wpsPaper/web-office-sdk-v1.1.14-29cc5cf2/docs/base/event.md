# 事件
可以通过实例的`on`方法监听事件
```javascript
demo.on('事件名', function(data) {
    // do something...
})
```
## 事件列表

| 事件名 | 说明  | 最低支持版本 |
| ----- | ----  | ---- |
| [fileOpen](#文档打开) | 文档打开 | 1.0.0 |
| [error](#错误事件) | 错误事件 | 1.1.2 |
| [tabSwitch](#pc头部tab切换) | pc头部tab切换 | 1.1.2 |
| [fileStatus](#文件保存状态) | 文件保存状态 | 1.1.3 |
| [previewLimit](#预览页数限制事件) | 预览页数限制事件 | 1.1.3 |
| [hasDocMap](#文档是否存在目录) | 文档是否存在目录 | 1.1.4 |
| [fullscreenChange](#进入或退出全屏事件) | 进入或退出全屏事件 | 1.1.8 |

## 所有事件详细说明

#### 文档打开
**事件名：** fileOpen 

**描述：** 文件打开成功或者失败时的事件回调

**返回参数：**

成功时
```javascript
{
    "success": true,
    "time": 111, // 打开时长
    "fileInfo": {
      createTime: 1586327872,
      modifyTime: 1586327872,
      name: "座位表",
      officeType: "w",
      id: "64784347535"
    }
}
```
失败时
```javascript
{
    "success": true,
    "time": 111,
    "reason": "InvalidLink", // 错误时会有错误码
}
```
更多错误码说明请查看[错误码](./error.md)篇

**例子：**
```javascript
demo.on('fileOpen', function(data) {
    // do something...
})
```

#### 错误事件
**事件名：** error

**描述：** 错误发生时的事件回调

**返回参数：**

```
```javascript
{
    "reason": "InvalidLink", // 错误时会有错误码
}
```
更多错误码说明请查看[错误码](./error.md)篇

**例子：**
```javascript
demo.on('error', function(data) {
    // do something...
})
```


#### pc头部tab切换
**事件名：** tabSwitch 

**描述：** tab切换的事件回调

**返回参数：**
```javascript
{
  tabKey: 1 // 当前tab序号
}
```

**例子：**
```javascript
demo.on('tabSwitch', function(data) {
    // do something...
})
```

#### 文件保存状态
**事件名：** fileStatus

**描述：** 文件保存的事件回调

**返回参数：**
```javascript
{
  status: 0, // 文档无更新
  status: 1, // 版本保存成功, 触发场景： 手动保存、定时保存、关闭网页
  status: 2, // 暂不支持保存空文件, 触发场景：内核保存完后文件为空
  status: 3, // 空间已满
  status: 4, // 保存中请勿频繁操作，触发场景：服务端处理保存队列已满，正在排队
  status: 5, // 保存失败
  status: 6, // 文件更新保存中，触发场景：修改文档内容触发的保存
  status: 7, // 保存成功，触发场景：文档内容修改保存成功
}
```

**例子：**
```javascript
demo.on('fileStatus', function() {
    // do something...
})
```

#### 文档是否存在目录

!> 此事件只在文字组件有效

!> 由于文字获取目录是动态分片获取，因此需要以监听事件方式确定是否存在目录。

**事件名：** hasDocMap

**描述：** 文档是否存在目录, 如果存在目录则会执行回调

**例子：**

```javascript
demo.on('hasDocMap', function() {
    // 存在目录则会执行回调
})
```

#### 进入或退出全屏事件

!> 注意在commonOptions配置了isBrowserViewFullscreen或者isIframeViewFullscreen配置项后此监听会无效

**事件名：** fullscreenChange

**描述：** 进入或退出全屏时则会执行回调

**返回参数：**

```javascript
{
  status: 0, // 退出全屏时触发
  status: 1, // 进入全屏时触发
}
```

**例子：**

```javascript
demo.on('fullscreenChange', function(result) {
    // do something...
})
```

#### 预览页数限制事件

!> 此事件只在预览页数限制模式下有效

!> 此方法只支持word, ppt以及pdf组件

**事件名：** previewLimit

**描述：**  当滚动到限制页数底部时触发事件

**返回参数：**

```javascript
// 文字
{
    total: 4 // 限制页数
}
// ppt 以及 pdf
{
    total: 4 // 限制页数
    realTotal: 10 // 真实总页数
}
```

!> 由于文字文档是流式排版, 无法获取准确的真实页数，因此回调只有一个参数total。 

**例子：**
```javascript
demo.on('previewLimit', function(result) {
    // do something...
})
```
