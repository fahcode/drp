import request from '../../bm-generator/lib/request'
// import helper from '../../bm-generator/lib/helper'
// import router from '../router'

export default {
  async getPermissionTree({ commit }) {
    try {
      const res = await request({
        url: '/manage/auth/menutree',
      })
      if (res.code == 200) {
        commit('getPermissionTree', res)
        // commit('setPermissionTree')
      }
    } catch(e) { console.log(e); }
  },

  async getUserInfo({ commit }) {
    try {
      const res = await request.get('/user/info')
      if (res.code == 200) {
        commit('getUserInfo', res)
      }
    } catch(e) { console.log(e); }
  },

  setNavCode({ commit }, { id, url }) {
    commit('setNavCode', { id, url })
    // commit('setPermissionTree')
    // 更新路由
    // router.push(url)
  },
}
