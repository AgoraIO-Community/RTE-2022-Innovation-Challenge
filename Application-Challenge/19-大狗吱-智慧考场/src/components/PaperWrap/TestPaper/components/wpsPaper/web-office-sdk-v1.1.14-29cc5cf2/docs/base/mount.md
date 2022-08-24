# 挂载节点

挂载节点是指js-sdk插入iframe时挂载的节点，js-sdk挂载节点在初始化时是可配置项。
```html
<div class="custom-mount"></div>
```
```javascript
var demo = WebOfficeSDK.config({
    mount: document.querySelector('.custom-mount')
})
```
js-sdk初始化完成后会**自动**在挂载节点下面插入一个iframe
```html
<div class="custom-mount">
    <iframe src="..."></iframe>
</div>
```

## iframe 对象

如需要对iframe对象做特殊处理，可以通过js-sdk实例化对象快速取到iframe的dom对象。

```javascript
var demo = WebOfficeSDK.config({
    mount: document.querySelector('.custom-mount')
})
console.log(demo.iframe)
```


