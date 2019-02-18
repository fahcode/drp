import Vue from 'vue'
import ElementUI from 'element-ui'
// import 'element-ui/lib/theme-chalk/index.css'
// import 'quill/dist/quill.core.css'
// import 'quill/dist/quill.bubble.css'
// import 'quill/dist/quill.snow.css'
import global from '../bm-generator/lib/global'
import App from './containers/App'
import store from './store'
import config from './config'
import router from './router'
import './element-theme/theme/index.css'

config.init()
Vue.use(ElementUI)
Vue.use(global.installPlugins())
global.installComponents()

/* eslint-disable no-new */
new Vue({
  // el: '#app',
  store,
  router,
  render: h => h(App),
}).$mount('#app')
/* eslint-enable no-new */
