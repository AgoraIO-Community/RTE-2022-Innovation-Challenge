import Vue from 'vue'
import App from './App.vue'

import BaiduMap from 'vue-baidu-map'

Vue.use(BaiduMap, {
  // ak 是在百度地图开发者平台申请的密钥 详见 http://lbsyun.baidu.com/apiconsole/key */
  ak: 'bhvzcRolrZ0Gg6xy0rN7qHj5fljmjI1G'
})

Vue.config.productionTip = false

window.vue = new Vue({
  render: h => h(App),
}).$mount('#app')
