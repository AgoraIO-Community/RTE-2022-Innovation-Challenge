# Font.Size 属性
            
---

## 语法

### 表达式.Size

表达式必选。一个代表`Font`对象的变量。

## 示例

以下示例插入文本并将该文本的第七个单词的字号设置为20磅。

```javascript
Selection.Collapse(wdCollapseEnd)
let rng = Selection.Range
rng.Font.Reset()
rng.InsertBefore( "This is a demonstration of font size.")
rng.Words.Item(7).Font.Size = 20
```

以下示例确定所选文本的字号。

```javascript
let mySel = Selection.Font.Size
if(mySel == wdUndefined){
    MsgBox("there is a mix of font sizes in the selection.")
}
else {
    MsgBox(mySel + " points")
}
```
