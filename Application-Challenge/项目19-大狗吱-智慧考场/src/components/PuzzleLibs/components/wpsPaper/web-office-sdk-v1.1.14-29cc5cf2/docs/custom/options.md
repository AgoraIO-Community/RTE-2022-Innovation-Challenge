# 自定义功能选项
初始化时js-sdk时，通过分别配置不同文档对应的功能选项，可以开启和关闭文档中的特定功能和控制文档打开时的状态。

以下是文字文档的示例：
```javascript
WebOfficeSDK.config({
    // 通用选项，所有类型文档适用
    commonOptions: {
      isShowTopArea: false, // 隐藏顶部区域(头部和工具栏)
      isShowHeader: false // 隐藏头部区域
    }
})
```
> tip: 所有功能选项只能通过初始化配置控制，不支持热切换。

## 一、通用选项
* **配置项:** commonOptions

### 子项
| 配置项 | 说明  | 最低版本 |
| ----- | ----  | ---- |
| isShowTopArea | 是否显示顶部区域(头部和工具栏) | 1.1.2 |
| isShowHeader | 是否显示头部区域 | 1.1.2 |
| isBrowserViewFullscreen | 是否在浏览器区域全屏 | 1.1.5 |
| isIframeViewFullscreen | 是否在iframe区域内全屏 | 1.1.5 |

## 二、文档类型对应的配置项

### 文字选项
* **配置项:** wordOptions

#### 子项
| 配置项 | 说明  | 最低版本 |
| ----- | ----  | ---- |
| isShowDocMap | 是否开启目录功能，默认开启 | 1.1.2 |
| isBestScale | 打开文档时，默认以最佳比例显示(适用于pc) | 1.1.2 |
| isShowBottomStatusBar | pc-是否展示底部状态栏 | 1.1.3 |
| mobile.isOpenIntoEdit | mobile-要有编辑权限，移动端打开时是否进入编辑 | 1.1.3 |

### PDF
* **配置项:** pdfOptions

#### 子项
| 配置项 | 说明  | 最低版本 |
| ----- | ----  | ---- |
| isShowComment | 是否显示注解，默认显示 | 1.1.2 |
| isInSafeMode | 是否处于安全模式(安全模式下不能划选文字，不能复制以及不能通过链接跳转), 默认不是安全模式 | 1.1.2 |
| isShowBottomStatusBar | pc-是否展示底部状态栏 | 1.1.3 |

### 演示
* **配置项:** pptOptions

#### 子项
| 配置项 | 说明  | 最低版本 |
| ----- | ----  | ---- |
| isShowBottomStatusBar | pc-是否展示底部状态栏 | 1.1.3 |
| mobile.isOpenIntoEdit | mobile-要有编辑权限，移动端打开时是否进入编辑 | 1.1.3 |

### 表格
?> 暂无可配置选项
