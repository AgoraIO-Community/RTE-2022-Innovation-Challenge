# Pane.View 属性
            
---

## 语法

### 表达式.View

表达式必选。一个代表`Pane`对象的变量。

## 示例

以下示例显示与### Windows集合中的第一个窗口相关联的窗格的所有非打印字符。

```javascript
for(let i = 1; i <= Windows.Item(1).Panes.Count; i++) {
    Windows.Item(1).Panes.Item(i).View.ShowAll = true
}
```
