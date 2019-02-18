<template>
  <aside class="app-sidebar">
    <div class="logo">
      <span>{{logo}}</span>
    </div>
    <el-menu theme="dark" :router="true" :default-active="activePath" :unique-opened="true">
      <template v-for="(menu, index) in permissionTree">
        <el-submenu :key="menu.id" :index="String(index)">
          <template slot="title">
            {{menu.name}}
          </template>
          <el-menu-item v-show="page.inMenu" v-for="page in menu.pages" :key="page.id" :index="$helper.getPageUrl(page.resource)">
            {{page.name}}
          </el-menu-item>
        </el-submenu>
      </template>
    </el-menu>
  </aside>
</template>

<script>
// import { mapState, mapActions } from 'vuex'

import { mapState, mapActions, mapMutations } from 'vuex'
// import Enums from '../enums'

export default {
  name: 'AppSidebar',

  data() {
    return {
      activePath: this.$route.path,
    }
  },

  computed: {
    ...mapState([
      'logo',
      'curNavCode',
      'allPermissionTree',

      'errors',
      // 'allPermissionTree',
      'navChildPage',
      // 'curNavCode',
    ]),

    permissionTree() {
      const project = this.allPermissionTree.filter(p => p.id == this.curNavCode)[0]
      if (project) {
        return project.menus
      }
      return []
    },
  },

  watch: {
    $route() {
      this.activePath = this.$route.path

      this.updateBreadcrumb()
    },

    allPermissionTree() {
      this.updateBreadcrumb()
      // if (['not_found', 'permission_deny'].indexOf(this.$route.name) == -1) {
      //   if (!hasPermission) {
      //     this.$router.replace('/401')
      //   }
      // }
    },

    errors(val) {
      val.forEach((t) => {
        let title = ''
        let message = ''
        if (t.type === 'response') {
          title = '接口错误'
          message = `
            接口：${t.res.config.url}
            信息：${t.res.message}
          `
        } else if (t.type === 'auth') {
          title = '权限错误'
          message = t.res.data.message || '无权访问当前页面或接口'
        }
        this.$notify.error({
          title,
          message,
        })
      })
      if (val.length) this.clearErrors()
    },
  },

  methods: {
    ...mapActions([
      'getPermissionTree',

      'getUserInfo',
      'setNavCode',
    ]),
    ...mapMutations([
      'setBreadcrumb',
      'removeError',
      'clearErrors',
    ]),

    updateBreadcrumb() {
      const path = this.$route.path
      if (!path || path == '/') return
      this.allPermissionTree.forEach(project => {
        project.menus.forEach(menu => {
          menu.pages.forEach(page => {
            if (this.$helper.getPageUrl(page.resource) == path) {
              this.setNavCode({ id: project.id, url: path })
              this.setBreadcrumb([ project.name, menu.name, page.name ])
            }
          })
        })
      })
    },
  },

  created() {
    this.getPermissionTree()

    this.getUserInfo()
  },
}
</script>

<style lang="stylus">
  .app-sidebar
    display flex
    flex-direction column
  .el-menu[theme="dark"]
    flex 1
    overflow-y auto
    transition background-color
    .el-submenu__title:hover, .el-menu-item:hover
      background-color #48576a
  .logo
    display flex
    flex 0 0 60px
    justify-content center
    align-items center
    background-color #357ca5
    color #fff
    font-size 1.6rem
</style>
