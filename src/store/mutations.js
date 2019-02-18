/* eslint no-param-reassign: ["error", { "props": false }] */
import Vue from 'vue'
import router from '../router'
import helper from '../../bm-generator/lib/helper'

export default {
  getPermissionTree(state, res) {
    const value = res.value
    if (value === null || value.length == 0) {
      router.replace('/401')
      return
    }

    state.allPermissionTree = value
    state.curNavCode = value[0].id
    // 加载完成，触发 setDefaultUrl 事件
    let defaultUrl = router.app.$route.fullPath
    if ((!defaultUrl || defaultUrl == '/') && value.length > 0 && value[0].menus.length > 0
        && value[0].menus[0].pages.length > 0) {
      defaultUrl = helper.getPageUrl(value[0].menus[0].pages[0].resource)
    }
    Vue.Bus.$emit('setDefaultUrl', defaultUrl)
  },

  setNavCode(state, { id = '', url = '' }) {
    if (id != state.curNavCode && !url) {
      router.push(helper.getPageUrl(state.allPermissionTree.filter(p => p.id == id)[0].menus[0].pages[0].resource))
    }
    state.curNavCode = id
  },

  setBreadcrumb(state, breadcrumb = []) {
    state.breadcrumb = breadcrumb
  },

  setPermissionTree(state) {
    state.permissionTree = state.allPermissionTree.filter(t => t.code === state.curNavCode)
  },

  getUserInfo(state, res) {
    state.userInfo = res
  },

  pushError(state, res) {
    state.errors.push(res)
  },

  removeError(state, index) {
    state.errors.splice(index, 1)
  },

  clearErrors(state) {
    state.errors = []
  },
}
