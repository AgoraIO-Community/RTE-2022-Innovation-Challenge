# Window.Selection 属性
            
---

## 语法

### 表达式.Selection

表达式一个代表`Window`对象的变量。

## 示例

以下示例将第一个窗口的所选内容复制到下一个窗口。

```javascript
if(Windows.Count >= 2) {
    Windows.Item(1).Selection.Copy()
    Windows.Item(1).Next.Activate()
    Selection.Paste()
}
```
