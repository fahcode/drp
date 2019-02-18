<template>
  <div id="app" :class="{fullscreen: isFullscreen}">
    <section>
      <app-sidebar v-if="!isFullscreen"></app-sidebar>
      <app-content></app-content>
    </section>
  </div>
</template>

<script>
// import { mapState, mapActions, mapMutations } from 'vuex'
import AppHeader from './AppHeader'
import AppSidebar from './AppSidebar'
import AppContent from './AppContent'
// import Request from '@flyme/bm-generator/lib/request'

export default {
  name: 'app',

  components: {
    AppHeader,
    AppSidebar,
    AppContent,
  },

  data() {
    return {
      isFullscreen: !!this.$route.query.__fullscreen || location.hash.indexOf('__fullscreen') != -1,
      // isFullscreen: true
    }
  },

  computed: {
    // ...mapState([
    //   'errors',
    //   'allPermissionTree',
    //   'navChildPage',
    //   'curNavCode',
    // ]),

    hideSidebar() {
      return location.hash.indexOf('&main=1') != -1
    },
  },

  methods: {
    // ...mapActions([
    //   'getUserInfo',
    //   'setNavCode',
    // ]),
    // ...mapMutations([
    //   'setBreadcrumb',
    //   'removeError',
    //   'clearErrors',
    // ]),
    fullscreen(route) {
      /* eslint-disable no-underscore-dangle */
      if (route.query.__fullscreen) {
        this.isFullscreen = true
      }
      /* eslint-enable no-underscore-dangle */
    },

    // updateBreadcrumb() {
    //   const path = this.$route.path
    //   if (!path || path == '/') return
    //   this.allPermissionTree.forEach(project => {
    //     project.menus.forEach(menu => {
    //       menu.pages.forEach(page => {
    //         if (this.$helper.getPageUrl(page.resource) == path) {
    //           this.setNavCode({ id: project.id, url: path })
    //           this.setBreadcrumb([ project.name, menu.name, page.name ])
    //         }
    //       })
    //     })
    //   })
    // },
  },

  watch: {
    // errors(val) {
    //   val.forEach((t) => {
    //     let title = ''
    //     let message = ''
    //     if (t.type === 'response') {
    //       title = '接口错误'
    //       message = `
    //         接口：${t.res.config.url}
    //         信息：${t.res.message}
    //       `
    //     } else if (t.type === 'auth') {
    //       title = '权限错误'
    //       message = t.res.data.message || '无权访问当前页面或接口'
    //     }
    //     this.$notify.error({
    //       title,
    //       message,
    //     })
    //   })
    //   if (val.length) this.clearErrors()
    // },

    // allPermissionTree() {
    //   this.updateBreadcrumb()
    //   // if (['not_found', 'permission_deny'].indexOf(this.$route.name) == -1) {
    //   //   if (!hasPermission) {
    //   //     this.$router.replace('/401')
    //   //   }
    //   // }
    // },

    $route(val) {
      this.fullscreen(val)
      // this.$bus.$emit('generator-action', 'access')
      // this.updateBreadcrumb()
    },
  },

  created() {
    // this.getUserInfo()
  },

  mounted() {
    // this.fullscreen(this.$route)
  },
}
</script>

<style lang="stylus">
  *
    box-sizing border-box
    &:before, &:after
      box-sizing border-box
  html, body
    height 100%
    font-size 10px
  body
    height 100%
    margin 0
    font-family "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif
  a
    text-decoration none
  code
    color #af0c4d
  .red
    color #f20000
  .clearfix
    &:before, &:after
      content " "
      display table
    &:after
      clear both
  #app
    display flex
    height 100%
    font-size 1.4rem
    flex-direction column
    [class*="el-col-"]
      float none
      display inline-block
      vertical-align: top;
    &.fullscreen
      .app-sidebar, .app-header
        display none
      main
        .main-router-view
          background: #fff
          padding: 0
    > header
      flex 0 0 6rem
    > section
      display flex
      flex 1
      > aside
        flex 0 0 20rem
        > .el-menu
          border-radius 0
    .el-table
      .cell, th>div
        padding-left 10px
        padding-right 10px
        min-height 48px
        display flex
        align-items center
        line-height 1.5
        >.cell-content-wrap
          text-overflow -o-ellipsis-lastline
          overflow hidden
          text-overflow ellipsis
          display -webkit-box
          -webkit-line-clamp 2
          -webkit-box-orient vertical
  .el-dialog__footer, .el-row
    clear both
  .el-table__body, .el-table__header
    width 100%
  .info-wrapper
    width 100%
    .el-row
      min-height 36px
      line-height 36px
      .el-col
        min-height 1px
      .el-col-4
        text-align right
        padding-right 8px
        background #f3f3f3
      .el-col-8, .el-col-20
        padding-left 8px
      .el-col-24
        padding 6px
    .info-title
      text-align center
      line-height 36px
      height 36px
      background #3552ab
      color #fff
      margin 16px -6px -6px -6px
      a
        color #fff
        text-decoration underline
  .cert-list
    padding 0
    margin 0
    list-style none
    li
      float left
      width 25%
      text-align center
      img
        display block
        width 96%
        margin 0 auto 4px auto
  .data-table
    width 100%
  .data-table-summary
    border-top none
    color #20a0ff
    tr, td
      background-color #eef1f6
  .data-table-pagination
    margin-top 1.2rem
    text-align right
  .navs-wrapper
    background #1f2d3d
    margin -2rem -2rem 2rem -2rem
    position relative
    z-index 30
    ul
      margin 0
      padding 0
      list-style none
      li
        float left
        a
          display block
          height 56px
          padding 0 32px
          line-height 56px
          text-align center
          color #bfcbd9
          &:hover
            background #48576a
          &.active
            color #1f2d3d
            background #eef1f5
  // 添加对 checkbox-group 的样式修改
  .el-form-item__content
    .el-checkbox, .el-checkbox+.el-checkbox
      margin-right 15px
      margin-left 0
  // 产品(刘元)的需求，不让点击小图标...(汗)
  .el-table
    .sort-caret.ascending, .sort-caret.descending
      pointer-events none

  .fixed-table-header
    position: fixed;
    top: 60px;
    z-index: 10
    .el-table__header
      background: #fff
</style>
