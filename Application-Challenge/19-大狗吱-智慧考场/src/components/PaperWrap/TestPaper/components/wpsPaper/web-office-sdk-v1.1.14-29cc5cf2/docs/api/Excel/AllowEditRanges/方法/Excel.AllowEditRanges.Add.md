# AllowEditRanges.Add 方法
            
---

## 语法

### 表达式.Add(Title, Range, Password)

表达式一个代表`AllowEditRanges`对象的变量。

## 参数

|名称|必选/可选|数据类型|说明|
|-|-|-|-|
|Title|必选|String|单元格区域的标题。|
|Range|必选|Range|Range 对象。允许编辑的单元格区域。|
|Password|可选|Variant|单元格区域的密码。|

## 返回值

一个代表区域的`AllowEditRange`对象。

## 示例

此示例允许编辑活动工作表上的单元格区域“A1:A4”，并通知用户，然后更改指定区域的密码并通知用户所做的更改。

```javascript
function UseChangePassword() {
    let wksOne = Application.ActiveSheet

    // Protect the worksheet.
    wksOne.Protect()

    // Establish a range that can allow edits on the protected worksheet.
    wksOne.Protection.AllowEditRanges.Add("Classified", Range("A1:A4"), "secret")

    MsgBox("Cells A1 to A4 can be edited on the protected worksheet.")

    // Change the password.
    wksOne.Protection.AllowEditRanges.Item(1).ChangePassword("moresecret")

    MsgBox("The password for these cells has been changed.")
}
```
