# 协作用户属性设置

> 最低支持版本 v1.1.2

可以通过`cooperUserAttribute`选项，控制协作用户头像是否`显示`以及控制用户`光标颜色`
```javascript
WebOfficeSDK.config({
  cooperUserAttribute: {
    isCooperUsersAvatarVisible: false, //是否显示协作用户头像
    cooperUsersColor: [{
      userId: 'xxxxxx', // 用户id
      color: '#F65B90' // 用户光标颜色
    }]
  }
})
```

#### 目前支持属性 (attributes)

| 属性 | 类型 | 说明  |
| ----- | ---- | ----  |
| isCooperUsersAvatarVisible | boolean | 协作用户头像显示切换 |
| cooperUsersColor | [ userId: string, color: string ] | 设置协作用户光标颜色 |

#### 动态更新
上面说的配置只是初始化的时候生效，`js-sdk`还提供动态更新组件状态接口， 目前只提供设置用户光标颜色接口
```javascript
await demo.setCooperUserColor([...]) // 配置跟初始化配置雷同
```
