<!-- $name=bookmark.docx -->
## 场景：文字-书签
```javascript
// 获取书签内容
async function getBookmarkText(name = '书签1') {
  return await window.demo.WordApplication().ActiveDocument.GetBookmarkText(name)
}
// 获取所有书签
async function getAllBookmarks() {
  return await window.demo.WordApplication().ActiveDocument.Bookmarks.Json()
}
let hasReplace = 0
// 替换书签
async function replaceBookmark() {
  if (!hasReplace) {
    hasReplace = 1
    return await window.demo.WordApplication().ActiveDocument.ReplaceBookmark([{name: '书签2', type: 'text', value: '已经替换为1'}])
  } else {
    hasReplace = 0
    return await window.demo.WordApplication().ActiveDocument.ReplaceBookmark([{name: '书签2', type: 'text', value: '已经替换为2'}])
  }
}
let id = 1
// 添加书签
async function addBookmark() {
  return await window.demo.WordApplication().ActiveDocument.Bookmarks.Add({
    Name: `添加书签${id++}`, 
    Range: {Start: 50, End: 55}
  })
}
// 删除书签
async function deleteBookmark(Index = '书签4') {
  return await window.demo.WordApplication().ActiveDocument.Bookmarks.Item({Index}).Delete()
}
// 跳转到指定的书签(跳转到指定书签前必须获取过一次全部书签)
async function gotoBookmark(What = -1, Which = 1, Name = '书签5') {
  await window.demo.WordApplication().ActiveDocument.Bookmarks.Json()
  return await window.demo.WordApplication().ActiveDocument.Selection.GoTo({
    What,
    Which,
    Name
  })
}
```
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <!-- 建议禁用外框浏览器自带的缩放 -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0,user-scalable=no">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <link href="https://cdn.jsdelivr.net/npm/prismjs@1.21.0/themes/prism.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/prismjs@1.21.0/prism.min.js"></script>
    <style>
      * {
        box-sizing: border-box;
      }
      
      html,
      body {
        display: flex;
        font-size: 14px;
        flex-direction: column;
        padding: 0;
        margin: 0;
        height: 100%;
        background-color: #ffffff;
        /* 防止双击缩放 */
        touch-action: manipulation;
      }
      
      /* iframe {
        flex: 1;
      } */
      
      
      #web-office-iframe {
        display: flex;
        flex: 1;
        border: 1px solid #f0f0f0;
        padding: 10px;
      }
      
      .web-office-iframe {
        max-height: 600px;
      }
      
      .CodeMirror {
        height: 200px;
      }
      
      .code-wrapper {
       flex: 1;
       overflow-y: auto;
       border: 1px solid #f0f0f0;
      }
      
      .code-output {
        /* border-top: 1px solid #f0f0f0; */
        display: block;
        white-space: inherit;
        overflow: hidden;
        /* padding: 10px; */
      }
      
      .text-output {
        display: flex;
        flex-direction: column;
        border-bottom: 1px solid #ededed;
        padding: 10px 16px;
      }
      
      .btn {
        position: relative;
        display: inline-block;
        border: 1px solid #E2E6ED;
        border-radius: 2px;
        padding: 6px 13px;
        white-space: nowrap;
        flex-shrink: 0;
      }
      
      .btn:hover {
        background-color: rgba(25, 55, 88, 0.04);
      }
      
      .btn:active {
        background-color: rgba(25, 55, 88, 0.1);
      }
      
      .content-wrapper {
        display: flex;
        height: 270px;
        flex-direction: row;
        overflow: hidden;
        opacity: .3;
        padding: 10px;
        pointer-events: none;
        margin-top: 10px;
        border: 1px solid #f0f0f0;
        color: #505d6b;
      }
      
      .button-wrapper {
        user-select: none;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        margin-right: 10px;
        /* padding: 10px; */
        /* overflow-y: scroll; */
      }
      
      .button-wrapper::-webkit-scrollbar-thumb {
        border: none;
      }
      
    </style>
  </head>
  <body>
    <div id="web-office-iframe"></div>
  
    <div class="content-wrapper">
      <div class="button-wrapper">
        <div class="btn" id="getBookmarkText">获取书签1内容</div>
        <div class="btn" id="getAllBookmarks">获取所有书签</div>
        <div class="btn" id="replaceBookmark">替换书签2内容</div>
        <div class="btn" id="addBookmark">添加书签</div>
        <div class="btn" id="deleteBookmark">删除书签4</div>
        <div class="btn" id="gotoBookmark">跳转到书签5</div>
      </div>
      <div class="code-wrapper"><div class="code-output"></div></div>
    </div>
    
    <script src="<your sdk url>"></script>
    <script>
      window.onload = () => {
        window.demo = WebOfficeSDK.config({
          mount: document.getElementById('web-office-iframe'),
          wpsUrl: '<your signature url>' // 替换成自己的webOffice在线预览url地址
        })
        window.demo.setToken({ token: '<your token>' }) // 替换成自己的token
        await window.demo.ready()
        const content =  document.querySelector('.content-wrapper')
        content.style.pointerEvents = 'auto'
        content.style.opacity = 1
      }
            
            
      
      // 获取书签内容
      async function getBookmarkText(name = '书签1') {
        return await window.demo.WordApplication().ActiveDocument.GetBookmarkText(name)
      }
      
      // 获取所有书签
      async function getAllBookmarks() {
        return await window.demo.WordApplication().ActiveDocument.Bookmarks.Json()
      }
      
      let hasReplace = 0
      // 替换书签
      async function replaceBookmark() {
        if (!hasReplace) {
          hasReplace = 1
          return await window.demo.WordApplication().ActiveDocument.ReplaceBookmark([{name: '书签2', type: 'text', value: '已经替换为1'}])
        } else {
          hasReplace = 0
          return await window.demo.WordApplication().ActiveDocument.ReplaceBookmark([{name: '书签2', type: 'text', value: '已经替换为2'}])
        }
      }
      
      let id = 1
      // 添加书签
      async function addBookmark() {
        return await window.demo.WordApplication().ActiveDocument.Bookmarks.Add({
          Name: `添加书签${id++}`, 
          Range: {Start: 50, End: 55}
        })
      }
      
      // 删除书签
      async function deleteBookmark(Index = '书签4') {
        return await window.demo.WordApplication().ActiveDocument.Bookmarks.Item({Index}).Delete()
      }
      
      // 跳转到指定的书签(跳转到指定书签前必须获取过一次全部书签)
      async function gotoBookmark(What = -1, Which = 1, Name = '书签5') {
        await window.demo.WordApplication().ActiveDocument.Bookmarks.Json()
        return await window.demo.WordApplication().ActiveDocument.Selection.GoTo({
          What,
          Which,
          Name
        })
      }
      
      const btnIdList = ['getBookmarkText', 'getAllBookmarks', 'replaceBookmark', 'addBookmark', 'deleteBookmark', 'gotoBookmark']
      
      btnIdList.forEach(id => {
        const btn = document.getElementById(id)
        btn.addEventListener('click', (e) => handleBtnClick(e, id))
      })
      
      const sleep = async (time) => {
        return new Promise(resolve => setTimeout(resolve, time))
      }
      let lang = 'javascript'
      async function handleBtnClick(_, id) {
        insertHtml('正在执行...')
        await sleep(1000)
        const result =  await window[id]()
        const text = Prism.highlight(
          JSON.stringify(result ? result : '', null, "\t"),
          Prism.languages[lang] || Prism.languages.markup
        );
        insertHtml(`<div class="text-output"><span>执行成功</span>
        <span>函数执行返回结果为：</span></div><pre v-pre data-lang="${lang}">
        <code class="lang-${lang}">${text}</code>
        </pre>`)
      }
      function insertHtml(string) {
        document.querySelector('.code-output').innerHTML = string
      }
      
    </script>
  </body>
</html>
```