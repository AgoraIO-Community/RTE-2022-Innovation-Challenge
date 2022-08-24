# Slides.Count 属性
            
---

## 语法

### 表达式.Count

表达式一个代表`Slides`对象的变量。

## 返回值Long

## 示例

以下示例关闭除窗口1以外的所有窗口。

```javascript
for(let i = 2; i <= Application.Windows.Count; i++) {
    Application.Windows.Item(2).Close()
}
```
