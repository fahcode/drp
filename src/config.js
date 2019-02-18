import Vue from 'vue'
import expose from '../bm-generator/lib/expose'
import request from '../bm-generator/lib/request'
import store from './store'

export default {
  init() {
    expose.HOST = 'https://drp2-api.meizu.com'
    request.interceptors.response.use((res) => {
      if (res.status === 200 && res.data && (res.data.code === 110001 || res.data.code == 20001)) {
        location.href = res.data.value
        // 需要登录
        // location.href = `https://login.flyme.cn/login/login.html?useruri=${encodeURIComponent(location.href)}`
        return {
          code: 302,
          message: '未登录',
          value: {
            data: [],
            total: 0,
          },
        }
      }

      if (res.status == 200 && res.data && res.data.code != 200 && res.data.message) {
        store.commit('pushError', {
          type: 'auth',
          res,
        })
      }

      // if (res.status === 200 && typeof res.data === 'string' && res.data.indexOf('权限') !== -1) {
      //   store.commit('pushError', {
      //     type: 'auth',
      //     res,
      //   })
      // }
      return res.data
    }, (res) => {
      if (!res.url) {
        console.log('Request canceled', res.message)
      } else {
        // handle error
        store.commit('pushError', {
          type: 'response',
          res,
        })
      }
    })
    this.installComponents()
  },
  installComponents() {
    // Vue.component('ModuleLinkSelect', ModuleLinkSelect)
    Vue.component('VueEchart', () => import( /* webpackChunkName: "VueEchart" */ './components/VueEchart'))
    Vue.component('Breadcrumb', () => import( /* webpackChunkName: "Breadcrumb" */ './components/Breadcrumb'))
  },
}
