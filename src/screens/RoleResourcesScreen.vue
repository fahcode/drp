<template lang="html">
  <div class="role-resource-wrapper" v-loading="loading.page">
    <el-card header="入口页面权限分配" class="block-card">
      <el-card class="project-card" :key="project.id" v-for="project in projects" :header="project.description">
        <div slot="header" class="clearfix">
          <span>{{project.description}}</span>
          <el-checkbox style="float:right"  v-model="project.isAll" @change="checkedAll({project})">全选</el-checkbox>
        </div>
        <el-card shadow="never" :key="menu.id" class="menu-card" v-for="menu in project.menus" :header="menu.description">
          <div slot="header" class="clearfix">
            <span>{{menu.description}}</span>
            <el-checkbox style="float:right" v-model="menu.isAll" @change="checkedAll({menu})">全选</el-checkbox>
          </div>
          <el-row :gutter="12" :key="i" v-for="(pageArr, i) in splitArray(menu.pages, 3)">
            <el-col :span="8" :key="page.id" v-for="page in pageArr">
              <el-card class="page-card" :header="page.description">
                <div slot="header" class="clearfix">
                  <el-checkbox v-model="page.select">{{page.description}}</el-checkbox>
                  <el-checkbox style="float:right" v-model="page.isAll" @change="checkedAll({page})">全选</el-checkbox>
                </div>
                <el-checkbox v-model="action.select" :key="action.id" v-for="action in page.actions">{{action.description}}</el-checkbox>
              </el-card>
            </el-col>
          </el-row>
        </el-card>
      </el-card>
    </el-card>

    <el-card header="查询条件权限分配" class="block-card">
      <el-card class="project-card" :key="category" v-for="(querys, category) in categoryQuerys" :header="category">
        <div slot="header" class="clearfix">
          <span>{{categoryMaps[category] || ''}}</span>
          <el-checkbox style="float:right" v-model="querys.isAll" @change="checkedAll({querys})">全选</el-checkbox>
        </div>
        <el-checkbox v-model="query.select" :key="query.id" v-for="query in querys">{{query.description}}</el-checkbox>
      </el-card>
    </el-card>


    <el-card header="视图权限分配" class="block-card">
      <div slot="header" class="clearfix">
        <span>视图权限分配</span>
        <el-checkbox style="float:right" v-model="views.isAll" @change="checkedAll({views})">全选</el-checkbox>
      </div>
      <el-checkbox v-model="view.select" :key="view.id" v-for="view in views">{{view.description}}</el-checkbox>
    </el-card>

    <footer>
      <el-button style="float: right;" :loading="loading.saveBtn" type="primary" @click="save">保存</el-button>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'RoleResourcesScreen',

  data() {
    return {
      roleId: this.$route.query.id,
      resources: [],
      categoryMaps: {},
      projects: [],
      menus: [],
      pages: [],
      actions: [],
      querys: [],
      views: [],
      categoryQuerys: {},
      loading: {
        page: false,
        saveBtn: false,
      },
    }
  },

  computed: {
  },

  created() {
    this.loadResources()
    this.loadCategory()
  },

  filter: {
  },

  methods: {
    splitArray(value, count) {
      return value.reduce((c, p) => {
        if (c[c.length -1].length < count) {
          c[c.length -1].push(p)
        } else {
          c.push([p])
        }
        return c
      }, [[]])
    },

    checkedAll({project, menu, page, querys, views}) {
      if (project) {
        project.menus.forEach(menu => {
          menu.select = project.isAll
          menu.isAll = menu.select
          this.checkedAll({ menu })
        })
      }
      if (menu) {
        menu.pages.forEach(page => {
          page.select = menu.isAll
          page.isAll = page.select
          this.checkedAll({ page })
        })
      }
      if (page) {
        page.actions.forEach(action => action.select = page.isAll)
      }
      if (querys) {
        querys.forEach(query => {
          query.select = querys.isAll
        })
      }
      if (views) {
        views.forEach(view => {
          view.select = views.isAll
        })
      }
    },

    initResources() {
      this.projects = this.resources.filter(p => p.type == 5).map(p => this.$helper.assign(p, {menus: [], isAll: false}))
      this.menus = this.resources.filter(p => p.type == 6).map(p => this.$helper.assign(p, {pages: [], isAll: false}))
      this.pages = this.resources.filter(p => p.type == 1).map(p => this.$helper.assign(p, {actions: [], isAll: false}))
      this.actions = this.resources.filter(p => p.type == 2)
      this.querys = this.resources.filter(p => p.type == 3)
      this.views = this.resources.filter(p => p.type == 4)
      this.categoryQuerys = this.querys.reduce((c, p) => {
        p.isAll = false
        c[p.category] = c[p.category] || []
        c[p.category].push(p)
        return c
      }, {})
      const isAllCheked = (items) => {
        let all = true
        items.forEach(p => {
          if (!p.select) {
            all = false
          }
        })
        return all
      }
      this.menus.forEach(menu => {
        for(let project of this.projects) {
          if (project.id == menu.parentId) {
            project.menus = project.menus || []
            project.menus.push(menu)
            menu.projectId = project.id
            break
          }
        }
      })
      this.projects.forEach(p => p.isAll = isAllCheked(p.menus))
      this.pages.forEach(page => {
        for(let menu of this.menus) {
          if (menu.id == page.parentId) {
            menu.pages = menu.pages || []
            menu.pages.push(page)
            page.menuId = menu.id
            page.projectId = menu.projectId
            break
          }
        }
      })
      this.menus.forEach(p => p.isAll = isAllCheked(p.pages))
      this.actions.forEach(action => {
        for(let page of this.pages) {
          if (page.id == action.parentId) {
            page.actions = page.actions || []
            page.actions.push(action)
            action.pageId = page.id
            action.menuId = page.menuId
            action.projectId = page.projectId
            break
          }
        }
      })
      this.pages.forEach(p => p.isAll = isAllCheked(p.actions))
      Object.keys(this.categoryQuerys).forEach(key => {
        this.categoryQuerys[key].isAll = isAllCheked(this.categoryQuerys[key])
      })
      this.views.isAll = isAllCheked(this.views)
    },

    async loadCategory() {
      try {
        let res = await this.$request.get('/manage/config/meta/data/list2?name=FRESOURCE_FCATEGORY', {
                                    params: {},
                                  })
        if (this.$helper.checkRequestResultMessage(this, res)) {
          this.categoryMaps = res.value.reduce((c, p) => {
            c[p.data] = p.value
            return c
          }, {})
        }
      } catch(e) { console.log(e) }

    },

    async loadResources() {
      this.loading.page = true
      try {
        let res = await this.$request.get('/manage/auth/role/resources', {
                                    params: {roleId: this.roleId},
                                  })
        if (this.$helper.checkRequestResultMessage(this, res)) {
          this.resources = res.value
          this.initResources()
        }
      } catch(e) { console.log(e) }
      this.loading.page = false
    },

    async save() {
      this.loading.saveBtn = true
      try {
        const res = await this.$request.post('/manage/auth/role/resource/update', this.$helper.filterEmptyParams({
          roleId: this.roleId,
          resourceIds: this.resources.filter(p => p.select).map(p => p.id),
        }))
        if (this.$helper.checkRequestResultMessage(this, res, '保存角色权限成功')) {
          console.log(res);
        }
      } catch(e) { console.log(e) }
      this.loading.saveBtn = false
    },
  },
}
</script>

<style lang="stylus" scoped>
.project-card, .block-card
  margin-bottom: 1.8rem
  .el-checkbox
    margin-left: 0
    margin-right: 30px
    margin-bottom: 8px
.project-card:last-child
  margin-bottom: 0
.menu-card, .page-card
  margin-bottom: 1.2rem
</style>
