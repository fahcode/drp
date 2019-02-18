<template lang="html">
  <div class="table-column-screen" v-loading="loading.page">
    <breadcrumb></breadcrumb>
    <el-card class="data-searchform-card">
      <el-form label-width="100px" label-position="left">
        <el-form-item label="数据源">
          <cf-select :value="tid"
            class="data-source-select"
            :entry="{
              placeholder: '请选择数源',
              disabled: true,
              options: {
                url: '/manage/config/meta/datasource/list',
                multiple: false,
                remote: true,
                param: '',
                filter: 'return res.value.data.reduce(function(c, p) {c = c.concat(p.data.map(function(p1) {return {name: p.db+\' - \'+p1.table, value: p1.id}})); return c;}, [])',
                method: 'get',
              }}">
          </cf-select>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card class="data-datatable-card">
      <el-table
        :data="datas"
        style="width: 100%"
        :row-class-name="tableRowClassName">
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-form label-position="left" inline label-width="100px">
              <el-row>
                <el-col :xs="24" :sm="12" :md="8" :lg="8">
                  <el-form-item label="列数据类型">
                    <el-select :clearable="true" v-model="scope.row.custom.dataType">
                      <el-option
                        v-for="(value, key) in config.columnTypes"
                        :key="key"
                        :label="value"
                        :value="key">
                      </el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12" :md="8" :lg="8" v-if="!scope.row.name || scope.row.custom.dataType == 'time'">
                  <el-form-item :label="scope.row.manual ? '计算值' : '数据格式化'">
                    <el-input v-model="scope.row.custom.format"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12" :md="8" :lg="8">
                  <el-form-item label="提示文本">
                    <el-input v-model="scope.row.custom.placeholder"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row v-if="scope.row.name">
                <el-col :xs="24" :sm="12" :md="8" :lg="8">
                  <el-form-item label="表单控件类型">
                    <el-select :clearable="true" v-model="scope.row.custom.type">
                      <el-option
                        v-for="(value, key) in config.fieldTypes"
                        :key="key"
                        :label="value"
                        :value="key">
                      </el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12" :md="8" :lg="8" v-if="['text', 'textarea'].indexOf(scope.row.custom.type) != -1">
                  <el-form-item label="输入框配置">
                    <el-checkbox label="逗号(,)分隔多个值" v-model="scope.row.custom.options.multiple"></el-checkbox>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12" :md="8" :lg="8" v-if="scope.row.custom.type == 'dropdown'">
                  <el-form-item label="下拉框配置">
                    <el-checkbox label="支持多选" v-model="scope.row.custom.options.multiple"></el-checkbox>
                    <el-checkbox label="支持查找" v-model="scope.row.custom.options.filterable"></el-checkbox>
                    <el-checkbox label="支持清空" v-model="scope.row.custom.options.clearable"></el-checkbox>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12" :md="8" :lg="16" v-if="scope.row.custom.type == 'daterange'">
                  <el-form-item label="日期区间配置">
                    <el-select
                      :clearable="true"
                      v-model="scope.row.custom.defaultValue">
                      <el-option
                        v-for="(value, key) in config.daterangeShortcuts"
                        :key="key"
                        :label="value"
                        :value="key">
                      </el-option>
                    </el-select>
                    <el-checkbox label="排除今日" v-model="scope.row.custom.options.notIncludeToday"></el-checkbox>
                  </el-form-item>
                  <el-form-item label="禁用时间">
                    <el-select
                      :clearable="true"
                      v-model="scope.row.custom.disabledDate">
                      <el-option
                        v-for="item in config.dateDisabledDateTypes"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                      </el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :xs="24" :sm="12" :md="8" :lg="8">
                  <el-form-item label="列宽度">
                    <el-autocomplete
                      v-model="scope.row.custom.width"
                      :fetch-suggestions="queryColumnWidthSearch"
                      placeholder="为空则自由延伸"
                      @select="scope.row.custom.width = parseInt($event.value) + 'px'"
                    ></el-autocomplete>
                  </el-form-item>
                </el-col>
                  <el-col :xs="24" :sm="12" :md="8" :lg="8">
                    <el-form-item label="默认值" v-if="scope.row.name">
                      <el-input v-model="scope.row.custom.defaultValue"></el-input>
                    </el-form-item>
                  </el-col>
              </el-row>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column label="映射字段" prop="name" class-name="col-name">
        </el-table-column>
        <el-table-column label="标题" prop="label">
          <template slot-scope="scope">
            <el-input v-model="scope.row.label"></el-input>
          </template>
        </el-table-column>
        <el-table-column v-for="item in config.aggregate" :label="item" :prop="item" :key="item" width="80px">
          <template slot-scope="scope" v-if="!scope.row.manual">
            <el-checkbox :title="item" v-model="scope.row[item]" @change="aggregateInput(item, scope.row, $event)"></el-checkbox>
          </template>
        </el-table-column>
        <!-- <el-table-column label="创建人" prop="creator">
        </el-table-column>
        <el-table-column label="创建时间" prop="create" :formatter="formatTableCell">
        </el-table-column> -->
        <el-table-column label="更多指标分组" prop="dataGroup">
          <template slot-scope="scope">
            <el-input v-model="scope.row.custom.dataGroup"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="手动" prop="manual" width="80px">
          <template slot-scope="scope">
            <el-checkbox v-if="!scope.row._real" v-model="scope.row.manual" :disabled="true"></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column label="操作" prop="manual" width="80px">
          <template slot-scope="scope">
            <el-button v-if="scope.row.manual && !scope.row.name" type="text" @click="deleteTableRow(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="table-actions">
        <i class="el-icon-plus action-add" @click="addTableRow"></i>
        <el-checkbox v-model="hideAutoColumns">隐藏aggregate列</el-checkbox>
      </div>
    </el-card>
    <footer>
      <el-button :loading="loading.saveBtn" type="primary" @click="saveConfig">保存</el-button>
    </footer>
    <iframe v-if="iframeSaveCount >= 0" class="page-iframe" :src="pageUrl" width="0" height="0"></iframe>
  </div>
</template>

<script>
import Config from '../../bm-generator/lib/config'
import { tableHeaderFixMixin } from '../../bm-generator/lib/mixins'

export default {
  name: 'TableColumnScreen',

  mixins: [tableHeaderFixMixin],

  data() {
    return {
      tid: parseInt(this.$route.query.tid),
      linkedPageIds: [],
      iframeSaveCount: -1,
      allDatas: [],
      config: {... Config},
      hideAutoColumns: false,
      loading: {
        page: false,
        saveBtn: false,
        main: null,
      },
    }
  },

  computed: {
    pageUrl() {
      const href = location.href.split('#')[0]
      if (this.loading.main && this.iframeSaveCount < this.linkedPageIds.length) {
        this.loading.main.setText(`正在更新该数据表关联的page/${this.linkedPageIds[this.iframeSaveCount]}，（${this.iframeSaveCount+1}/${this.linkedPageIds.length}）`)
      }
      return `${href.indexOf('?') == -1 ? '?' : '&'}_t=${Date.now()}#setting/${this.linkedPageIds[this.iframeSaveCount]}?autosave=1&__fullscreen=1`
    },

    datas() {
      const realDatas = this.allDatas.filter(p => !p.manual)
      const manualDatas = this.allDatas.filter(p => p.manual && !p.name)
      const autoDatas = this.allDatas.filter(p => p.manual && p.name)
      return realDatas.concat(manualDatas).concat(this.hideAutoColumns ? [] : autoDatas)
    },

    autoDatas() {
      return this.allDatas.filter(p => p.manual && p.name)
    },
  },

  created() {
    this.loadDataTable()
    this.loadLinkedPages()
    this.messageLisenterFn = ( event ) => {
      if (event.data.type == 'iframe-save-success') {
        this.iframeSaveCount ++
        if (this.iframeSaveCount >= this.linkedPageIds.length) {
          this.loading.main.close()
        }
      }
    }
    //event 参数中有 data 属性，就是父窗口发送过来的数据
    window.addEventListener('message', this.messageLisenterFn, false );
  },

  beforeDestroy() {
    window.removeEventListener('message', this.messageLisenterFn, false );
  },

  methods: {
    tableRowClassName({ row }) {
      if (!row.manual && !row._existed) {
        return row._real ? 'row-new' : 'row-remove'
      }
      return ''
    },

    formatTableCell(row, column, cellValue) {
      return cellValue ? this.$helper.formatDate(cellValue) : ''
    },

    aggregateInput(name, row, checked) {
      let label = row.label
      switch (name) {
        case 'sum':
          label = `(总)${label}`
          break;
        case 'avg':
          label = `日均${label}`
          break;
        case 'count':
          label = `${label}个数`
          break;
        case 'max':
          label = `最大${label}`
          break;
        case 'min':
          label = `最小${label}`
          break;
        default:
      }
      name = `${name.toUpperCase()}(${row.name})`
      const index = this.allDatas.findIndex(p =>  p.name == name)
      if (index != -1) {
        if (!checked) {
          this.allDatas.splice(index, 1)
        }
      } else {
        if (checked) {
          this.addTableRow({
            label,
            name,
          })
        }
      }
    },

    queryColumnWidthSearch(queryString, cb) {
      return cb(['80px(ID之类的使用)', '100px(数值大大使用)',
                        '105px(不带时间的日期使用)', '155px(带时间的日期使用)'
                      ].filter(p => p.toLowerCase().indexOf(queryString.toLowerCase()) != -1)
                      .map(p => ({ value: p }))
                )
    },

    async saveConfig() {
      this.loading.saveBtn = true
      try {
        const res = await this.$request.post('/manage/config/meta/column/update', {
          tableId: this.tid,
          columns: JSON.stringify(this.allDatas.filter(p => p._real || p.manual)),
        })
        if (this.$helper.checkRequestResultMessage(this, res, '保存配置成功')) {
          this.loadDataTable()
        }
      } catch(e) { console.log(e); }
      this.loading.saveBtn = false
      if (this.linkedPageIds && this.linkedPageIds.length > 0) {
        this.iframeSaveCount = 0
        this.loading.main = this.$loading({
          fullscreen: false,
          text: `正在更新该数据表关联的page/${this.linkedPageIds[0]}，（1/${this.linkedPageIds.length}）`,
        });
      }
    },

    async loadDataTable() {
      this.loading.page = true
      try {
        const results = await Promise.all(['/manage/config/meta/column/list2', '/manage/config/meta/column/list'].map(url => {
          return this.$request.get(url, {
            params: { tid: this.tid },
          })
        }))
        const list2 = results[0]
        const list = results[1]
        if (this.$helper.checkRequestResultMessage(this, list2) && this.$helper.checkRequestResultMessage(this, list)) {
          const datas = []
          list.value.forEach(p => p.custom = this.formatListItemCustom(p))
          // console.log(JSON.stringify(list.value), 1111);
          list2.value.forEach(p => {
            p._real = 1 // 真实存在的表列
            p.custom = this.formatListItemCustom(p)
            const existed = list.value.find(p1 => !p.manual && p.name == p1.name)
            if (existed) {
              existed._existed = 1
              p.custom = existed.custom
            }
            datas.push(this.$helper.assign({}, p, existed || {}))
          })
          datas.push(...list.value.filter(p => p.manual))
          datas.push(...list.value.filter(p => !p.manual && !p._existed))
          const realDatas = datas.filter(p => !p.manual)
          const autoDatas = datas.filter(p => p.manual && p.name)
          realDatas.map(col => {
            this.config.aggregate.forEach(name => {
              col[name] = autoDatas.some(p => p.name == `${name.toUpperCase()}(${col.name})`)
            })
            return col
          })
          this.allDatas = datas
          // this.data = this.allDatas.map(p => {
          //
          // })
        }
      } catch(e) { console.log(e) }
      this.loading.page = false
    },

    async loadLinkedPages() {
      try {
        const res = await this.$request.get('/manage/page/references', {
          params: {
            tid: this.tid,
          },
        })
        if (this.$helper.checkRequestResultMessage(this, res)) {
          this.linkedPageIds = res.value
        }
      } catch(e) { console.log(e); }
    },

    formatListItemCustom(p = {}) {
      const isTime = p.name == 'FCREATE' || p.name == 'FMODIFY'
      const isAvg = p.name.indexOf('AVG(') === 0
      let dataType = 'raw'
      let type = 'text'
      let format = ''
      if (isTime) {
        dataType = 'time'
        type = 'daterange'
        format = 'yyyy-MM-dd'
      } else if (isAvg) {
        dataType = 'float'
      }
      return this.$helper.assign({
                                    type,
                                    dataType,
                                    format,
                                    options: {
                                      filter: false,
                                      clearable: true,
                                      multiple: false,
                                      notIncludeToday: '',
                                      format: '',
                                      disabledDate: '',
                                    },
                                    defaultValue: '',
                                    placeholder: '',
                                    url: '',
                                    width: '',
                                    dataGroup: '',
                                  },
                                  p.custom ? JSON.parse(p.custom) : {})
    },

    addTableRow(opts = {}) {
      const data = this.$helper.assign({
        create: null,
        creator: "",
        id: 0,
        label: "",
        manual: true,
        modifier: "",
        modify: null,
        name: "",
        tableId: this.tid,
      }, opts)
      data.custom = this.formatListItemCustom(data)
      this.allDatas.push(data)
    },

    deleteTableRow(row) {
      const index = this.allDatas.indexOf(row)
      this.allDatas.splice(index, 1)
    },
  },
}
</script>

<style lang="stylus" scoped>
.data-searchform-card
  margin-bottom: 22px
.data-source-select
  width 300px
.action-add
  padding: 10px
  font-size: 20px
  color #409EFF
.el-table__expanded-cell
  .el-select
    margin-right: 10px
  .el-checkbox:last-of-type
    margin-right: 0
footer
  margin-top: 22px
  text-align: right;
.page-iframe
  visibility: hidden;
  height: 0
  position: absolute;
  z-index: 0
  border: 0
  left: 0
  top 0
.table-actions
  display: flex;
  justify-content: space-between;
  align-items: center;
</style>
<style lang="stylus">
.table-column-screen
  .row-new
    background: #c4e3cb !important
  .row-remove
    background: #919190 !important
</style>
