<template lang="html">
<div class="factory-screen" v-loading="this.loading.page">
  <el-card class="data-config-card">
    <h3>列配置</h3>
    <el-form label-width="100px" label-position="left">
      <el-form-item label="数据源">
        <cf-select :value="setting.data.sources"
          class="data-source-select"
          @input="dataSourceChangeAction"
          :entry="{placeholder: '请选择数源',
            disabled: disableSources,
            options: {
              url: '/manage/config/meta/datasource/list',
              multiple: true,
              remote: true,
              param: '',
              filter: 'return res.value.data.reduce(function(c, p) {c = c.concat(p.data.map(function(p1) {return {name: p.db+\' - \'+p1.table, value: p1.id}})); return c;}, [])',
              method: 'get',
            }}">
        </cf-select>
      </el-form-item>
    </el-form>
    <el-table
      class="main-table"
      :data="setting.data.columns"
      style="width: 100%"
      row-key="label">
      <el-table-column label="标题" prop="label">
        <template slot-scope="scope">
          <el-input v-model="scope.row.label"></el-input>
        </template>
      </el-table-column>
      <el-table-column label="映射字段" prop="name">
      </el-table-column>
      <el-table-column label="主键" prop="isKey">
        <template slot-scope="scope">
          <el-checkbox v-if="!scope.row.manual" v-model="scope.row.isKey"></el-checkbox>
        </template>
      </el-table-column>
      <el-table-column label="使用" prop="isUse" :render-header="tableHeaderHasCheckbox">
        <template slot-scope="scope">
          <el-checkbox @mouseenter.native="checkboxMouseenterChange(scope.row, scope.column.property)" v-if="scope.row.name" v-model="scope.row.isUse"></el-checkbox>
        </template>
      </el-table-column>
      <el-table-column label="select" prop="isShow" :render-header="tableHeaderHasCheckbox">
        <template slot-scope="scope">
          <el-checkbox @mouseenter.native="checkboxMouseenterChange(scope.row, scope.column.property)" v-if="scope.row.name && scope.row.isUse" v-model="scope.row.isShow"></el-checkbox>
        </template>
      </el-table-column>
      <!-- <el-table-column label="aggregate" prop="aggregate">
        <template slot-scope="scope">
          <el-select :clearable="true" v-if="!scope.row.manual" v-model="scope.row.aggregate" placeholder="请选择">
            <el-option
              v-for="item in [{label: 'SUM', value: 1}, {label: 'AVG', value: 2}, {label: 'MAX', value: 3}, {label: 'MIN', value: 4}, {label: 'COUNT', value: 5}]"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </template>
      </el-table-column> -->
      <el-table-column label="where" prop="isQuery" :render-header="tableHeaderHasCheckbox">
        <template slot-scope="scope">
          <el-checkbox @mouseenter.native="checkboxMouseenterChange(scope.row, scope.column.property)" v-if="scope.row.name && scope.row.isUse" v-model="scope.row.isQuery"></el-checkbox>
        </template>
      </el-table-column>
      <el-table-column label="compare" prop="compare">
        <template slot-scope="scope">
          <el-select :clearable="false" v-if="scope.row.name && scope.row.isUse" v-model="scope.row.compare" placeholder="请选择">
            <el-option
              v-for="item in [{label: '=', value: 0}, {label: 'in', value: 1}, {label: 'between', value: 2}, {label: 'like', value: 3}]"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="group" prop="isGroup">
        <template slot-scope="scope">
          <el-checkbox @mouseenter.native="checkboxMouseenterChange(scope.row, scope.column.property)" v-if="!scope.row.manual && scope.row.isUse" v-model="scope.row.isGroup"></el-checkbox>
        </template>
      </el-table-column>
      <el-table-column label="排序" prop="sortable" :render-header="tableHeaderHasCheckbox">
        <template slot-scope="scope" v-if="scope.row.name && scope.row.isShow">
          <el-checkbox @mouseenter.native="checkboxMouseenterChange(scope.row, scope.column.property)" v-model="scope.row.sortable"></el-checkbox>
        </template>
      </el-table-column>
      <el-table-column label="隐藏" prop="hidden" :render-header="tableHeaderHasCheckbox">
        <template slot-scope="scope" v-if="((scope.row.name && scope.row.isShow)) || scope.row.manual">
          <el-checkbox @mouseenter.native="checkboxMouseenterChange(scope.row, scope.column.property)" v-model="scope.row.hidden"></el-checkbox>
        </template>
      </el-table-column>
      <el-table-column label="趋势图" prop="tendencyChart" :render-header="tableHeaderHasCheckbox">
        <template slot-scope="scope" >
          <el-checkbox @mouseenter.native="checkboxMouseenterChange(scope.row, scope.column.property)" v-model="scope.row.tendencyChart"></el-checkbox>
        </template>
      </el-table-column>
      <el-table-column label="柱状图" prop="barChart" :render-header="tableHeaderHasCheckbox">
        <template slot-scope="scope" >
          <el-checkbox @mouseenter.native="checkboxMouseenterChange(scope.row, scope.column.property)" v-model="scope.row.barChart"></el-checkbox>
        </template>
      </el-table-column>
      <el-table-column label="默认展示" prop="dataGroupShowDefault">
        <template slot-scope="scope" v-if="scope.row.custom.dataGroup && !scope.row.hidden && ((scope.row.name && scope.row.isShow) || scope.row.manual)">
          <el-checkbox @mouseenter.native="checkboxMouseenterChange(scope.row, scope.column.property)" v-model="scope.row.dataGroupShowDefault"></el-checkbox>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
  <el-card class="action-config-card">
    <h3>操作配置</h3>
    <el-form label-width="140px" label-position="left">
      <el-form-item label="页面操作">
        <el-checkbox-group v-model="setting.view.pageActions">
          <el-checkbox :label="item.value" :key="item.value"
            v-for="item in config.pageActions">
            {{item.label}}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="列操作">
        <el-checkbox-group v-model="setting.view.tableActions">
          <el-checkbox :label="item.value" :key="item.value"
            v-for="item in config.tableActions">
            {{item.label}}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="自定义页面操作">
        <el-table
          :data="setting.view.customPageActions"
          style="width: 100%">
          <el-table-column label="名称" prop="name" width="160px">
            <template slot-scope="scope">
              <el-input v-model="scope.row.name"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="类型" prop="type" width="160px">
            <template slot-scope="scope">
              <el-select :clearable="true" v-model="scope.row.type" placeholder="请选择">
                <el-option
                  v-for="item in config.customActionTypes"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="配置" prop="config">
            <template slot-scope="scope">
              <label>路径: </label><el-input class="input-config-path" v-if="scope.row.type == 'router'" v-model="scope.row.config.path"></el-input>
              <el-checkbox :label="scope.row.config.isDay">分日</el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80px">
            <template slot-scope="scope">
              <el-button type="text" @click="deleteViewActionRow(setting.view.customPageActions, scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <i class="el-icon-plus action-add" @click="addViewActionRow(setting.view.customPageActions)"></i>
      </el-form-item>
      <el-form-item label="自定义列操作">
        <el-table
          :data="setting.view.customTableActions"
          style="width: 100%">
          <el-table-column label="名称" prop="name" width="160px">
            <template slot-scope="scope">
              <el-input v-model="scope.row.name"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="类型" prop="type" width="160px">
            <template slot-scope="scope">
              <el-select :clearable="true" v-model="scope.row.type" placeholder="请选择">
                <el-option
                  v-for="item in config.customActionTypes"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="配置" prop="config">
            <template slot-scope="scope">
              <label>路径: </label><el-input class="input-config-path" v-if="['router', 'iframeDialog'].indexOf(scope.row.type) != -1" v-model="scope.row.config.path"></el-input>
              <el-checkbox :label="scope.row.config.isDay">分日</el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80px">
            <template slot-scope="scope">
              <el-button type="text" @click="deleteViewActionRow(setting.view.customTableActions, scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <i class="el-icon-plus action-add" @click="addViewActionRow(setting.view.customTableActions)"></i>
      </el-form-item>
    </el-form>
  </el-card>
  <footer>
    <el-button type="success" @click="$router.push(`/page/${$route.params.code}`)">查看页面</el-button>
    <el-button :loading="loading.saveBtn" type="primary" @click="saveConfig">保存</el-button>
  </footer>
</div>
</template>

<script>
import Config from '../config'
import Sortable from 'sortablejs'
import { tableHeaderFixMixin } from '../mixins'

export default {
  name: 'FactoryScreen',

  components: {},

  mixins: [tableHeaderFixMixin],

  data() {
    return {
      loading: {
        page: false,
        saveBtn: false,
      },
      config: this.$helper.assign({}, Config),
      setting: this.$helper.assign({}, Config.setting),
      disableSources: false,
      inMouseMove: false,
    }
  },

  created() {
    this.loadConfig()
    document.body.addEventListener('mousedown', () => {
      this.inMouseMove = true
    })
    document.body.addEventListener('mouseup', () => {
      this.inMouseMove = false
    })
    document.body.addEventListener('mouseleave', () => {
      this.inMouseMove = false
    })
  },

  mounted() {
    const tbody = document.querySelector('.main-table tbody')
    Sortable.create(tbody, {
      onEnd: ({ newIndex, oldIndex }) => {
        const targetRow = this.setting.data.columns.splice(oldIndex, 1)[0]
        this.setting.data.columns.splice(newIndex, 0, targetRow)
      }
    })
    setTimeout(() => {
      console.log('this.setting.data.columns', this.setting.data.columns)
    }, 1000)
  },

  watch: {
    $route(to, from) {
      // this.resetDefalutConfig()
      if (to.path != from.path) {
        this.disableSources = false
        this.inMouseMove = false
        this.setting = this.$helper.assign({}, Config.setting)
        this.loadConfig()
      }
    },
  },

  methods: {
    addViewActionRow(actions) {
      actions.push({
        name: '',
        type: 'router',
        config: {
          path: '',
          isDay: false,
        }
      })
    },

    deleteViewActionRow(actions, row) {
      const index = actions.indexOf(row)
      if (index != -1) {
        actions.splice(index, 1)
      }
    },

    tableHeaderHasCheckbox(h, {column}) {
      return h(
        'span',
        {
          'class': {
              'checked-header': true,
            },
        },
        [
          h('span', column.label),
          h('el-checkbox', {
            on: {
              change: (checked) => {
                this.setting.data.columns.forEach(col => {
                  if (!(!col.name && ['isUse', 'isShow', 'isQuery', 'sortable'].indexOf(column.property) != -1)) {
                    col[column.property] = checked
                  }
                })
              }
            }
          })
        ]
      )
    },

    checkboxMouseenterChange(row, key) {
      if (this.inMouseMove) {
        row[key] = !row[key]
      }
    },

    async loadConfig() {
      this.loading.page = true
      try {
        const res = await this.$request.get('/manage/config/page_config/get', {
          params: { pid: this.$route.params.code },
        })
        if (this.$helper.checkRequestResultMessage(this, res) && res.value.page) {
          this.setting = this.$helper.assign({... Config.setting}, JSON.parse(res.value.page.view))
          await this.dataSourceChangeAction(this.setting.data.sources)
          if (this.setting.data.sources) {
            this.disableSources = true
            if (this.$route.query.autosave == 1) {
              await this.saveConfig()
              parent.postMessage({type: 'iframe-save-success'}, '*')
            }
          }
        }
      } catch(e) { console.log(e) }
      this.loading.page = false
    },

    async dataSourceChangeAction(val) {
      this.setting.data.sources = val
      // 去重
      const names = []
      const oldColumns = this.setting.data.columns.filter(p => {
        if (names.indexOf(p.label) == -1) {
          names.push(p.label)
          return true
        }
        return false
      })
      this.setting.data.columns = []
      if (val.length > 0) {
        val = [val[0]]
        const results = await Promise.all(val.map((tableId) => {
          return this.$request.get('/manage/config/meta/column/list', {
            params: { tid: tableId },
          })
        }))
        const columns = []
        const columnIds = []
        // const columnLabels = []
        results.forEach((res) => {
          if (this.$helper.checkRequestResultMessage(this, res)) {
            res.value.forEach(p => {
              if (columnIds.indexOf(p.id) == -1) {
                const col = this.$helper.assign({
                  label: '',
                  name: '',
                  isKey: false,
                  isUse: false,
                  isShow: false,
                  isQuery: false,
                  isGroup: false,
                  hidden: false,
                  sortable: false,
                  compare: 0,
                  dataGroupShowDefault: false,
                  tendencyChart: false,
                  barChart: false,
                }, p)
                if (col.manual) {
                  col.isGroup = false
                  if (!col.name) {
                    col.isUse = false
                    col.isShow = false
                    col.isQuery = false
                    col.sortable = false
                    col.dataGroupShowDefault = false
                    col.barChart = false
                  }
                }
                if (typeof col.custom == 'string') {
                  col.custom = JSON.parse(col.custom)
                }
                columns.push(col)
                columnIds.push(p.id)
              }
            })
          }
        })
        // 按list的接口重新添加到最终的columns
        const newColumns = []
        const newColumnIds = []
        oldColumns.forEach((col) => {
          const index = columnIds.indexOf(col.id)
          if (index != -1) {
            delete col.custom // custom 在列配置页面配置
            delete col.id
            const newCol = this.$helper.assign({}, columns[index], col)
            if (col.label != columns[index].label
              && col.tableColumnLabel == col.label) {
                newCol.label = columns[index].label
            }
            // 表结构里的label
            newCol.tableColumnLabel = columns[index].label
            newColumns.push(newCol)
            columns[index]._used = 1
            newColumnIds.push(columns[index].id)
          }
        })
        // 添加新的列
        columns.forEach((col) => {
          const index = newColumnIds.indexOf(col.id)
          if (!col._used && index == -1) {
            delete col._used
            newColumns.push(this.$helper.assign({ tableColumnLabel: col.label }, col))
            newColumnIds.push(col.id)
          }
        })
        this.setting.data.columns = newColumns
      }
    },
    async saveConfig() {
      if (this.setting.data.columns.length == 0) {
        this.$message({
          message: '数据表不能为空',
          type: 'error',
        })
        return
      }
      this.loading.saveBtn = true
      try {
        const res = await this.$request.post('/manage/config/page_config/update', {
          pid: this.$route.params.code,
          view: JSON.stringify(this.setting),
          config: JSON.stringify(this.setting.data),
        })
        if (this.$helper.checkRequestResultMessage(this, res, '保存配置成功')) {
          console.log(res);
        }
      } catch(e) { console.log(e) }
      this.loading.saveBtn = false
    },
  }
}
</script>

<style lang="stylus" scoped>
.el-table__row
  .el-form-item
    margin-bottom: 0
.data-source-select
  width 500px
.data-config-card
  margin-bottom: 22px
.action-add
  padding: 10px
  font-size: 20px
  color #409EFF
footer
  text-align: right;
  margin-top: 22px
</style>
<style lang="stylus">
.checked-header
  .el-checkbox
    margin-left: 10px
.input-config-path
  width 200px
  margin: 0 10px
</style>
