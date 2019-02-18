<template lang="html">
  <div class="resource-wrapper">
    <generator-screen ref="page" list-url="/manage/auth/resource/list"
      delete-url="/manage/auth/resource/delete"
      :default-config="setting" :default-enums="enums"
      @click="customClickAction">
      <template slot="table-column">
        <el-table-column label="菜单显示" prop="inMenu" width="90px">
          <template slot-scope="scope">
            <el-checkbox v-if="[1].indexOf(scope.row.type) != -1" v-model="scope.row.inMenu" @change="saveItem(scope.row)"></el-checkbox>
          </template>
        </el-table-column>
          <el-table-column label="排序" prop="weight" width="160px">
            <template slot-scope="scope">
              <el-input v-model="scope.row.weight" v-if="[1, 5, 6].indexOf(scope.row.type) != -1">
                <el-button slot="append" icon="el-icon-edit" @click="saveItem(scope.row)"></el-button>
              </el-input>
            </template>
          </el-table-column>
      </template>
    </generator-screen>
    <el-dialog :title="dialog.type == 'add' ? '添加资源' : '修改资源'" :visible.sync="dialog.visible">
      <el-form label-width="100px">
        <el-form-item label="类型">
          <el-radio-group v-model="dialog.params.type">
            <el-radio v-for="item in  enums.type" :key="item.value" :label="item.value">{{item.name}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="所属项目" v-if="[1, 6].indexOf(dialog.params.type) != -1">
          <el-select v-model="project.value" placeholder="请选择">
            <el-option
              v-for="item in project.list"
              :key="item.id"
              :label="item.description"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属菜单" v-if="[1].indexOf(dialog.params.type) != -1">
          <el-select v-model="menu.value" placeholder="请选择">
            <el-option
              v-for="item in menu.maps[project.value] || []"
              :key="item.id"
              :label="item.description"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="资源">
          <el-autocomplete v-model="dialog.params.resource"
                          :fetch-suggestions="queryResourceSearch"
                          placeholder="请输入资源链接"
                          @select="handleResourceSelect"
                          @blur="getActions"></el-autocomplete>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="dialog.params.description" placeholder="请输入资源描述"></el-input>
        </el-form-item>
        <el-form-item label="分类" v-if="dialog.params.type == 3">
          <cf-select v-model="dialog.params.category"
            :entry="{placeholder: '请选择分类',
              options: {
                url: '/manage/config/meta/data/list2?name=FRESOURCE_FCATEGORY',
                remote: true,
                param: '',
                method: 'get',
                filter: 'return res.value.map(function(p) { return {name: p.value, value: p.id}; })'
              }}">
          </cf-select>
        </el-form-item>
        <el-form-item label="排序" v-if="[1, 5, 6].indexOf(dialog.params.type) != -1">
          <el-input v-model="dialog.params.weight" placeholder="请输入排序权重"></el-input>
        </el-form-item>
        <el-form-item label="菜单显示" v-if="[1].indexOf(dialog.params.type) != -1">
          <el-checkbox v-model="dialog.params.inMenu"></el-checkbox>
        </el-form-item>
        <el-form-item label="动作" v-if="dialog.params.type == 1">
          <el-checkbox-group v-if="!isNaN(parseInt(dialog.params.resource))" v-model="dialog.params.actions">
            <el-checkbox :disabled="true" v-for="action in dialog.params.actions" :label="action" :key="action.resource">{{action.description}}</el-checkbox>
          </el-checkbox-group>
          <div v-else>
            <el-table
              :data="dialog.params.actions"
              style="width: 100%">
              <el-table-column label="名称" prop="name">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.description"></el-input>
                </template>
              </el-table-column>
              <el-table-column label="URL" prop="type">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.resource"></el-input>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="80px">
                <template slot-scope="scope" v-if="!scope.row.id">
                  <el-button type="text" @click="deleteViewActionRow(dialog.params.actions, scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <i class="el-icon-plus action-add" @click="dialog.params.actions.push({resource: '', description: '', type: 2})"></i>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialog.visible = false">取 消</el-button>
        <el-button type="primary" @click="submitDialog(dialog.type)">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// import GeneratorScreen from '../../bm-generator/lib/export/GeneratorScreen'
import Config from '../../bm-generator/lib/config'


export default {
  name: 'ResourceScreen',
  components: {
    // GeneratorScreen
    GeneratorScreen: () => import( /* webpackChunkName: "GeneratorScreen" */ '../../bm-generator/lib/export/GeneratorScreen')
  },
  data() {
    return {
      listUrl: '/manage/auth/resource/list',
      enums: {
        type: [{
          name: '入口',
          value: 1,
        }, {
          name: '动作',
          value: 2,
        }, {
          name: '查询条件',
          value: 3,
        }, {
          name: '视图',
          value: 4,
        }, {
          name: '项目',
          value: 5,
        }, {
          name: '菜单',
          value: 6,
        }]
      },
      setting: {
        "data": {
          "sources": [],
          "columns": [{
            "label": "资源id",
            "name": "id",
            "isKey": true,
            "isUse": true,
            "isShow": true,
            "isQuery": false,
            "isGroup": false,
            "hidden": false,
            "compare": 0,
            "modal": {
              "belong": [],
              "uneditable": false,
              "hidden": false
            },
            "create": 1528878439000,
            "creator": "temp_test",
            "custom": "{\"dataType\":\"raw\",\"format\":\"\",\"options\":{\"filter\":false,\"clearable\":true,\"notIncludeToday\":\"\",\"defaultValue\":\"\",\"disabledDate\":\"\",\"multiple\":false,\"format\":\"\"},\"width\":\"90px\",\"placeholder\":\"\",\"type\":\"text\",\"url\":\"\"}",
            "id": 405,
            "manual": false,
            "modifier": "temp_test",
            "modify": 1528878439000,
            "tableId": 5
          }, {
            "label": "资源",
            "name": "resource",
            "isKey": false,
            "isUse": true,
            "isShow": true,
            "isQuery": true,
            "isGroup": false,
            "hidden": false,
            "compare": 0,
            "modal": {
              "belong": [],
              "uneditable": false,
              "hidden": false
            },
            "create": 1528878439000,
            "creator": "temp_test",
            "custom": "{\"dataType\":\"raw\",\"format\":\"\",\"options\":{\"filter\":false,\"clearable\":true,\"notIncludeToday\":\"\",\"defaultValue\":\"\",\"disabledDate\":\"\",\"multiple\":false,\"format\":\"\"},\"width\":\"\",\"placeholder\":\"\",\"type\":\"text\",\"url\":\"\"}",
            "id": 406,
            "manual": false,
            "modifier": "temp_test",
            "modify": 1528878439000,
            "tableId": 5
          }, {
            "label": "资源描述",
            "name": "description",
            "isKey": false,
            "isUse": true,
            "isShow": true,
            "isQuery": true,
            "isGroup": false,
            "hidden": false,
            "compare": 0,
            "modal": {
              "belong": [],
              "uneditable": false,
              "hidden": false
            },
            "create": 1528878439000,
            "creator": "temp_test",
            "custom": "{\"dataType\":\"raw\",\"format\":\"\",\"options\":{\"filter\":false,\"clearable\":true,\"notIncludeToday\":\"\",\"defaultValue\":\"\",\"disabledDate\":\"\",\"multiple\":false,\"format\":\"\"},\"width\":\"\",\"placeholder\":\"\",\"type\":\"text\",\"url\":\"\"}",
            "id": 407,
            "manual": false,
            "modifier": "temp_test",
            "modify": 1528878439000,
            "tableId": 5
          }, {
            "label": "资源类型",
            "name": "type",
            "isKey": false,
            "isUse": true,
            "isShow": true,
            "isQuery": true,
            "isGroup": false,
            "hidden": false,
            "compare": 0,
            "modal": {
              "belong": [],
              "uneditable": false,
              "hidden": false
            },
            "create": 1528878439000,
            "creator": "temp_test",
            "custom": "{\"dataType\":\"enum\",\"format\":\"\",\"options\":{\"filter\":false,\"clearable\":true,\"notIncludeToday\":\"\",\"defaultValue\":\"\",\"disabledDate\":\"\",\"multiple\":false,\"format\":\"\"},\"width\":\"\",\"placeholder\":\"\",\"type\":\"dropdown\",\"url\":\"\"}",
            "id": 408,
            "manual": false,
            "modifier": "temp_test",
            "modify": 1528878439000,
            "tableId": 5
          }, {
            "label": "分类",
            "name": "category",
            "isKey": false,
            "isUse": true,
            "isShow": true,
            "isQuery": true,
            "isGroup": false,
            "hidden": false,
            "compare": 0,
            "modal": {
              "belong": [],
              "uneditable": false,
              "hidden": false
            },
            "create": 1528878439000,
            "creator": "temp_test",
            "custom": "{\"dataType\":\"enum\",\"format\":\"\",\"options\":{\"url\":\"/manage/config/meta/data/list2?name=FRESOURCE_FCATEGORY\",\"filter\":false,\"clearable\":true,\"notIncludeToday\":\"\",\"defaultValue\":\"\",\"disabledDate\":\"\",\"multiple\":false,\"format\":\"\"},\"width\":\"\",\"placeholder\":\"\",\"type\":\"dropdown\",\"url\":\"\"}",
            "id": 408,
            "manual": false,
            "modifier": "temp_test",
            "modify": 1528878439000,
            "tableId": 5
          }, {
            "label": "parentId",
            "name": "parentId",
            "isKey": false,
            "isUse": true,
            "isShow": false,
            "isQuery": true,
            "isGroup": false,
            "hidden": false,
            "compare": 0,
            "modal": {
              "belong": [],
              "uneditable": false,
              "hidden": false
            },
            "create": 1528878439000,
            "creator": "temp_test",
            "custom": "{\"dataType\":\"raw\",\"format\":\"\",\"options\":{\"filter\":false,\"clearable\":true,\"notIncludeToday\":\"\",\"defaultValue\":\"\",\"disabledDate\":\"\",\"multiple\":false,\"format\":\"\"},\"width\":\"\",\"placeholder\":\"\",\"type\":\"text\",\"url\":\"\"}",
            "id": 413,
            "manual": false,
            "modifier": "temp_test",
            "modify": 1528878439000,
            "tableId": 5
          }, {
            "label": "排序",
            "name": "sort",
            "isKey": false,
            "isUse": false,
            "isShow": false,
            "isQuery": false,
            "isGroup": false,
            "hidden": true,
            "compare": 0,
            "modal": {
              "belong": [],
              "uneditable": false,
              "hidden": false
            },
            "create": 1528878439000,
            "creator": "temp_test",
            "custom": "{\"dataType\":\"raw\",\"format\":\"\",\"options\":{\"filter\":false,\"clearable\":true,\"notIncludeToday\":\"\",\"defaultValue\":\"\",\"disabledDate\":\"\",\"multiple\":false,\"format\":\"\"},\"width\":\"\",\"placeholder\":\"\",\"type\":\"text\",\"url\":\"\"}",
            "id": 413,
            "manual": false,
            "modifier": "temp_test",
            "modify": 1528878439000,
            "tableId": 5
          }, {
            "label": "创建人",
            "name": "creator",
            "isKey": false,
            "isUse": false,
            "isShow": false,
            "isQuery": false,
            "isGroup": false,
            "hidden": true,
            "compare": 0,
            "modal": {
              "belong": [],
              "uneditable": false,
              "hidden": false
            },
            "create": 1528878439000,
            "creator": "temp_test",
            "custom": "{\"dataType\":\"raw\",\"format\":\"\",\"options\":{\"filter\":false,\"clearable\":true,\"notIncludeToday\":\"\",\"defaultValue\":\"\",\"disabledDate\":\"\",\"multiple\":false,\"format\":\"\"},\"width\":\"\",\"placeholder\":\"\",\"type\":\"text\",\"url\":\"\"}",
            "id": 414,
            "manual": false,
            "modifier": "temp_test",
            "modify": 1528878439000,
            "tableId": 5
          }, {
            "label": "创建时间",
            "name": "create",
            "isKey": false,
            "isUse": false,
            "isShow": false,
            "isQuery": false,
            "isGroup": false,
            "hidden": true,
            "compare": 0,
            "modal": {
              "belong": [],
              "uneditable": false,
              "hidden": false
            },
            "create": 1528878439000,
            "creator": "temp_test",
            "custom": "{\"dataType\":\"time\",\"format\":\"yyyy-MM-dd\",\"options\":{\"filter\":false,\"clearable\":true,\"notIncludeToday\":\"\",\"defaultValue\":\"\",\"disabledDate\":\"\",\"multiple\":false,\"format\":\"\"},\"width\":\"\",\"placeholder\":\"\",\"type\":\"date\",\"url\":\"\"}",
            "id": 415,
            "manual": false,
            "modifier": "temp_test",
            "modify": 1528878439000,
            "tableId": 5
          }, {
            "label": "修改人",
            "name": "modifier",
            "isKey": false,
            "isUse": false,
            "isShow": false,
            "isQuery": false,
            "isGroup": false,
            "hidden": true,
            "compare": 0,
            "modal": {
              "belong": [],
              "uneditable": false,
              "hidden": false
            },
            "create": 1528878439000,
            "creator": "temp_test",
            "custom": "{\"dataType\":\"raw\",\"format\":\"\",\"options\":{\"filter\":false,\"clearable\":true,\"notIncludeToday\":\"\",\"defaultValue\":\"\",\"disabledDate\":\"\",\"multiple\":false,\"format\":\"\"},\"width\":\"\",\"placeholder\":\"\",\"type\":\"text\",\"url\":\"\"}",
            "id": 416,
            "manual": false,
            "modifier": "temp_test",
            "modify": 1528878439000,
            "tableId": 5
          }, {
            "label": "修改时间",
            "name": "FMODIFY",
            "isKey": false,
            "isUse": false,
            "isShow": false,
            "isQuery": false,
            "isGroup": false,
            "hidden": true,
            "compare": 0,
            "modal": {
              "belong": [],
              "uneditable": false,
              "hidden": false
            },
            "create": 1528878439000,
            "creator": "temp_test",
            "custom": "{\"dataType\":\"time\",\"format\":\"yyyy-MM-dd\",\"options\":{\"filter\":false,\"clearable\":true,\"notIncludeToday\":\"\",\"defaultValue\":\"\",\"disabledDate\":\"\",\"multiple\":false,\"format\":\"\"},\"width\":\"\",\"placeholder\":\"\",\"type\":\"date\",\"url\":\"\"}",
            "id": 417,
            "manual": false,
            "modifier": "temp_test",
            "modify": 1528878439000,
            "tableId": 5
          }, {
            "label": "更新时间",
            "name": "modify",
            "isKey": false,
            "isUse": false,
            "isShow": false,
            "isQuery": false,
            "isGroup": false,
            "hidden": true,
            "compare": 0,
            "modal": {
              "belong": [],
              "uneditable": false,
              "hidden": false
            },
            "create": 1528878439000,
            "creator": "temp_test",
            "custom": "{\"dataType\":\"raw\",\"format\":\"\",\"options\":{\"filter\":false,\"clearable\":true,\"notIncludeToday\":\"\",\"defaultValue\":\"\",\"disabledDate\":\"\",\"multiple\":false,\"format\":\"\"},\"width\":\"\",\"placeholder\":\"\",\"type\":\"text\",\"url\":\"\"}",
            "id": 412,
            "manual": false,
            "modifier": "temp_test",
            "modify": 1528878439000,
            "tableId": 5
          }]
        },
        "view": {
          "pageActions": ["search", "export"],
          "tableActions": ["detail", "delete"],
          "customPageActions": [{ type: 'event', name: '新增', code: 'add'}],
          "customTableActions": [{ type: 'event', name: '更新', code: 'update'}]
        }
      },
      dialog: {
        visible: false,
        type: '',
        params: {
          id: '',
          type: '',
          resource: '',
          parentId: '',
          description: '',
          category: '',
          weight: 0,
          actions: [],
          inMenu: true,
        },
      },
      project: {
        value: '',
        list: [],
      },
      menu: {
        value: '',
        maps: {},
      },
      templatePages: [],
    }
  },

  created() {
    this.loadProjectList()
    this.loadMenuData()
    this.loadAllTemplatePages()
  },

  methods: {
    resetDialog() {
      this.dialog = {
        visible: false,
        params: {
          id: '',
          type: '',
          resource: '',
          parentId: '',
          description: '',
          category: '',
          weight: 100,
          actions: [],
          inMenu: true,
        },
      }
    },

    reset() {
      this.resetDialog()
      this.project = {
        value: '',
        list: [],
      }
      this.menu = {
        value: '',
        maps: {},
      }
    },


    customClickAction(btn, info) {
      if (['add', 'update'].indexOf(btn.code) != -1) {
        this.resetDialog()
        if (info) {
          this.dialog.params = this.$helper.assign(this.dialog.params, info)
          if (this.dialog.params.type == 6) {
            this.project.value = this.dialog.params.parentId || ''
          } else if (this.dialog.params.type == 1) {
            this.menu.value = this.dialog.params.parentId || ''
            // 根据menu树查找project
            this.project.value = Object.keys(this.menu.maps)
                                        .reduce((c, p) => {
                                          if (this.menu.maps[p]
                                                .map(menu => parseInt(menu.id))
                                                .indexOf(this.menu.value) != -1) {
                                            c = parseInt(p)
                                          }
                                          return c
                                        }, '')
            this.getActions()
          }
        }
        this.dialog.type = btn.code
        this.dialog.visible = true
      }
    },

    deleteViewActionRow(actions, row) {
      const index = actions.indexOf(row)
      if (index != -1) {
        actions.splice(index, 1)
      }
    },

    queryResourceSearch(queryString, cb) {
      const results = this.templatePages.filter(p => {
        return p.FID == queryString || p.FNAME.toLowerCase().indexOf(queryString.toLowerCase()) != -1
      }).map(p => {
        p.value = `${p.FNAME}(${p.FID})`
        return p
      })
      cb(results)
    },

    handleResourceSelect(item) {
      this.dialog.params.resource = String(item.FID)
      this.dialog.params.description = item.FNAME
      this.getActions()
    },

    async loadAllTemplatePages() {
      try {
        let res = await this.$request.get('/manage/page/query', {
                                    params: {
                                      pid: 1,
                                      start: 0,
                                      max:5000,
                                      orderBy: 'FID',
                                      sortType: 'desc',
                                    },
                                  })
        if (this.$helper.checkRequestResultMessage(this, res)) {
          this.templatePages = res.value.data
        }
      } catch(e) { console.log(e) }

    },

    async loadProjectList() {
      try {
        let res = await this.$request.get(this.listUrl, {
                                    params: {
                                      type: 5,
                                      start: 0,
                                      max: 500,
                                    },
                                  })
        if (this.$helper.checkRequestResultMessage(this, res)) {
          this.project.list = res.value.data
        }
      } catch(e) { console.log(e) }
    },

    async loadMenuData() {
      try {
        let res = await this.$request.get(this.listUrl, {
                                    params: {
                                      type: 6,
                                      start: 0,
                                      max: 500,
                                    },
                                  })
        if (this.$helper.checkRequestResultMessage(this, res)) {
          this.menu.maps = res.value.data.reduce((c, p) => {
            if (p.parentId) {
              c[p.parentId] = c[p.parentId] || []
              c[p.parentId].push(p)
            }
            return c
          }, {})
        }
      } catch(e) { console.log(e) }
    },

    async submitDialog(type) {
      try {
        let url = ''
        if (type == 'add') {
          url = '/manage/auth/resource/add'
        } else {
          url = '/manage/auth/resource/update'
        }
        // 重赋值 parentId
        this.dialog.params.parentId = ''
        if (this.dialog.params.type == 6) {
          this.dialog.params.parentId = this.project.value
        } else if (this.dialog.params.type == 1) {
          this.dialog.params.parentId = this.menu.value
        }
        let params = this.$helper.assign({}, this.dialog.params)
        if (params.type != 1) {
          delete params.actions
        }
        params = this.$helper.filterEmptyParams(params)
        const res = await this.$request.post(url, params)
        if (this.$helper.checkRequestResultMessage(this, res, '提交成功!')) {
          this.dialog.visible = false
          this.$refs.page.loadDataTable()
          this.reset()
          this.loadProjectList()
          this.loadMenuData()
        }
      } catch(e) { console.log(e) }

    },

    async getActions() {
      if (this.request_getActions) return
      this.request_getActions = true
      if (this.dialog.params.type == 1 && this.dialog.params.resource) {
        const pid = parseInt(this.dialog.params.resource)
        if (isNaN(pid)) {
          if (this.dialog.params.id) {
            try {
              const res = await this.$request.get('/manage/auth/resource/get', {
                params: {id: this.dialog.params.id},
              })
              if (this.$helper.checkRequestResultMessage(this, res)) {
                this.dialog.params.actions = res.value.actions
              }
            } catch(e) { console.log(e) }
          }
        } else {
          try {
            const res = await this.$request.get('/manage/config/page_config/get', {
                                          params: { pid },
                                        })
            if (this.$helper.checkRequestResultMessage(this, res)) {
              const setting = JSON.parse(res.value.page.view)
              const pageActions = setting.view.pageActions
              const tableActions = setting.view.tableActions
              const customPageActions = setting.view.customPageActions
              const customTableActions = setting.view.customTableActions
              const actions = []
              Config.pageActions.forEach(p => {
                if (pageActions.indexOf(p.value) != -1) {
                  actions.push(p)
                }
              })
              Config.tableActions.forEach(p => {
                if (tableActions.indexOf(p.value) != -1) {
                  actions.push(p)
                }
              })
              customPageActions.forEach(p => {
                actions.push({
                  name: p.name,
                  value: p.config.path,
                  type: p.type,
                })
              })
              customTableActions.forEach(p => {
                actions.push({
                  name: p.name,
                  value: p.config.path,
                  type: p.type,
                })
              })
              this.dialog.params.actions = actions.map(p => ({
                resource: p.value,
                type: 2,
                description: p.name || p.label,
              }))
            }
          } catch(e) { console.log(e) }
        }
      }
      this.request_getActions = false
    },

    async saveItem(row) {
      try {
        const res = await this.$request.post('/manage/auth/resource/update', row)
        if (this.$helper.checkRequestResultMessage(this, res, '更新成功!')) {
          this.$refs.page.loadDataTable()
        }
      } catch(e) { console.log(e) }
    },
  }
}
</script>

<style lang="css">
</style>
