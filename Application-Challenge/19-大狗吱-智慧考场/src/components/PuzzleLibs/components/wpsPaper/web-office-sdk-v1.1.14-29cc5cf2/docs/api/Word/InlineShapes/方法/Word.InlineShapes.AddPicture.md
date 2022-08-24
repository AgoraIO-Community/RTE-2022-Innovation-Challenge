# InlineShapes.AddPicture 方法
            
---

## 语法

### 表达式.AddPicture(FileName, LinkToFile, SaveWithDocument, Range)

表达式必选。一个代表`InlineShapes`集合的变量。

## 参数

|名称|必选/可选|数据类型|说明|
|-|-|-|-|
|FileName|必选|String|图片的路径和文件名。|
|LinkToFile|可选|Variant|如果为 True，则将图片链接到创建它的文件；如果为 False，则使图片成为该文件的独立副本。默认值为 False。|
|SaveWithDocument|可选|Variant|如果为 True，则将链接的图片与文档一起保存。默认值为 False。|
|Range|可选|Variant|图片置于文本中的位置。如果该区域未折叠，那么图片将覆盖此区域，否则插入图片。如果省略此参数，则自动放置图片。|
