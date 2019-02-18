<template lang="html">
  <div class="resource-wrapper">
    <generator-screen ref="page" list-url="/manage/auth/newUserInfo"
      delete-url="/manage/auth/deleteUser"
      :default-config="setting" :default-enums="enums"
      @click="customClickAction">
    </generator-screen>
  </div>
</template>

<script>
// import GeneratorScreen from '../../bm-generator/lib/export/GeneratorScreen'
// import Config from '../../bm-generator/lib/config'


export default {
  name: 'LoginUserScreen',
  components: {
    // GeneratorScreen
    GeneratorScreen: () => import( /* webpackChunkName: "GeneratorScreen" */ '../../bm-generator/lib/export/GeneratorScreen')
  },
  data() {
    return {
      enums: {},
      setting: {
        "data": {
          "sources": [],
          "columns": [{
            "label": "id",
            "name": "id",
            "isKey": false,
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
            "label": "用户名",
            "name": "loginName",
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
            "label": "email",
            "name": "meizuEmail",
            "isKey": true,
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
            "label": "昵称",
            "name": "nickname",
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
            "id": 408,
            "manual": false,
            "modifier": "temp_test",
            "modify": 1528878439000,
            "tableId": 5
          }]
        },
        "view": {
          "pageActions": ["search"],
          "tableActions": [],
          "customPageActions": [],
          "customTableActions": [{ type: 'event', name: '加入', code: 'join'}, { type: 'event', name: '删除', code: 'delete'}]
        }
      },
    }
  },

  created() {
  },

  methods: {
    customClickAction(btn, info) {
      if (btn.code == 'join') {
        this.$confirm(`确定将用户【${info.meizuEmail}】加入drp系统?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          try {
            const res = await this.$request.get('/manage/auth/addNewUser', {
              params: {
                meizuEmail: info.meizuEmail
              }
            })
            if (this.$helper.checkRequestResultMessage(this, res, '加入成功!')) {
              this.$refs.page.loadDataTable()
            }
          } catch(e) { console.log(e) }
        });
      } else if (btn.code == 'delete') {
        this.$confirm(`确定删除用户【${info.meizuEmail}】?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          try {
            const res = await this.$request.get('/manage/auth/deleteUser', {
              params: {
                meizuEmail: info.meizuEmail
              }
            })
            if (this.$helper.checkRequestResultMessage(this, res, '删除成功!')) {
              this.$refs.page.loadDataTable()
            }
          } catch(e) { console.log(e) }
        });
      }
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
