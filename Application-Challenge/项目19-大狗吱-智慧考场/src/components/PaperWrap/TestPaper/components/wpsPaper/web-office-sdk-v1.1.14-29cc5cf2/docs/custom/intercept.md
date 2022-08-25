# 拦截相关功能设置

## 关闭原有toast并拦截信息（最低版本 1.1.3）

初始化js-sdk时，可以通过配置关闭toast并获得相关提示操作以及信息，从而可以自定义toast样式

可以通过配置`自定义toast函数`关闭原有toast提示并且获取相关信息自定义toast样式

以下是action参数说明

| action | 说明  |
| ----- | ----  |
| success | 成功提示 |
| error | 错误提示 |
| warn | 警告提示 |
| close | 关闭toast |

```javascript
  // 拦截toast函数
  const onToast = ({msg: string /* 提示信息 */, action: string /* 提示动作 */}) => {
    // 自身业务处理...
  }
  // 配置toast函数
  demo.config({onToast})
```

## 拦截原有外链跳转并获取相关url 1.1.5

可以通过配置`自定义函数`拦截原有外链跳转并获取link信息自行处理

```javascript
  // 拦截外链跳转函数
  const onHyperLinkOpen = ({linkUrl: string /* 跳转url */}) => {
    // 自身业务处理...
  }
  // 配置外链跳转函数
  demo.config({onHyperLinkOpen})
```
