<template>
  <div class="generator-wrapper" v-loading="loading.page">
    <breadcrumb></breadcrumb>
    <el-card class="search-form-card">
      <el-form class="search-form" label-width="90px" label-position="left">
        <input v-for="entry in searchFormFieldsView.hideFields" :key="entry.name" type="hidden" v-model="entry.value" />
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="entry in searchFormFieldsView.showFields" :key="pid + entry.name">
            <el-form-item
              :label="entry.label"
              :key="pid + entry.name">
              <form-item
                v-model="entry.value"
                :field="transField(entry)"
                :type="entry.custom.type"
                origin="searchForm"
                :extend="{}">
              </form-item>
            </el-form-item>
          </el-col>
          <span v-for="(rows,i) in getCascaderGroup" :gutter="20" :key="`row-group-${i}`" label="组">
			<el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="entry in rows" :key="pid + (entry.up || entry.name)">
				<el-form-item
				:label="entry.label"
				:key="pid + entry.name">
				<form-item
					v-model="entry.value"
					:field="entry"
					:type="entry.custom.type"
					origin="searchForm"
					:extend="{}">
				</form-item>
				</el-form-item>
			</el-col>
		  </span>
        </el-row>
        <el-row>
          <el-col :span="24" class="search-buttons">
            <el-button v-if="hasPageAction('search')" type="primary" @click="searchAction()">查询</el-button>
            <el-button v-if="hasPageAction('export')" type="warning" @click="exportAction()">导出</el-button>
            <el-button v-if="hasPageAction('export-day')" type="warning" @click="exportAction(true)">分日导出</el-button>
            <el-button v-if="hasPageAction('add')" type="success" @click="showDialog('add', false, '新增')">新增</el-button>
            <el-button v-for="btn in setting.view.customPageActions" :key="btn.name" type="primary" @click="clickCustomAction(btn)">{{btn.name}}</el-button>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
    <el-card  class="el-card-chart"  v-show="dateChart.showChart">
      <div class="block" >
        <span>对比时段：</span>
        <el-date-picker
          v-model="dateChart.dateInterval"
          type="daterange"
          unlink-panels
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="handleDateInterval"
          :default-time="['00:00:00', '23:59:59']"
          :picker-options="dateRangeOptions()">
        </el-date-picker>
      </div>
      <div class="block block-echart" v-loading="loading.echart">
        <vue-echart :options="dateChart.chartOptions"></vue-echart>
      </div>
      <div class="line-style" v-show="dateChart.dateInterval">
        <div class="line-style-color line-style-color-blue"></div>
        <span>{{fatTimeRange('current')}}</span>
        <div class="line-style-color line-style-color-yellow"></div>
        <span>{{fatTimeRange('prev')}}</span>
      </div>
      <el-checkbox-group class="check-days" v-show="isOneDay" v-model="dateChart.checkDays" @change="handleCheckDaysChange">
        <el-checkbox label="lastWeek" class="lastWeekCheckbox">上一周</el-checkbox>
        <el-checkbox label="lastDay" class="lastDayCheckbox">上一天</el-checkbox>
        <el-checkbox label="thatDay" class="thatDayCheckbox">当日</el-checkbox>
      </el-checkbox-group>
    </el-card>
    <el-card class="el-card-datatable">
      <div slot="header" v-if="Object.keys(popoverField.options.data).length > 0 && hasDataGroupChecked">
        <span>数据列表</span>
        <cf-popover-table-column-hidden
          :value="popoverField.value"
          :entry="popoverField"
          @input="tableColumnHiddenChange">
        </cf-popover-table-column-hidden>
      </div>
      <el-table
        v-loading="loading.table"
        :data="tableDatas"
        style="width: 100%"
        v-if="viewLoaded.dataTable"
        :row-class-name="dataTableRowClassName"
        :default-sort="{
          prop: pagination.orderBy,
          order: pagination.sortType == 'asc' ? 'ascending' : 'descending',
        }"
        @sort-change="handleDataTableSortChange">
        <el-table-column :prop="column.name" :sortable="column.name && column.sortable ? 'custom' : false" v-for="(column, colIndex) in showColumns" :key="column.label" :label="showLabel(column.label)" :width="column.custom.width || ''">
          <template slot-scope="scope">
            <div class="cell-content-wrap">
              {{getColumnValue(column, scope.row, scope.$index, colIndex)}}
            </div>
          </template>
        </el-table-column>
        <slot name="table-column"></slot>
        <el-table-column
          v-if="setting.view.tableActions.length || setting.view.customTableActions.length"
          key="operations"
          :width="`${tableActionColumnWidth}px`"
          label="操作">
          <template slot-scope="scope">
            <div class="table-row-actions-wrap" v-if="!scope.row.__isSummary">
              <el-button v-if="hasTableAction('update')" type="text" @click="showDialog('update', scope.row, '更新')">更新</el-button>
              <el-button v-if="hasTableAction('copy')" type="text" @click="showDialog('copy', scope.row, '复制')">复制</el-button>
              <el-button v-if="hasTableAction('detail')" type="text" @click="showDialog('detail', scope.row, '详情')">详情</el-button>
              <el-button v-for="btn in setting.view.customTableActions.filter(p => p.type == 'router')" :key="btn.name" type="text"><a :href="getCustomActionUrl(btn, scope.row)" target="_blank'">{{btn.name}}</a></el-button>
              <el-button v-for="btn in setting.view.customTableActions.filter(p => p.type != 'router')" :key="btn.name" type="text" @click="clickCustomAction(btn, scope.row)">{{btn.name}}</el-button>
              <el-button v-if="hasTableAction('delete')" type="text" @click="deleteConfirm(scope.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="data-table-pagination"
        @size-change="handleDataTableSizeChange"
        @current-change="handleDataTablePageChange"
        :current-page="pagination.currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pagination.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total">
      </el-pagination>
    </el-card>

    <el-dialog v-for="dialog in dialogs" :key="dialog.type" :title="dialog.title" :visible.sync="dialog.visible">
      <el-form>
        <el-form-item v-if="!field.isKey" v-for="field in dialog.fields" :key="dialog.type + field.name" :label="field.label" label-width="100px">
          <form-item
            v-model="field.value"
            :field="transField(field)"
            :type="field.custom.type"
            origin="searchForm"
            :extend="{}">
          </form-item>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialog.visible = false">取 消</el-button>
        <el-button type="primary" v-if="dialog.type != 'detail'" v-loading="loading.submitBtn" @click="submitDialog(dialog)">确 定</el-button>
      </div>
    </el-dialog>

    <!-- <el-dialog title="正在执行查询" :visible.sync="exportDialog.visible" :show-close="false" top="30%" :close-on-click-modal="false">
      <p>查询进度</p>
      <el-progress :text-inside="true" :stroke-width="18" :percentage="exportDialog.percent" color="#8e71c7"></el-progress>
      <p class="msg-nodata" v-show="exportDialog.percent >= 100 && pagination.total == 0">无数据</p>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelRequestDataTableLoad" :style="{float: 'left'}">取消任务</el-button>
        <span>文件名:</span>
        <el-input v-model="exportDialog.fileName" :style="{width: '420px'}" auto-complete="off"></el-input>
        <el-button @click="submitExportReport" :disabled="exportDialog.percent < 100 || pagination.total == 0" type="primary">导出表格</el-button>
      </div>
    </el-dialog> -->

    <el-dialog :title="iframeDialog.title" :visible.sync="iframeDialog.visible">
      <iframe class="dialog-iframe" ref="iframe" :src="iframeDialog.url"></iframe>
      <div slot="footer" class="dialog-footer">
        <el-button @click="iframeDialog.visible = false">取 消</el-button>
        <el-button type="primary" v-loading="loading.submitBtn" @click="submitIfameDialog(iframeDialog)">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 导出报表 -->
    <div class="export-wrapper" v-if="exports.show">
      <div class="export-title">正在导出【{{exports.text}}】</div>
      <i class="export-close el-icon-close" @click="exports.show = false"></i>
      <el-progress
        :percentage="exports.percent"
        :status="exports.status"
        class="export-progress">
      </el-progress>
    </div>
  </div>
</template>

<script>
import Config from '../config'
// import Expose from '../expose'
import ExportJS from 'exportjs'
import axios from 'axios'
import { tableHeaderFixMixin } from '../mixins'
import { mapState } from 'vuex'

const requestCancelObj = {
  dataTableCancelFn: null,
  dateDataTableCancelFn: null,
  configCancelFn: null,
  dataTableExportCancelFn: null,
  dataTableSummaryFn: null,
}

export default {
    name: 'GeneratorScreen',
    props: {
        listUrl: String,
        summaryUrl: String,
        configUrl: String,
        addUrl: String,
        deleteUrl: String,
        updateUrl: String,
        defaultConfig: Object,
        defaultEnums: Object,
    },
    mixins: [tableHeaderFixMixin],
    data() {
        return {
            setting: this.defaultConfig || { ...Config.setting },
            pagination: {
                orderBy: '',
                sortType: 'desc',
                total: 0,
                currentPage: 1,
                pageSize: 20,
            },
            pid: this.$route.params.code || '',
            loading: {
                page: false,
                table: false,
                submitBtn: false,
                echart: false
            },
            datas: [],
            summary: null,
            lastParamsString: '',
            dialogs: [],
            exports: { show: false, text: '', percent: 0, status: 'success' },
            iframeDialog: { visible: false, title: '', url: '' },
            // exportDialog: {visible: false, percent: 0, fileName: '', title: '', url: ''},
            exportDatas: null,
            intervalId: 0,
            enums: this.defaultEnums || {},
            viewLoaded: {
                searchForm: false,
                dataTable: this.defaultConfig || false,
            },
            popoverStorage: this.$helper.storage.get(this.$route.params.code || ''),
            dateChart: {
                showChart: false,
                tmpDateInterval: [],
                gapDay: 0,
                dateInterval: '',
                dateTableDatas: [],
                lastDayDatas: [],
                lastWeekDatas: [],
                contrastTableDatas: [],
                checkDays: ['lastWeek', 'lastDay', 'thatDay'],
                chartOptions: this.$helper.assign({}, Config.chartOptions, {
                    legend: {
                        data: [],
                        selected: {},
                        selectedMode: 'single'
                    },
                    xAxis: {
                        boundaryGap: false
                    }
                })
			},
			curSearchGroupParent: {
                childName: '',
                parentName: '',
				labels: []
            },
            g: {}
        }
    },

    computed: {
        ...mapState([
            'breadcrumb'
        ]),

        hasDataGroupChecked() {
            return this.columns.some(col => col.dataGroupShowDefault && !col.hidden)
        },

        tableDatas() {
            return (this.summary ? [this.summary] : []).concat(this.datas)
        },

        showColumns() {
            let isShowDefault
            let popoverFieldlen = Object.keys(this.popoverField.options.data).length
            return this.columns.filter(p => {
                isShowDefault = this.popoverStorage ? this.popoverStorage.indexOf(p.label) != -1 : p.dataGroupShowDefault
                return (p.manual || p.isShow) && !p.hidden && (!p.custom.dataGroup || !this.hasDataGroupChecked || (popoverFieldlen && isShowDefault))
            })
        },

        chartType() {
            for (let i = 0; i < this.showColumns.length; i++) {
                if (this.$helper.isPureObject(this.showColumns[i])) {
                    if (this.showColumns[i].barChart) {
                        return 'barChart'
                    } else if (this.showColumns[i].tendencyChart) {
                        return 'tendencyChart'
                    }
                }
            }
            return false
        },

        sortableColumn() {
            return this.showColumns.filter(p => p.sortable)
        },

        columns() {
            return this.allColumns.filter(p => p.manual || p.isUse)
        },

        allColumns() {
            if (this.setting.data) {
                return this.setting.data.columns.map(p => {
                    p.custom = (typeof p.custom == 'string') ? JSON.parse(p.custom) : (p.custom || {})
                    p.type = p.custom.type
                    return p
                })
            }
            return []
        },

        isOneDay() {
            const hasDateColumns = this.showColumns.some(col => col.name == 'FSTAT_TIME')
            if (hasDateColumns) {
                const dateRangeField = this.searchFields.filter(col => ['daterange', 'datetimerange'].indexOf(col.type) != -1)[0]
                return dateRangeField && this.$helper.formatDate(dateRangeField.value[0], 'yyyy-MM-dd') == this.$helper.formatDate(dateRangeField.value[1], 'yyyy-MM-dd')
            }
            return false
        },

        isDatasTimeSame() {
            if (this.datas.length > 0) {
                return !this.datas.some(p => p.FSTAT_TIME != this.datas[0].FSTAT_TIME)
            }
            return false
        },

        searchFields() {
            if (this.viewLoaded.searchForm) {
                return this.columns.filter(p => p.isQuery)
                    .map(p => {
                        let value
                        if (p.custom.options.multiple) {
                            value = Object.keys(this.$route.query).reduce((c, q) => {
                                let reg = new RegExp(`${p.name}\\[\\d+\\]`)
                                if (reg.test(q)) {
                                    c.push(this.$route.query[q])
                                }
                                return c
                            }, [])
                        } else {
                            value = this.$route.query[p.name] || ''
                        }
                        if (p.custom.type == 'daterange' && !value) {
                            if (this.$route.query[`${p.name}_start`] && this.$route.query[`${p.name}_end`]) {
                                value = [this.$route.query[`${p.name}_start`], this.$route.query[`${p.name}_end`]]
                            } else {
                                value = this.$helper.getDateRange(p.custom.defaultValue || 'week', p.custom.options.notIncludeToday ? 1 : 0)
                            }
                        }
                        const col = this.$helper.assign({
                            value,
                        }, p)
                        return col
                    })
            }
            return []
        },

        searchFormFieldsView() {
			let ccascaderGroup = Config.setup.searchForm.cascaderGroup;
            const searchFields = this.searchFields.reduce((c, p) => {
                if (p.type == 'hidden') {
                    c.hideFields.push(p)
                } else {
					// 遍历分组关系
					let idx = -1;
					ccascaderGroup.map((it, ii)=>{
						idx = it.indexOf(p.name);
						if(idx>-1){
							// 关联的子数据名称
                            if((idx+1)<it.length) p.childName = it[idx+1];
                            // 关联的父数据名称
                            if((idx-1)>=0) p.parentName = it[idx-1];
							p.isGroup = true;
							c.cascaderGroup[ii].push(p);
						}
					})

					if(idx==-1){
						/* if (c.showFields.length == 0 || c.showFields[c.showFields.length - 1].length == 6) {
							c.showFields.push([p])
						} else {
							c.showFields[c.showFields.length - 1].push(p)
						} */
						c.showFields.push(p)
					}
                }
                return c
            }, {
                hideFields: [],
                showFields: [],
                cascaderGroup: Array(ccascaderGroup.length).fill(Array())
            })
            // this.setDfDateInterval(); // 设置默认对比时间
            return searchFields
		},
		getCascaderGroup() {
			let cascaderGroup = this.searchFormFieldsView.cascaderGroup,
				childName = this.curSearchGroupParent.childName,
                labels = this.curSearchGroupParent.labels;
			let arrs = cascaderGroup.map(it => {
				return it.map(b => {
					let p = this.transField(b);
					// this.$set(this.g, 'a', p);
					// 过滤切换后的数据
					if(childName == p.name && p.options){
						childName = p.childName;
                        // 记录父级的关键字
                        if(this.curSearchGroupParent.childName == p.name) p.parentLabels = labels;

						let nitems = [],
							items = p.options.items;
						nitems = items.filter(it => {
							let res = false;
							labels.map(iit => {
                                // 魅族”“flyme”“-CPD"过滤
                                let rxkey = iit.replace(/(^魅族|^flyme|-CPD$)/gi, ''),
                                    re = new RegExp("^" + rxkey,"gi");
								res = re.test(it.name);
							})
							// 过滤为空，则全部需要
							if(labels.length<1) res = true;
							return res
						})
						p.options.items = nitems; // 切换对应值
						p.up = new Date().getTime() + p.name;
					}
					return p
				})
            })
			return arrs
		},

        hasOperation() {
            return this.getDialogFields('edit').length > 0
        },

        tableActionColumnWidth() {
            // 标准行为都是两个字
            const fontLength = this.setting.view.tableActions.length * 2 +
                this.setting.view.customTableActions.map(p => p.name).join('').length
            return fontLength * 15 + (this.setting.view.tableActions.length + this.setting.view.customTableActions.length - 1) * 10 + 20
        },

        popoverField() {
            let datas = {}
            let value = []
            this.columns.forEach(col => {
                if (col.custom.dataGroup) {
                    let data = {
                        'title': col.label,
                        'field': col.label,
                        'group': col.custom.dataGroup,
                    }
                    if (datas[col.custom.dataGroup]) {
                        datas[col.custom.dataGroup].push(data)
                    } else {
                        datas[col.custom.dataGroup] = [data]
                    }
                    if (!this.popoverStorage && col.dataGroupShowDefault) {
                        value.push(col.label)
                    }
                }
            })
            return {
                title: '',
                type: 'table-column-hidden',
                key: 'fields',
                value: this.popoverStorage || value,
                defaultValue: value,
                placeholder: '',
                dataType: 'string',
                rules: [],
                isAsync: false,
                options: {
                    limit: 0,
                    data: datas
                },
            }
        },
    },

    watch: {
        $route(to, from) {
            if (to.path != from.path) {
                this.resetDefalutConfig()
                this.loadPageConfig(true)
                this.clearIntervalId()
            } else if (to.query._reload) {
                this.loadPageConfig(true)
            }
        },

        viewLoaded: {
            handler(val) {
                if (val.dataTable) {
                    this.$nextTick(() => {
                        // 调用mixins
                        this.initStickyTableHeader()
                    })
                }
            },
            deep: true,
        }
    },

    created() {
        this.loadPageConfig(true)
        this.messageLisenterFn = (event) => {
            if (event.data.type == 'iframe-success') {
                this.searchAction()
                this.iframeDialog.visible = false
                this.loading.submitBtn = false
            }
        }
        //event 参数中有 data 属性，就是父窗口发送过来的数据
        window.addEventListener('message', this.messageLisenterFn, false);
    },
    beforeDestroy() {
        window.removeEventListener('message', this.messageLisenterFn, false);
    },
	mounted() {
		this.$bus.$on('groupInput', (parent) => {
			// 拿到关联变化的父级label,同事修改对应的searchFormFieldsView.showFields
			this.curSearchGroupParent = parent;
        })
	},
    methods: {
        resetDefalutConfig() {
            this.loading = {
                page: false,
                table: false,
                echart: false
            }
            this.viewLoaded = {
                searchForm: false,
                dataTable: false,
            }
            this.summary = null
            this.lastParamsString = ''
            this.popoverStorage = this.$helper.storage.get(this.$route.params.code || '')
            this.dateChart = {
                showChart: false,
                dateInterval: '',
                dateTableDatas: [],
                lastDayDatas: null,
                lastWeekDatas: null,
                contrastTableDatas: [],
                checkDays: ['thatDay', 'lastDay', 'lastWeek'],
                chartOptions: this.$helper.assign({}, Config.chartOptions, {
                    legend: {
                        data: [],
                        selected: {},
                        selectedMode: 'single'
                    },
                    xAxis: {
                        boundaryGap: false
                    },
                })
            }
        },

        showLabel(label) {
            return label.replace(/\(.*\)/g, '')
        },

        // datatable 行添加样式
        dataTableRowClassName({ row }) {
            return row.__isSummary ? 'data-table-summary' : ''
        },

        hasPageAction(type) {
            return this.setting.view.pageActions.indexOf(type) != -1;
        },

        hasTableAction(type) {
            return this.setting.view.tableActions.indexOf(type) != -1;
        },

        getSearchParams() {
            const query = this.$helper.assign({}, this.$route.query)
            const searchFormParams = this.searchFields.reduce((c, p) => {
                if (['daterange', 'datetimerange'].indexOf(p.type) != -1 && Array.isArray(p.value)) {
                    c[`${p.name}_start`] = this.$helper.formatDate(p.value[0], 'yyyy-MM-dd 00:00:00')
                    c[`${p.name}_end`] = this.$helper.formatDate(p.value[1], 'yyyy-MM-dd 23:59:59')
                } else if (p.value !== '') {
                    let value = p.value
                    if (p.custom.options.multiple) {
                        if (typeof value === 'string') {
                            value = value.split(',')
                        }
                    }
                    if (Array.isArray(value)) {
                        value.forEach((v, i) => {
                            c[`${p.name}[${i}]`] = v
                        })
                    } else {
                        c[p.name] = value
                    }
                    // 删除 route query的值
                } else if (query[p.name]) {
                    delete query[p.name]
                }
                if (p.custom.options.multiple) {
                    const reg = new RegExp(`${p.name}\\[\\d+\\]`)
                    Object.keys(query).forEach(v => {
                        if (reg.test(v)) {
                            delete query[v]
                        }
                    })
                }
                return c
            }, {
                start: (this.pagination.currentPage - 1) * this.pagination.pageSize,
                max: this.pagination.pageSize,
            })
            return this.$helper.assign({
                    pid: this.pid,
                },
                query, {
                    orderBy: this.pagination.orderBy,
                    sortType: this.pagination.sortType,
                },
                searchFormParams,
            )
        },

        transField(field) {
            // field.type = field.custom.type
            field.options = this.$helper.assign({
                filter: false,
                clearable: false,
                multiple: false,
				items: this.enums[field.name] || [],
            }, field.custom.options || {});
            field.placeholder = field.custom.placeholder
            // field.defaultValue = field.custom.defaultValue
            if (!field.value && field.custom.defaultValue && ['daterange', 'datetimerange'].indexOf(field.type) == -1) {
                field.value = field.custom.defaultValue
			}
            return field
        },

        getColumnValue(column, row, rowIndex, colIndex) {
            if (row.__isSummary && colIndex == 0) {
                return '合计'
            }
            let value = column.name ? this.$helper.getValueByPath(row, column.name) : ''
            if (column.manual && !column.name) {
                value = this.$helper.execStringExpression(column.custom.format, row)
                if (['percent', 'float', 'money'].indexOf(column.custom.dataType) != -1) {
                    try {
                        value = eval(value)
                        value = isNaN(value) || value == Infinity ? 0 : value
                    } catch (e) {
                        value = 0
                    }
                }
            }
            switch (column.custom.dataType) {
                case 'time':
                    value = this.$helper.formatDate(value, this.isOneDay && !this.isDatasTimeSame ? ('HH:mm') : column.custom.format)
                    break
                case 'enum':
                    value = this.$helper.getDropDownLabel(value, this.enums[column.name] || [])
                    break
                case 'float':
                    value = Number(value)
                    value = isNaN(value) ? '0.00' : value.toFixed(2)
                    break
                case 'integer':
                    value = parseInt(value)
                    return isNaN(value) ? 0 : value
                case 'percent':
                    value = this.$helper.percent(value)
                    break
                case 'money':
                    value = value / 100
                    value = isNaN(value) ? '0.00' : value.toFixed(2)
                    break
                default:
            }
            if (typeof value == 'undefined') value = ''
            return value
        },

        clickCustomAction(btn, info) {
            let path;
            let href;
            const query = btn.config && btn.config.isDay ? { group: 'FSTAT_TIME' } : {}
            switch (btn.type) {
                case 'router':
                    path = this.$helper.execStringExpression(btn.config.path, info)
                    this.$router.push({ path, query })
                    break;
                case 'iframeDialog':
                    path = this.$helper.execStringExpression(btn.config.path, info)
                    this.iframeDialog.title = btn.name
                    href = location.href.split('#')[0]
                    path = `${path}${path.indexOf('?') == -1 ? '?' : '&'}{btn.config.isDay ? 'group=FSTAT_TIME' : ''}&__fullscreen=1`
                    this.iframeDialog.url = `${href.indexOf('?') == -1 ? '?' : '&'}_t=${Date.now()}#${path}`
                    this.iframeDialog.visible = true
                    break
                case 'event':
                    this.$emit('click', btn, info)
                    break
                default:
            }
        },

        getCustomActionUrl(btn, info) {
            const params = this.getSearchParams()
            delete params.start
            delete params.max
            delete params.orderBy
            delete params.sortType
            delete params.pid
            const query = btn.config.path.split('?')[1]
            if (query) {
                // 去除冲突的params, 以配置的query为主
                const keys = query.split('&').map(p => p.split('=')[0].replace(/\[\d+\]/, ''))
                keys.forEach(k => {
                    Object.keys(params).forEach(param => {
                        if (param.indexOf(`${k}[`) != -1) {
                            delete params[param]
                        }
                    })
                })
            }
            let path = this.$helper.execStringExpression(btn.config.path, info)
            path = `${path}${path.indexOf('?') == -1 ? '?' : '&'}${btn.config.isDay ? 'group=FSTAT_TIME' : ''}&${this.$helper.seriliseParams(params)}&_reload=1`
            return `#${path}`
        },

        // 处理表格每页数量改变
        handleDataTableSizeChange(data) {
            this.pagination.pageSize = data
            this.loadDataTable()
        },

        handleDataTablePageChange(data) {
            this.pagination.currentPage = data
            this.loadDataTable()
        },

        handleDataTableSortChange({ prop, order }) {
            this.pagination.orderBy = prop || ''
            this.pagination.sortType = order == 'ascending' ? 'asc' : 'desc'
            this.searchAction()
        },

        async loadPageConfig(first) {

            if (this.viewLoaded.dataTable) {
                await this.loadPageDropDownColumnData()
                this.viewLoaded.searchForm = true
                this.searchAction()
                return
            }
            this.pid = this.$route.params.code
            this.loading.page = true
            try {
                Object.keys(requestCancelObj).forEach(key => {
                    if (requestCancelObj[key]) {
                        requestCancelObj[key](key)
                        requestCancelObj[key] = null
                    }
                })
                // if (requestCancelObj.configCancelFn) {
                //   requestCancelObj.configCancelFn(`loadPageConfig()`)
                //   requestCancelObj.configCancelFn = null
                // }
                let res = await this.$request.get(this.configUrl || '/manage/config/page_config/get', {
                    params: { pid: this.pid },
                    cancelToken: new axios.CancelToken((c) => {
                        // An executor function receives a cancel function as a parameter
                        requestCancelObj.configCancelFn = c
                    }),
                })
                if (this.$helper.checkRequestResultMessage(this, res)) {
                    this.datas = []
                    this.dialogs = []
                    this.setting = JSON.parse(res.value.page.view);
                    const columns = this.setting.data.columns
                    for (let i = 0; i < columns.length; i++) {
                        if (columns[i].tendencyChart || columns[i].barChart) {
                            this.dateChart.showChart = true
                            break
                        }
                    }
                    if (first) {
                        await this.loadPageDropDownColumnData()
                    }
                    this.viewLoaded.searchForm = true
                    let { orderBy = '', sortType = 'desc', currentPage = 1, pageSize = 20 } = this.$route.query
                    if (!orderBy) {
                        const dateColumn = this.sortableColumn.filter(p => Config.ignoreColumns.indexOf(p.name) == -1 && p.custom.dataType == 'time')
                        const sortableColumn = this.sortableColumn
                        if (dateColumn.length > 0) {
                            orderBy = dateColumn[0].name
                        } else {
                            orderBy = sortableColumn.length > 0 ? sortableColumn[0].name : ''
                        }
                    }
                    this.pagination = {
                        orderBy,
                        sortType,
                        total: (parseInt(currentPage) + 1) * parseInt(pageSize),
                        currentPage: parseInt(currentPage),
                        pageSize: parseInt(pageSize),
                    }
                    this.viewLoaded.dataTable = true
                    if (!orderBy) {
                        this.searchAction()
                    }
                }
            } catch (e) { console.log(e) }
            this.loading.page = false
            // setTimeout(()=> {
            //   console.log('tableDatas', this.tableDatas)
            //   console.log('setting', this.setting)
            // }, 3000)
        },

        async loadDataTable() {
            this.loading.table = true
            try {
                if (requestCancelObj.dataTableCancelFn) {
                    requestCancelObj.dataTableCancelFn(`loadDataTable()`)
                    requestCancelObj.dataTableCancelFn = null
                }
                const params = this.getSearchParams()
                let res = await this.$request.get(this.listUrl || '/manage/page/query', {
                    params,
                    cancelToken: new axios.CancelToken((c) => {
                        // An executor function receives a cancel function as a parameter
                        requestCancelObj.dataTableCancelFn = c
                    }),
                })

                if (this.$helper.checkRequestResultMessage(this, res)) {
                    this.datas = res.value.data
                    this.pagination.total = res.value.count
                }
            } catch (e) { console.log(e) }
            this.loading.table = false
            this.changeUrlQuery()
        },

        async loadDateDataTable(dateType) { //根据日期获取全部数据，不设置分页参数
            this.loading.table = true
            this.loading.echart = true
            try {
                // if (requestCancelObj.dateDataTableCancelFn) {
                //   requestCancelObj.dateDataTableCancelFn(`loadDateDataTable()`)
                //   requestCancelObj.dateDataTableCancelFn = null
                // }
                if (!this.isSameDateInterval() && !this.isSameDateInterval(this.dateChart.tmpDateInterval)) {
                    this.dateChart.dateInterval = ''
                    this.dateChart.contrastTableDatas = ''
                }
                const params = this.getSearchParams();
                params.max = ''
                if (dateType === 'contrast') {
                    let rangeDates = this.dateChart.dateInterval;
                    // 当model不通过时，使用tmpDateInterval数据
                    if (!this.isSameDateInterval()) {
                        rangeDates = this.dateChart.tmpDateInterval || this.dateChart.dateInterval;
                        this.$nextTick(() => {
                            this.dateChart.dateInterval = this.dateChart.tmpDateInterval;
                        })
                    }
                    params.FSTAT_TIME_start = this.$helper.formatDate(rangeDates[0], 'yyyy-MM-dd+HH:mm:ss')
                    params.FSTAT_TIME_end = this.$helper.formatDate(rangeDates[1], 'yyyy-MM-dd+HH:mm:ss')
                } else if (dateType === 'lastDay') {
                    params.FSTAT_TIME_start = this.$helper.formatDate(new Date(params.FSTAT_TIME_start).getTime() - 24 * 60 * 60 * 1000, 'yyyy-MM-dd+HH:mm:ss')
                    params.FSTAT_TIME_end = this.$helper.formatDate(new Date(params.FSTAT_TIME_end).getTime() - 24 * 60 * 60 * 1000, 'yyyy-MM-dd+HH:mm:ss')
                } else if (dateType === 'lastWeek') {
                    params.FSTAT_TIME_start = this.$helper.formatDate(new Date(params.FSTAT_TIME_start).getTime() - 7 * 24 * 60 * 60 * 1000, 'yyyy-MM-dd+HH:mm:ss')
                    params.FSTAT_TIME_end = this.$helper.formatDate(new Date(params.FSTAT_TIME_end).getTime() - 7 * 24 * 60 * 60 * 1000, 'yyyy-MM-dd+HH:mm:ss')
                }
                let res = await this.$request.get(this.listUrl || '/manage/page/query', {
                    params,
                    // cancelToken: new axios.CancelToken((c) => {
                    //                 // An executor function receives a cancel function as a parameter
                    //                 requestCancelObj.dateDataTableCancelFn = c
                    //               }),
                })
                if (this.$helper.checkRequestResultMessage(this, res)) {
                    this.dateChart.groupKey = res.value.groupKey
                    if (dateType === 'contrast') {
                        this.dateChart.contrastTableDatas = res.value.data
                    } else if (dateType === 'lastDay') {
                        this.dateChart.lastDayDatas = res.value.data
                    } else if (dateType === 'lastWeek') {
                        this.dateChart.lastWeekDatas = res.value.data
                    } else {
                        this.dateChart.dateTableDatas = res.value.data
                    }
                    this.initDateChart(this.chartType, dateType, this.dateChart.checkDays)
                }
            } catch (e) { console.log(e) }
            this.loading.table = false
            this.changeUrlQuery()
        },

        async loadSummaryData() {
            try {
                const params = this.getSearchParams()
                delete params.start
                delete params.max
                // 参数未变，不需要请求
                if (this.lastParamsString == JSON.stringify(params)) {
                    return
                }
                this.lastParamsString = JSON.stringify(params);
                if (requestCancelObj.dataTableSummaryFn) {
                    requestCancelObj.dataTableSummaryFn(`loadSummaryData()`)
                    requestCancelObj.dataTableSummaryFn = null
                }
                let res = await this.$request.get(this.summaryUrl || '/manage/page/summary', {
                    params: params,
                    cancelToken: new axios.CancelToken((c) => {
                        // An executor function receives a cancel function as a parameter
                        requestCancelObj.dataTableSummaryFn = c
                    }),
                })
                if (this.$helper.checkRequestResultMessage(this, res)) {
                    if (typeof res.value.data == 'string') {
                        res.value.data = JSON.parse(res.value.data)
                    }
                    this.summary = res.value.data
                    this.summary.__isSummary = 1
                }
            } catch (e) { console.log(e) }
        },

        async loadPageDropDownColumnData() {
            const formatData = (data, dataType) => {
                if (dataType == 'number') {
                    return Number(data)
                }
                return data
            }
            const columns = this.columns.filter(p => (p.custom.type == 'dropdown' || p.custom.dataType == 'enum') && !this.enums[p.name])
            if (columns.length) {
                try {
                    let results = await Promise.all(columns.map(column => {
                        return this.$request.get(column.custom.options.url || '/manage/config/meta/data/list2', {
                            params: column.custom.options.url ? {} : { name: column.name },
                        })
                    }))
                    results.forEach((res, i) => {
                        if (this.$helper.checkRequestResultMessage(this, res)) {
                            res.value = res.value.map(p => ({
                                name: p.value,
                                value: formatData(p.data, columns[i].custom.dataType),
                            }))
                            this.enums[columns[i].name] = res.value
                        }
                    })
                } catch (e) { console.log(e); }
            }
        },

        getSummaryTextColumnName(columns) {
            return columns.length > 0 ? columns[0].name : ''
        },

        searchAction() {
            // this.pagination.currentPage = 1
            this.loadDataTable()
            if (this.hasPageAction('search-summary')) {
                this.loadSummaryData()
            }
            if (this.dateChart.showChart) {
                const params = this.getSearchParams()
                let ostart = new Date(params.FSTAT_TIME_start),
                    oend = new Date(params.FSTAT_TIME_end),
                    gapDay = Math.abs(oend.getDate() - ostart.getDate()) + 1;

                if (new Date(params.FSTAT_TIME_end).getTime() - new Date(params.FSTAT_TIME_start).getTime() <= 24 * 60 * 60 * 1000) {
                    this.loadDateDataTable('thatDay')
                    this.loadDateDataTable('lastDay')
                    this.loadDateDataTable('lastWeek')
                } else {
                    this.loadDateDataTable('default')
                    // this.loadDateDataTable('contrast');
                }
                this.dateChart.dateInterval = '';
                this.dateChart.gapDay = gapDay; // 记录当前的时间区间
            }
        },

        changeUrlQuery() {
            const query = this.$helper.assign({}, this.getSearchParams())
            delete query.pid
            delete query._reload
            this.$router.replace({
                name: this.$route.name,
                params: this.$helper.assign({}, this.$route.params),
                query,
            })
        },

        exportAction(isDay) {
            this.loadExportData(isDay)
            this.intervalId = setInterval(() => {
                if (this.exports.percent < 99) {
                    this.exports.percent += 1
                }
            }, 300)
            this.exports.percent = 0
            this.exports.show = true
            const dateField = this.searchFields.filter(p => p.name == 'FSTAT_TIME')[0]
            const names = this.breadcrumb.concat(dateField ? `(${dateField.value.map(p => p.split(' ')[0]).join('-')})` : [])
            this.exports.text = names.join('-')
        },

        async loadExportData(isDay) {
            try {
                if (requestCancelObj.dataTableExportCancelFn) {
                    requestCancelObj.dataTableExportCancelFn(`loadDataTable()`)
                    requestCancelObj.dataTableExportCancelFn = null
                }
                let params = this.getSearchParams()
                delete params.max
                delete params.start
                if (isDay) {
                    params.group = 'FSTAT_TIME'
                }
                let res = await this.$request.get(this.listUrl || '/manage/page/query', {
                    params,
                    cancelToken: new axios.CancelToken((c) => {
                        // An executor function receives a cancel function as a parameter
                        requestCancelObj.dataTableExportCancelFn = c
                    }),
                })
                if (this.$helper.checkRequestResultMessage(this, res)) {
                    this.exportDatas = (!isDay && this.hasPageAction('search-summary') ? [this.summary] : []).concat(res.value.data)
                    this.exports.percent = 100
                    this.exports.show = false
                    this.submitExportReport(isDay)
                }
            } catch (e) {
                this.$message({
                    type: 'error',
                    message: '导出报表出错，请重试',
                })
            }
            this.clearIntervalId()
        },

        getDialogFields(type) {
            let fields = []
            switch (type) {
                case 'add':
                case 'copy':
                    fields = this.allColumns.filter(p => !p.isKey && p.isUse && Config.ignoreColumns.indexOf(p.name) == -1).map(p => { p.value = ''; return p; })
                    break
                case 'update':
                    fields = this.allColumns.filter(p => p.isUse && Config.ignoreColumns.indexOf(p.name) == -1)
                    break
                case 'detail':
                    fields = this.allColumns.filter(p => p.isUse)
                    break
                default:
            }
            return fields.map(p => this.$helper.assign({ disabled: type == 'detail' }, p))
        },

        getDialogActionUrl(type) {
            switch (type) {
                case 'add':
                case 'copy':
                    return this.addUrl || '/manage/page/add'
                case 'update':
                    return this.updateUrl || '/manage/page/update'
                default:
            }
            return []
        },

        showDialog(type, info, title = '') {
            const existed = this.dialogs.filter(p => p.type == type)[0]
            const dialog = existed ? existed :
                {
                    type,
                    fields: this.getDialogFields(type),
                    visible: true,
                    url: this.getDialogActionUrl(type),
                    title,
                }
            if (!existed) {
                this.dialogs.push(dialog)
            }
            if (info) {
                dialog.fields.forEach(field => {
                    field.value = info[field.name] || ''
                })
            }
            dialog.visible = true
        },

        async deleteConfirm(info) {
            try {
                await this.$confirm('确定删除?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                })
                const params = this.columns.reduce((c, p) => {
                    if (p.isKey) {
                        c[p.name] = info[p.name]
                    }
                    return c
                }, {
                    pid: this.pid,
                })
                const res = await this.$request.post(this.deleteUrl || '/manage/page/delete', params)
                if (this.$helper.checkRequestResultMessage(this, res)) {
                    this.searchAction()
                }
            } catch (e) { console.log(e) }
        },

        async submitDialog(dialog) {
            this.loading.submitBtn = true
            const params = dialog.fields.reduce((c, p) => {
                c[p.name] = p.value
                return c
            }, {
                pid: this.pid,
            })
            try {
                const res = await this.$request.post(dialog.url, params)
                if (this.$helper.checkRequestResultMessage(this, res)) {
                    this.searchAction()
                }
            } catch (e) { console.log(e) }
            this.loading.submitBtn = false
            dialog.visible = false
        },

        submitIfameDialog() {
            this.loading.submitBtn = true
            this.$refs.iframe.contentWindow.postMessage({ type: 'iframe-submit' }, '*')
        },

        tableColumnHiddenChange(defaultColumns) {
            this.$helper.storage.set(this.pid, defaultColumns)
            this.popoverStorage = defaultColumns
        },

        submitExportReport(isDay) {
            const total = this.pagination.total
            const exportFn = (result) => {
                const columns = [].concat(isDay ? Config.FSTAT_TIME_COLUMN : []).concat(this.showColumns)
                ExportJS.toCSV({
                    columns: columns.filter(column => column.type !== 'index').map(column => ({
                        title: this.showLabel(column.label),
                        key: column.label,
                    })),
                    data: result.map((row, rowIndex) => columns.filter(column => column.type !== 'index').reduce((p, c, colIndex) => {
                        p[c.label] = this.getColumnValue(c, row, rowIndex, colIndex)
                        return p
                    }, {})),
                    fileName: `${this.exports.text}.csv`,
                })
            }
            if (total !== 0) {
                exportFn(this.exportDatas)
            } else {
                this.$message({
                    type: 'warning',
                    message: '没有数据导出',
                })
            }
        },

        cancelRequestDataTableLoad() {
            if (requestCancelObj.dataTableExportCancelFn) {
                requestCancelObj.dataTableExportCancelFn(`loadDataTableList()`)
                requestCancelObj.dataTableExportCancelFn = null
            }
            this.exports.show = false
            this.clearIntervalId()
        },

        clearIntervalId() {
            if (this.intervalId) {
                clearInterval(this.intervalId)
                this.intervalId = 0
            }
        },

        initDateChart(chartType, dateType, checkDays) {
            // console.log('chartType', chartType)
            // console.log('dateTableDatas', this.dateTableDatas)
            // console.log('contrastTableDatas', this.contrastTableDatas)
            // console.log('showColumns', this.showColumns)
            const legendData = this.showColumns.filter(item => {
                if (chartType === 'tendencyChart') {
                    if (item.tendencyChart) return item
                } else if (chartType === 'barChart') {
                    if (item.barChart) return item
                }
            }).map(item => item.label.replace('(总)', ''))
            const legendName = this.showColumns.filter(item => {
                if (chartType === 'tendencyChart') {
                    if (item.tendencyChart) return item
                } else if (chartType === 'barChart') {
                    if (item.barChart) return item
                }
            }).map(item => {
                return item.name ? item.name : (
                    item.custom.format ? item.custom.format.replace(/[${|}]/g, '') : 'NULL'
                ) // 格式化行为数据的名称
            })
            const legendSelected = legendData.reduce((p, c) => this.$helper.assign(p, {
                [c]: false }), {})
            const chartOptions = this.dateChart.chartOptions
            chartOptions.legend.data = legendData
            chartOptions.legend.selected = legendSelected
            let datasFilterFn = (data) => {
                return data.filter(item => {
                    if (item.hasOwnProperty(this.dateChart.groupKey)) {
                        return item
                    }
                })
            }
            let tableDatasFilter = datasFilterFn(this.dateChart.dateTableDatas)
            if (chartType === 'tendencyChart') {
                chartOptions.xAxis.data = tableDatasFilter.map(item => {
                    return this.$helper.formatDate(item.FSTAT_TIME, this.isOneDay && !this.isDatasTimeSame ? ('HH:mm') : 'yyyy-MM-dd')
                })
                if (this.isOneDay && checkDays.indexOf('thatDay') == -1) {
                    chartOptions.series = []
                } else {
                    chartOptions.series = legendName.map((item, idx) => {
                        return {
                            name: legendData[idx],
                            type: 'line',
                            data: tableDatasFilter.map(list => {
                                return this.fatCalcData(list, item)
                            }),
                            itemStyle: {
                                normal: {
                                    color: '#1874CD',
                                    label: {
                                        show: false,
                                        formatter: this.formatterFn
                                    }
                                }
                            },
                            areaStyle: {}
                        }
                    })
                }
                if (dateType === 'contrast') {
                    legendName.forEach((item, idx) => {
                        chartOptions.series.push({
                            name: legendData[idx],
                            type: 'line',
                            data: this.dateChart.contrastTableDatas.map(list => {
                                return this.fatCalcData(list, item)
                            }),
                            itemStyle: {
                                normal: {
                                    color: '#FFB90F',
                                    label: {
                                        show: false,
                                        formatter: this.formatterFn
                                    }
                                }
                            },
                            areaStyle: {}
                        })
                    })
                } else if (dateType === 'lastDay' || dateType === 'lastWeek') {
                    tableDatasFilter = datasFilterFn(this.dateChart.lastDayDatas)
                    chartOptions.xAxis.data = tableDatasFilter.map(item => {
                        return this.$helper.formatDate(item.FSTAT_TIME, this.isOneDay && !this.isDatasTimeSame ? ('HH:mm') : 'yyyy-MM-dd')
                    })
                    if (this.isOneDay && checkDays.indexOf('lastDay') > -1) {
                        legendName.forEach((item, idx) => {
                            chartOptions.series.push({
                                name: legendData[idx],
                                type: 'line',
                                data: this.dateChart.lastDayDatas.map(list => {
                                    return this.fatCalcData(list, item)
                                }),
                                itemStyle: {
                                    normal: {
                                        color: '#EEAD0E',
                                        label: {
                                            show: false,
                                            formatter: this.formatterFn
                                        }
                                    }
                                },
                                areaStyle: {}
                            })
                        })
                    }
                    if (this.isOneDay && checkDays.indexOf('lastWeek') > -1) {
                        legendName.forEach((item, idx) => {
                            chartOptions.series.push({
                                name: legendData[idx],
                                type: 'line',
                                data: this.dateChart.lastWeekDatas.map(list => {
                                    return this.fatCalcData(list, item)
                                }),
                                itemStyle: {
                                    normal: {
                                        color: '#57C43C',
                                        label: {
                                            show: false,
                                            formatter: this.formatterFn
                                        }
                                    }
                                },
                                areaStyle: {}
                            })
                        })
                    }
                }
                chartOptions.xAxis.data.reverse()
                chartOptions.series = chartOptions.series.map(item => {
                    item.data.reverse()
                    return item
                })
                
                // 折线图自定义tooltip
                chartOptions.tooltip = {
                    trigger: 'axis',
                    formatter: this.fatDataName
                }
            } else if (chartType === 'barChart') {
                chartOptions.xAxis.boundaryGap = true
                if (tableDatasFilter.length > 10) {
                    tableDatasFilter = tableDatasFilter.splice(0, 10)
                }
                chartOptions.xAxis.data = tableDatasFilter.map(item => {
                    return this.$helper.getDropDownLabel(item[this.dateChart.groupKey], this.enums[this.dateChart.groupKey] || []) || item[this.dateChart.groupKey];
                })
                chartOptions.series = legendName.map((item, idx) => {
                    return {
                        dataType: 'cur',
                        name: legendData[idx],
                        type: 'bar',
                        data: tableDatasFilter.map(list => {
                            return this.fatCalcData(list, item)
                        }),
                        itemStyle: {
                            normal: {
                                color: '#1874CD',
                                label: {
                                    show: false,
                                    position: 'top',
                                    formatter: this.formatterFn
                                }
                            }
                        },
                        barWidth: 30,
                        barGap: '30%',
                    }
                })
                if (dateType === 'contrast') {
                    let contrastTableDatas = this.dateChart.contrastTableDatas
                    if (contrastTableDatas.length > 10) {
                        contrastTableDatas = contrastTableDatas.splice(0, 10)
                    }
                    legendName.forEach((item, idx) => {
                        chartOptions.series.push({
                            dataType: 'prev',
                            name: legendData[idx],
                            type: 'bar',
                            data: contrastTableDatas.map(list => {
                                return this.fatCalcData(list, item)
                            }),
                            itemStyle: {
                                normal: {
                                    color: '#FFB90F',
                                    label: {
                                        show: true,
                                        position: 'top',
                                        formatter: (params) => {
                                            let percent = 0
                                            const series = chartOptions.series
                                            // 查找上一个的对比数据
                                            for (let i = 0; i < series.length; i++) {
                                                if (series[i].dataType === 'cur' && series[i].name === params.seriesName) {
                                                    let prev = series[i].data[params.dataIndex];
                                                    if(prev>0 && params.value>0) percent = ((params.value / prev - 1)*100).toFixed(2);
                                                    if (isNaN(percent)) percent = 1;
                                                    break
                                                }
                                            }
                                            // let val = params.value < 1 && params.value != 0 ? ((params.value * 100).toFixed(2) + '%') : (params.value>10000? `${(params.value / 10000).toFixed(2)}万`: params.value);
                                            // return `${val}\n(${percent}%)`
                                            return `${percent}%`
                                        }
                                    }
                                }
                            },
                            /* label: {
                                normal: {
                                    show: true,
                                    position: 'top',
                                    formatter: (params) => {
                                        let percent = ''
                                        const series = chartOptions.series
                                        for (let i = 0; i < series.length; i++) {
                                            if (series[i].dataType === 'cur' && series[i].name === params.seriesName) {
                                                percent = ((params.value / series[i].data[params.dataIndex] - 1)*100).toFixed(2)
                                                if (isNaN(percent)) percent = 1
                                                break
                                            }
                                        }
                                        return `${(params.value / 10000).toFixed(2)}万\n(${percent}%)`
                                    },
                                }
                            }, */
                            barWidth: 30,
                            barGap: '30%',
                        })
                    })
                }
                // 格式化x轴，不要太长
                chartOptions.xAxis.axisLabel = {
                    show: true,
                    interval: 'auto',
                    formatter: function(val){
                        return val.substring(0, 7)
                    }
                }

            }
            // 格式化y轴百分比的数值
            chartOptions.yAxis = {
                type: 'value',
                axisLabel: {
                    show: true,
                    interval: 'auto',
                    formatter: this.formatterFn
                }
            }

            this.loading.echart = false
        },
        contrastDateInterval() { //对比日期时间段图表
            if (!this.dateChart.dateInterval) {
                return this.loadDateDataTable('default')
            }
            if (!this.isSameDateInterval() && !this.isSameDateInterval(this.dateChart.tmpDateInterval)) {
                this.$msgbox({
                    type: 'error',
                    message: '对比时段的天数必须一致',
                })
                this.dateChart.dateInterval = ''
                this.dateChart.contrastTableDatas = ''
            } else {
                this.dateChart.checkDays = ['thatDay']
                this.loadDateDataTable('contrast')
            }
        },

        isSameDateInterval(dates) { //判断是否天数相同的时间区间
            let tmpDates = dates ? dates : this.dateChart.dateInterval;
            if (!tmpDates) return false
            let getDays = (dateStart, dateEnd) => {
                return (new Date(dateEnd).getTime() - new Date(dateStart).getTime() + 1000) / (1000 * 60 * 60 * 24)
            }
            let searchParams = this.getSearchParams(),
                contrastDays = getDays(tmpDates[0], tmpDates[1]),
                searchDays = getDays(searchParams.FSTAT_TIME_start, searchParams.FSTAT_TIME_end)
            return contrastDays === searchDays ? true : false
        },

        handleCheckDaysChange(val) {
            this.initDateChart(this.chartType, 'lastDay', val)
        },

        handleDateInterval() {
            this.contrastDateInterval()
        },
        // 格式化计算属性值
        fatCalcData(data, key) {
            // 跟消耗相关的值都需要除100
            if(data[key]){
                if(key=="SUM(FCOST)"){
                    return data[key]/100
                }
                return data[key]
            }else if(key.indexOf('/') > -1){
                let fatKey1 = key.split('/'),
                    fatKey2 = fatKey1[1].split('*'),
                    fatKey3 = fatKey2[1] ? fatKey2[1] : null;
                fatKey1 = fatKey1[0];
                fatKey2 = fatKey2[0];

                let val = (data[fatKey1] > 0 && data[fatKey2] > 0) ? (data[fatKey1] / data[fatKey2]) : 0;

                if (fatKey3) val = val * fatKey3;
                if(fatKey1=="SUM(FCOST)"||fatKey2=="SUM(FCOST)"||fatKey3=="SUM(FCOST)") {
                    val = val/100
                }
                return val.toFixed(4)
            }
            return 0
        },
        // 设置对比时间的默认时间
        setDfDateInterval() {
            let searchParams = this.getSearchParams(),
                ostart = new Date(searchParams.FSTAT_TIME_start),
                oend = new Date(searchParams.FSTAT_TIME_end),
                gapDay = Math.abs(oend.getDate() - ostart.getDate()) + 1;
            let start = new Date(ostart.getTime() - gapDay * 24 * 60 * 60 * 1000),
                end = new Date(oend.getTime() - gapDay * 24 * 60 * 60 * 1000);
            this.dateChart.dateInterval = [start, end]; // 设置对应的默认对比时间
            this.dateChart.gapDay = gapDay; // 记录当前的时间区间
            this.$nextTick(() => {
                this.loadDateDataTable('contrast');
            })
        },
        // 对比时间段的快捷操作
        setShortcutDateInterval(picker, prevYear) {
            let searchParams = this.getSearchParams(),
            dateChart = this.dateChart.dateInterval? this.dateChart.dateInterval: [searchParams.FSTAT_TIME_start,
                searchParams.FSTAT_TIME_end],
                ostart = new Date(dateChart[0]),
                oend = new Date(dateChart[1]),
                gapTime = Math.abs(oend - ostart) + 24 * 60 * 60 * 1000;
            let start = new Date(ostart.getTime()),
                end = new Date(oend.getTime());

            if (!prevYear) {
                start = new Date(ostart.getTime() - gapTime)
                end = new Date(oend.getTime() - gapTime)
            } else {
                start = start.setFullYear(start.getFullYear() - 1)
                end = end.setFullYear(end.getFullYear() - 1)
            }

            picker.$emit('pick', [start, end])
        },
        // 对比时间段的选项
        dateRangeOptions() {
            let self = this;
            return {
                shortcuts: Object.keys(Config.daterangeShortcutsRange).map((p) => {
                    return {
                        text: Config.daterangeShortcutsRange[p],
                        onClick(picker) {
                            if (p == 'prevRange') {
                                self.setShortcutDateInterval(picker);
                            } else {
                                self.setShortcutDateInterval(picker, true);
                            }
                        }
                    }
                }),
                onPick({ maxDate, minDate }) {
                    // 判断前后两个值，但是控制为只选择一次
                    let fstatTime = self.getSearchParams(),
                        start = maxDate ? maxDate : minDate;
                    let gapTime = new Date(fstatTime.FSTAT_TIME_end) - new Date(fstatTime.FSTAT_TIME_start),
                        end = new Date(new Date(start).getTime() + gapTime);
                    self.dateChart.tmpDateInterval = [start, end];
                    this.$emit('pick', [start, end]);
                }
            }
        },
        fatTimeRange(type) {
            let rangeDates = this.getSearchParams();
            rangeDates = [rangeDates.FSTAT_TIME_start, rangeDates.FSTAT_TIME_end];

            if (type == 'prev') rangeDates = this.dateChart.dateInterval;
            if (!Array.isArray(rangeDates)) return 0;
            return `${this.$helper.formatDate(rangeDates[0], 'yyyy-MM-dd')}至${this.$helper.formatDate(rangeDates[1], 'yyyy-MM-dd')}`
        },
        fatDataName(params) {
            let plen = params? params.length: 0;    // 判断当天有时间没数据的清空
            let now = plen==3? params[0]: null,
                old = plen==3? params[1]: (plen==2? params[0]: null),
                lastWeek = plen==3? params[2]: (plen==1? params[0]: params[1]);

            let nowTime = this.getSearchParams().FSTAT_TIME_start,
                tooltip = '',
                val = 0;
            if(now){
                val = this.formatterFn(now.value, now.seriesName);

                let tmpTime = now.axisValue.length<8? this.$helper.formatDate(nowTime, 'yyyy-MM-dd'): now.axisValue,
                    showTime = now.axisValue.length<8? `${tmpTime} ${now.axisValue}`: now.axisValue;
                tooltip += `${showTime} 星期${"日一二三四五六".charAt(new Date(tmpTime).getDay())}<br/>${now.seriesName}: ${val}<br/>`;
            }
            if(!this.isOneDay){
                if(old){
                    val = this.formatterFn(old.value, old.seriesName);

                    let oldTime = new Date(old.axisValue).getTime() - this.dateChart.gapDay * 24 * 60 * 60 * 1000,
                        oldAxisValue = this.$helper.formatDate(oldTime, 'yyyy-MM-dd');
                    tooltip += `${oldAxisValue} 星期${"日一二三四五六".charAt(new Date(oldTime).getDay())}<br/>${old.seriesName}: ${val}`; 
                }
            }else{
                if(old){
                    val = this.formatterFn(old.value, old.seriesName);

                    let oldTime = new Date(nowTime).getTime() - 24 * 60 * 60 * 1000,
                        oldAxisValue = this.$helper.formatDate(oldTime, 'yyyy-MM-dd') + ` ${old.axisValue}`;
                    tooltip += `${oldAxisValue} 星期${"日一二三四五六".charAt(new Date(oldTime).getDay())}<br/>${old.seriesName}: ${parseFloat(old.value).toFixed(2)}<br/>`; 
                }
                if(lastWeek){
                    val = this.formatterFn(lastWeek.value, lastWeek.seriesName);

                    let lastWeekTime = new Date(nowTime).getTime() - 7*24 * 60 * 60 * 1000,
                        lastWeekAxisValue = this.$helper.formatDate(lastWeekTime, 'yyyy-MM-dd') + ` ${lastWeek.axisValue}`;
                    tooltip += `${lastWeekAxisValue} 星期${"日一二三四五六".charAt(new Date(lastWeekTime).getDay())}<br/>${val}`; 
                }
            }
            return tooltip
        },
        formatterFn(params, seriesName) {
			// number: y坐标格式化
			// 对象：单条series格式化
            // 数组：全局的series格式化
			if(!isNaN(Number(params))){
                let val = params;
                if(seriesName=="eCPM") val = parseFloat(val).toFixed(2);
				return (val < 1 && val != 0 ? ((val * 100).toFixed(2) + '%') : (val>10000? this.formatNumber(val): val))
			}else{
				let val = parseFloat(params.value);
				// 单独对消耗的值做处理
				/* if (params.seriesName && params.seriesName.indexOf('消耗') > -1) {
					val = val / 100
                } */
				// 判断当前的值是否是小数
				return ( val < 1 && val != 0 ? ((val * 100).toFixed(2) + '%') : (val>10000? `${(val / 10000).toFixed(2)}万`: val.toFixed(2)) )
			}
        },
        formatNumber(num) {
            let str = num+'',
                tmp = str.split('.');   // 分割小数
            // ["8", "7", "6", "5", "4", "3", "2", "1"]
            let tmpnum = tmp[0].split("").reverse().reduce((prev, next, index) => {
                return ((index % 3) ? next : (next + ',')) + prev;
            })
            return tmp[1]? (tmpnum+"."+tmp[1]): tmpnum
        }
    }
}
</script>

<style lang="stylus">
.generator-wrapper
  .search-form-card
    margin-bottom: 22px
    .search-buttons
      text-align right
    .el-date-editor
      width 95%
      min-width 245px
      .el-range__close-icon
        width: 20px
    .el-icon-date
      width 20px
  .dialog-iframe
    width: 100%
    height: 100%
    min-height: 300px
    border: none
  .data-table-summary
    border-top none
    color #20a0ff
    tr, td
      background-color #eef1f6
  .el-card-chart
    .line-style
      display: flex;
      justify-content: center;
      align-items: center;
      .line-style-color
        width: 30px;
        height: 4px;
        background-color: #FFB90F;
        margin-right: 10px;
      .line-style-color-blue
        background-color: blue;
      span
        margin-right: 20px;
  .check-days
    display: flex;
    justify-content: center;
  .block-echart
    position: relative;
    width: 100%;
  .lastWeekCheckbox .el-checkbox__inner, .lastWeekCheckbox .el-checkbox__label
    color: #57C43C;
    border-color: #57C43C;
  .lastDayCheckbox .el-checkbox__inner, .lastDayCheckbox .el-checkbox__label
    color: #EEAD0E;
    border-color: #EEAD0E;

.table-row-actions-wrap
  a, a:active, a:focus
    color: inherit;

.popover-table-column-hidden
  float right
  margin-top -11px
.export-wrapper
  position absolute
  right 20px
  bottom 20px
  width 350px
  background #fff
  padding 8px 12px
  z-index 20
  border-radius 5px
  box-shadow 0 0 5px #9a9a9a
  z-index 100
  .export-title
    text-align center
    margin-bottom 4px
  .export-close
    position absolute
    right 9px
    top 7px
    font-size 8px
    cursor pointer
</style>
