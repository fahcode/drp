<template>
  <header class="app-header">
    <ul class="nav-tab">
      <li v-for="nav in allPermissionTree" :class="{'nav-tab__items': true, active: curNavCode == nav.id}" :key="nav.id" @click="setNavCode(nav)">{{nav.name}}</li>
    </ul>
    <div class="user" v-if="userInfo">
      <div :class="{intro: true, active: showUserDetail}" @click="showUserDetail = !showUserDetail">
        <img :src="userInfo.avatar" />
        <span>{{userInfo.loginName}}</span>
      </div>
      <div class="detail" v-show="showUserDetail">
        <div>
          <img :src="userInfo.avatar" />
          <p>{{userInfo.loginName}}</p>
          <p>{{userInfo.meizuEmail}}</p>
        </div>
        <footer>
          <el-button type="warning" size="small" @click="logout">退出</el-button>
        </footer>
      </div>
    </div>
  </header>
</template>

<script>
import { mapState, mapActions } from 'vuex'
// import expose from '@flyme/bm-generator/lib/expose'

export default {
  name: 'AppHeader',
  data() {
    return {
      showUserDetail: false,
    }
  },

  computed: {
    ...mapState([
      'logo',
      'userInfo',
      'allPermissionTree',
      'curNavCode',
    ]),
  },

  methods: {
    ...mapActions([
      'setNavCode',
    ]),

    logout() {
      location.href = `https://uac.meizu.com/logout.do?redirectUrl=https://drp2-api.meizu.com/logout`
    },
  },
}
</script>

<style lang="stylus" scoped>
  .app-header
    flex 0 0 60px
    display flex
    background-color #3c8dbc
    box-shadow 0px 2px 10px rgb(158, 158, 158)
    z-index 20
    align-items center
  .nav-tab
    flex 1
    list-style none
    display flex
    padding 0
    height 100%
    .nav-tab__items
      padding 0 30px
      display flex
      align-items center
      cursor pointer
      color #e0e0e0
    .active
      background-color #036fa7
      cursor text
      color #fff
  .user
    display flex
    position relative
    color #fff
    align-items center
    height 100%
    img
      border-radius 50%
    .intro
      display flex
      align-items center
      cursor pointer
      padding 0 12px
      height 100%
      &.active
        background: #037fa9;
      img
        width 3.6rem
        height 3.6rem
        margin-right 8px
    .detail
      position: absolute;
      top: 100%;
      right: 0;
      border: 1px solid #d6d6d6;
      background: #fff;
      text-align: center;
      width: 260px;
      border-top: none;
      border-radius: 0 0 3px 3px;
      box-shadow: 0 0 3px #d2d2d2;
      > div
        background #1e9cbd
        padding 12px 0
        img
          height: 10rem;
          border: 2px solid #6fcee4;
        p
          margin 0
          &:first-of-type
            margin 6px 0
          &:last-of-type
            font-size 12px
      footer
        padding 8px 12px
        text-align right
</style>
