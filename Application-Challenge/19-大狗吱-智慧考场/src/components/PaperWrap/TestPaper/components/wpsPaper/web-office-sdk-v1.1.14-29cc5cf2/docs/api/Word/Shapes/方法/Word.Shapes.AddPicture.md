# Shapes.AddPicture 方法
            
---

## 语法

### 表达式.AddPicture(FileName, LinkToFile, SaveWithDocument, Left, Top, Width, Height)

表达式必选。一个代表`Shapes`集合的变量。

## 参数

|名称|必选/可选|数据类型|说明|
|-|-|-|-|
|FileName|必选|String|图片的路径和文件名。|
|LinkToFile|可选|Variant|如果该参数值为 True，则将图片链接到创建它的文件。如果该参数值为 False，则将图片作为该文件的独立副本。默认值为 False。|
|SaveWithDocument|可选|Variant|如果该参数值为 True，则将链接的图片与文档一起保存。默认值为 False。|
|Left|可选|Variant|新图片的左边缘相对于绘图画布的位置，以磅为单位。|
|Top|可选|Variant|新图片的上边缘相对于绘图画布的位置，以磅为单位。|
|Width|可选|Variant|图片的宽度，以磅为单位。|
|Height|可选|Variant|图片的高度，以磅为单位。|

## 返回值Shape

## 示例

以下示例在活动文档中新创建的绘图画布上添加一幅图片。

```javascript
function NewCanvasPicture(){
    //Add a drawing canvas to the active document
    let shpCanvas = ActiveDocument.Shapes.AddCanvas(100, 75, 200, 300)

    //Add a graphic to the drawing canvas
    shpCanvas.CanvasItems.AddPicture("C:\\Program Files\\Microsoft Office\\" + "Office\\Bitmaps\\Styles\\stone.bmp", false, true)
}
```
