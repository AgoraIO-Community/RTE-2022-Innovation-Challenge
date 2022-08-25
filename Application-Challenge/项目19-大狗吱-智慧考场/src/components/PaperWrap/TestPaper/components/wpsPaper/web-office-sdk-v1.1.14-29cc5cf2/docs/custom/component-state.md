# 组件状态设置以及命令执行
可以通过`commandBars`选项， 可以`隐藏`,`禁用`页面的组件或者执行组件`命令`

```javascript
// 从 v1.1.2 开始使用新的数据结构 
WebOfficeSDK.config({
  commandBars: [
    // 可以配置多个组件
    {
      cmbId: "组件ID",
      attributes: {
        visible: false, // 隐藏组件
        enable: false, // 禁用组件， 组件显示但不响应点击事件
      }
    }
  ]
})
```

```javascript
// v1.1.1+
WebOfficeSDK.config({
  commandBars: [
    // 可以配置多个组件
    {
      cmbId: "组件ID",
      attributes: [{
        name: "visible",
        value: false
      },{
        name: "enable",
        value: false
      }]
    }
  ]
})
```

## 组件状态设置

### 目前支持属性 (attributes)

| 属性 | 类型 | 说明  |
| ----- | ---- | ----  | 
| visible | boolean | 组件显示切换 |
| enable | boolean | 组件状态切换，禁用或开启 |

### 动态更新

上面说的配置只是初始化的时候生效，`js-sdk`还提供动态更新组件状态接口

```javascript
demo.setCommandBars([...]) // 配置跟初始化配置雷同
```

### 组件ID列表

#### 公共

| 组件ID | 说明  | 最低版本 |
| ----- | ----  | ---- |
| HeaderLeft | PC头部左侧， 头部一共分左、中、右三块区域 | 1.1.1 |
| HeaderRight | PC头部右侧， 头部一共分左、中、右三块区域 | 1.1.1 |
| FloatQuickHelp | 右下角帮助(金小豹) | 1.1.1 |
| CooperationPanelOwnerInfo | 移动端协作列表中当前文档所有者信息 | 1.1.2 |
| Logo | 移动端状态栏Logo | 1.1.2 |
| Cooperation | 移动端状态栏协作头像 | 1.1.2 |
| More | 移动端状态栏更多按钮 | 1.1.2 |
| HistoryVersion | PC端-顶部状态栏-历史记录菜单-历史版本 | 1.1.2 |
| HistoryRecord | PC端-顶部状态栏-历史记录菜单-协作记录 | 1.1.2 |
| HistoryVersionDivider | PC端-表格-右键菜单-历史版本/协作记录分割线 | 1.1.2 |
| SendButton | 移动端-顶部工具栏-分享按钮 | 1.1.2 |
| CooperHistoryMenuItem | 移动端-顶部工具栏-协作记录菜单 | 1.1.3 |
| TabPrintPreview | PC顶部工具栏打印按钮 | 1.1.4 |
| MenuPrintPreview | PC更多菜单打印按钮 | 1.1.4 |

> 如果需要隐藏头部以及工具栏，可以设置 `{mode : "simple"}` 切换到极简模式， 详细查看 [显示模式](./mode.md) 篇

#### 表格

| 组件ID | 说明  | 最低版本 |
| ----- | ----  | ---- |
| CheckCellHistory | PC端-单元格最近的改动 | 1.1.2 |

#### 文字

| 组件ID | 说明  | 最低版本 |
| ----- | ----  | ---- |
| ReviewTrackChanges | 编辑、修订状态按钮 | 1.1.1 |
| TrackChanges | 编辑、修订状态下拉选项 | 1.1.1 |
| ContextMenuConvene | 文字右键召唤在线协助者 | 1.1.1 |
| WriterHoverToolbars | 移动端-文字-底部工具栏 | 1.1.2 |
| ReadSetting | 移动端-文字-状态栏-阅读设置 | 1.1.2 |

#### 演示

| 组件ID | 说明  | 最低版本 |
| ----- | ----  | ---- |
| PlayComponentToolbar | 全屏播放时toolbar | 1.1.3 |
| WPPPcCommentButton | PC端-底部工具栏-评论按钮 | 1.1.4 |
| WPPMobileCommentButton | 移动端-底部工具栏-评论按钮 | 1.1.4 |

#### PDF

| 组件ID | 说明  | 最低版本 |
| ----- | ----  | ---- |
| PDFMobilePageBar | 移动端页码 | 1.1.1 |

## 组件命令执行

可以通过调用方法执行组件命令

### 目前支持命令执行的组件ID列表

#### 公共

| 组件ID | 说明  | 最低版本 |
| ----- | ----  | ---- |
| TabPrintPreview | 顶部工具栏打印按钮 | 1.1.4 |

```javascript
  demo.executeCommandBar("TabPrintPreview")
```

#### 文字

| 组件ID | 说明  | 最低版本 |
| ----- | ----  | ---- |
| BookMark | 顶部工具栏书签按钮 | 1.1.4 |

```javascript
  demo.executeCommandBar("BookMark")
```
