$docsify.plugins = [
  function (hook, vm) {
    let _html;
    // let _jsString
    // hook.beforeEach(function(content) {
    //   const matchJsRegex = /(?<=```javascript\n)([^]*?)(?=\n```)/g
    //   _jsString = ''
    //   return content;
    // });
    hook.afterEach(function (html, next) {
      _html = html.slice(0);
      next(html);
    });
    hook.doneEach(function () {
      const [module, officeType, scenes] = vm.route.path.slice(1).split('/');
      if (module === 'scenes') {
        initTabSwitch();
        initDemo(_html, officeType, scenes);
        // handleMsg(iframe, _jsString)
      }
    });
  },
].concat($docsify.plugins || []);

function initTabSwitch() {
  const shallowOpacity = 0.6;
  const tabContainer = document.createElement('div');
  tabContainer.className = 'tabContainer';
  const [jsPre, htmlPre] = document.querySelectorAll('pre');
  const pagination = document.querySelector('.docsify-pagination-container');
  htmlPre.style.display = 'none';
  tabContainer.appendChild(jsPre);
  tabContainer.appendChild(htmlPre);
  pagination.parentNode.insertBefore(tabContainer, pagination);

  const btnContainer = document.createElement('div');
  btnContainer.className = 'btnContainer';
  const jsBtn = document.createElement('div');
  const htmlBtn = document.createElement('div');
  jsBtn.innerText = '功能代码';
  htmlBtn.innerText = '完整代码';
  btnContainer.appendChild(jsBtn);
  btnContainer.appendChild(htmlBtn);
  const btns = [jsBtn, htmlBtn];
  btns.forEach((item, index) => {
    const btnClassName = 'demo-tab-btn';
    if (index === 0) {
      item.className = btnClassName;
    } else {
      item.className = `demo-tab-switch-btn ${btnClassName}`;
    }
    item.addEventListener('click', () => handleBtnClick(index));
  });
  tabContainer.parentNode.insertBefore(btnContainer, tabContainer);
  let activeBtn = 0;

  function handleBtnClick(index) {
    if (!index && activeBtn) {
      jsBtn.classList.remove('demo-tab-switch-btn');
      htmlBtn.classList.add('demo-tab-switch-btn');
      activeBtn = 0;
      jsPre.style.display = 'block';
      htmlPre.style.display = 'none';
    } else if (index && !activeBtn) {
      htmlBtn.classList.remove('demo-tab-switch-btn');
      jsBtn.classList.add('demo-tab-switch-btn');
      activeBtn = 1;
      htmlPre.style.display = 'block';
      jsPre.style.display = 'none';
    }
  }
}

function initDemo(_html, officeType, scenes) {
  const codePre = document.querySelector('.btnContainer');
  const iframe = initIframe(_html, codePre, officeType, scenes);
  return iframe;
}
function initIframe(_html, mountNode, officeType, scenes) {
  document.cookie = 'branch=amd-release-opf;';
  const matchFileNameRegex = /(?<=<\!-- \$name=)(.+)(?= -->)/g;
  const fileName = _html.match(matchFileNameRegex)[0];
  const iframe = document.createElement('iframe');
  iframe.classList.add('web-office-iframe');
  const attributes = {
    id: 'office-iframe',
    scrolling: 'no',
    frameborder: '0',
    src: `https://wwo.wps.cn/docs-js-sdk/openApi/demo?file=${fileName}&officeType=${officeType}&scenes=${scenes}`,
    allowfullscreen: 'allowfullscreen',
    webkitallowfullscreen: 'true',
    mozallowfullscreen: 'true',
  };
  mountNode.classList.add('web-office-default-container');
  attributes.style = 'height: 880px;';
  for (const key in attributes) {
    iframe.setAttribute(key, attributes[key]);
  }
  mountNode.parentNode.insertBefore(iframe, mountNode);
  return iframe;
}
function handleMsg(iframe, _jsString) {
  window.addEventListener('message', (e) => {
    if (typeof e.data === 'string') {
      const message = JSON.parse(e.data);
      if (message.eventName === 'demo.ready') {
        sendMsgToDemo({ eventName: 'code', jsString: _jsString });
      }
    }
  });
  function sendMsgToDemo(msg) {
    iframe.contentWindow.postMessage(JSON.stringify(msg), '*');
  }
}
