<template>
  <div class="home-wrapper">
    <el-card class="box-card box-card-indictor">
      <div slot="header">
        <span>关键指标</span>
      </div>
      <el-row type="flex" justify="space-between" :gutter="25" v-loading="loading.indictor">
        <el-col>
          <el-card :body-style="{background: 'rgba(251, 241, 162, 0.21)'}">
            <dl>
              <dt>昨天消耗&nbsp;<b class="good">{{indictor.billPrice | formatThousands}}元</b></dt>
              <dd>环比前一天：{{ indictor.billPriceTheDayBeforeRate | upDownText }}
                  <b :class="indictor.billPriceTheDayBeforeRate | upDownClass">
                    {{ indictor.billPriceTheDayBeforeRate }}
                  </b>
              </dd>
              <dd>同比上周同期：{{ indictor.billPriceTheDayLastWeekRate | upDownText }}
                <b :class="indictor.billPriceTheDayLastWeekRate | upDownClass">
                  {{ indictor.billPriceTheDayLastWeekRate }}
                </b>
              </dd>
            </dl>
          </el-card>
        </el-col>
        <el-col>
          <el-card :body-style="{background: 'rgba(251, 241, 162, 0.21)'}">
            <dl>
              <dt>昨天曝光&nbsp;<b class="good">{{indictor.expoTimes | formatThousands}}</b></dt>
              <dd>环比前一天：{{ indictor.expoTimesTheDayBeforeRate | upDownText }}
                  <b :class="indictor.expoTimesTheDayBeforeRate | upDownClass">
                    {{ indictor.expoTimesTheDayBeforeRate }}
                  </b>
              </dd>
              <dd>同比上周同期：{{ indictor.expoTimesTheDayLastWeekRate | upDownText }}
                <b :class="indictor.expoTimesTheDayLastWeekRate | upDownClass">
                  {{ indictor.expoTimesTheDayLastWeekRate }}
                </b>
              </dd>
            </dl>
          </el-card>
        </el-col>
        <el-col>
          <el-card :body-style="{background: 'rgba(251, 241, 162, 0.21)'}">
            <dl>
              <dt>昨天eCPM&nbsp;<b class="good">{{indictor.exposPricePerThousand | formatThousands}}</b></dt>
              <dd>环比前一天：{{ indictor.exposPricePerThousandTheDayBeforeRate | upDownText }}
                  <b :class="indictor.exposPricePerThousandTheDayBeforeRate | upDownClass">
                    {{ indictor.exposPricePerThousandTheDayBeforeRate }}
                  </b>
              </dd>
              <dd>同比上周同期：{{ indictor.exposPricePerThousandTheDayLastWeekRate | upDownText }}
                <b :class="indictor.exposPricePerThousandTheDayLastWeekRate | upDownClass">
                  {{ indictor.exposPricePerThousandTheDayLastWeekRate }}
                </b>
              </dd>
            </dl>
          </el-card>
        </el-col>
        <el-col>
          <el-card :body-style="{background: 'rgba(251, 241, 162, 0.21)'}">
            <dl>
              <dt>昨天毛利收入&nbsp;<b class="good">元</b></dt>
              <dd>去年毛利KPI：万元</dd>
              <dd>KPI预计完成率：</dd>
            </dl>
          </el-card>
        </el-col>
      </el-row>
      <p>预计完成率 =（本月已完成收入 + 本月日均毛利 * 剩余天数）/ 本月KPI</p>
    </el-card>

    <el-card class="box-card box-card-income">
      <div slot="header">
        <span>输入趋势图</span>
        <form-item @input="loadIncomeData" value="" origin="home" :field="incomeChart.daterangeField">
        </form-item>
      </div>
      <vue-echart :options="incomeChart.chartOptions" v-loading="loading.income">
      </vue-echart>
    </el-card>

    <el-card class="box-card box-card-income-analysis" v-loading="loading.income">
      <div class="income-type" v-loading="loading.incomeType">
        <div slot="header">
          <span>收入类型分析</span>
          <span class="label">本期:</span>
          <form-item @input="loadIncomeTypeCurData" value="" origin="home" :field="incomeTypeChart.daterangeFieldCur">
          </form-item>
          <span class="label">上期:</span>
          <form-item @input="loadIncomeTypePrevData" value="" origin="home" :field="incomeTypeChart.daterangeFieldPrev">
          </form-item>
        </div>
        <vue-echart :options="incomeTypeChart.chartOptions">
        </vue-echart>
        <div class="bar-color-wrap">
          <span>本期：</span><div class="bar-color orange"></div>
          <span>上期：</span><div class="bar-color blue"></div>
        </div>
      </div>
      <!-- <div class="income-ratio" v-loading="loading.incomeRatio">
        <div slot="header">
          <span>收入类型占比分析</span>
          <el-date-picker
            v-model="incomeRatioChart.monthFieldStart.value"
            type="month"
            placeholder="选择月"
            @change="loadIncomeRatioData">
          </el-date-picker>
          <span>到</span>
          <el-date-picker
            v-model="incomeRatioChart.monthFieldEnd.value"
            type="month"
            placeholder="选择月"
            @change="loadIncomeRatioData">
          </el-date-picker>
        </div>
        <vue-echart :options="incomeRatioChart.chartOptions">
        </vue-echart>
      </div> -->
      <div class="media" v-loading="loading.media">
        <div slot="header">
          <span>媒体分析</span>
          <span class="label">本期:</span>
          <form-item @input="loadMediaCurData" value="" origin="home" :field="mediaChart.daterangeFieldCur">
          </form-item>
          <span class="label">上期:</span>
          <form-item @input="loadMediaPrevData" value="" origin="home" :field="mediaChart.daterangeFieldPrev">
          </form-item>
        </div>
        <vue-echart :options="mediaChart.chartOptions">
        </vue-echart>
        <div class="bar-color-wrap">
          <span>本期：</span><div class="bar-color orange"></div>
          <span>上期：</span><div class="bar-color blue"></div>
        </div>
      </div>
    </el-card>

  </div>
</template>

<script>
import Config from '../../bm-generator/lib/config'

export default {
  name: 'HomeScreen',

  data() {
    const legend = {
      income: { summary: '全部', cpd: 'CPD', cpc: 'CPC', ocpc: 'OCPC', },
      // incomeType: { cur: '本期日均', prev: '上期日均' },
      // incomeType: { billPrice: '消耗', expoTimes: '曝光', exposPricePerThousand: 'eCPM' },
      incomeType: [
        { '消耗': ['cpd', 'cpc', 'ocpc'] },
        { '曝光': ['cpdExpose', 'cpcExpose', 'ocpcExpose'] },
        { 'eCPM': ['cpdEcpm', 'cpdEcpm', 'ocpcEcpm'] },
      ],
      incomeTypeName: ['消耗', '曝光', 'eCPM'],
      incomeRatio: { cpd: 'CPD广告', cpc: 'CPC广告' },
    }
    const analysisItems = { billPrice: '消耗', expoTimes: '曝光', exposPricePerThousand: 'eCPM' }
    const weekDateRange = this.$helper.getDateRange('week', 1).map(p => this.$helper.formatDate(p))
    const monthDateRange = [this.$helper.formatDate(Date.now(), 'yyyy-MM-01'), this.$helper.formatDate(Date.now())]
    return {
      indictor: {},
      loading: {
        indictor: false,
        income: false,
        incomeType: false,
        incomeRatio: false,
        media: false,
      },
      incomeChart: {
        daterangeField: {
          type: 'daterange',
          value: weekDateRange,
          options: { disabledDate: 'afterToday' }
        },
        chartOptions: this.$helper.assign({}, Config.chartOptions, {
          legend: {
            dataMaps: legend.income,
            data: Object.values(legend.income),
            selected: Object.values(legend.income).reduce((p, c) => this.$helper.assign(p, { [c]: true }), {}),
          },
        })
      },
      incomeTypeChart: {
        daterangeFieldCur: {
          type: 'daterange',
          value: monthDateRange,
          options: { disabledDate: 'afterToday' }
        },
        daterangeFieldPrev: {
          type: 'daterange',
          value: [this.$helper.formatDate(this._getPrevDate(monthDateRange[0]), 'yyyy-MM-01'), this.$helper.formatDate(this._getPrevDate(monthDateRange[1]))],
          options: { disabledDate: 'afterToday' }
        },
        items: analysisItems,
        checkedItem: Object.keys(analysisItems)[0],
        chartOptions: this.$helper.assign({}, Config.chartOptions, {
          xAxis: {
            type: 'category',
            boundaryGap: true,
            data: ['CPD', 'CPC', 'OCPC'],
            fields: ['cpd', 'cpc', 'ocpc'],
          },
          legend: {
            dataMaps: legend.incomeType,
            data: legend.incomeTypeName,
            // data: Object.keys(legend.incomeType),
            // selected: Object.values(legend.incomeType).reduce((p, c) => this.$helper.assign(p, { [c]: true }), {}),
            selected: {},
            selectedMode: 'single'
          },
        })
      },
      incomeRatioChart: {
        monthFieldStart: {
          type: 'month',
          value: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
          options: {  }
        },
        monthFieldEnd: {
          type: 'month',
          value: new Date(),
          options: {  }
        },
        chartOptions: this.$helper.assign({}, Config.chartOptions, {
          legend: {
            dataMaps: legend.incomeRatio,
            data: Object.values(legend.incomeRatio),
            selected: Object.values(legend.incomeRatio).reduce((p, c) => this.$helper.assign(p, { [c]: true }), {}),
          },
        })
      },
      mediaChart: {
        daterangeFieldCur: {
          type: 'daterange',
          value: monthDateRange,
          options: { disabledDate: 'afterToday' }
        },
        daterangeFieldPrev: {
          type: 'daterange',
          value: [this.$helper.formatDate(this._getPrevDate(monthDateRange[0]), 'yyyy-MM-01'), this.$helper.formatDate(this._getPrevDate(monthDateRange[1]))],
          options: { disabledDate: 'afterToday' }
        },
        items: analysisItems,
        checkedItem: Object.keys(analysisItems)[0],
        chartOptions: this.$helper.assign({}, Config.chartOptions, {
          xAxis: {
            type: 'category',
            boundaryGap: true,
            // data: ['CPD', 'CPC', 'OCPC'],
            // fields: ['cpd', 'cpc', 'ocpc'],
          },
          legend: {
            // dataMaps: Object.values(analysisItems).map((item, idx)=> {
            //   let obj = {}
            //   obj[item] = Object.keys(analysisItems)[idx]
            //   return obj
            // }),
            dataMaps: Object.keys(analysisItems),
            data: Object.values(analysisItems),
            selected: {},
            selectedMode: 'single'
          },
        })
      },
    }
  },

  filters: {
    formatThousands(val) {
      if (typeof val === 'undefined') return val
      const v = val.toString().split('.')
      return v[0].replace(/(\d)(?=(?:\d{3})+$)/g, '$1,') + (v.length > 1 ? `.${v[1]}` : '')
    },

    upDownClass(val) {
      return String(val).indexOf('-') === 0 ? 'down' : 'up'
    },

    upDownText(val) {
      return String(val).indexOf('-') === 0 ? '降' : '升'
    },
  },

  computed: {
  },

  mounted() {
    this.loadIndictor()
    this.loadIncomeData()
    this.loadIncomeTypeCurData(this.incomeTypeChart.daterangeFieldCur.value)
    this.loadIncomeTypePrevData(this.incomeTypeChart.daterangeFieldPrev.value)
    this.loadIncomeRatioData()
    this.loadMediaCurData(this.mediaChart.daterangeFieldCur.value)
    this.loadMediaPrevData(this.mediaChart.daterangeFieldPrev.value)
    // setTimeout(() => {
    //   console.log('incomeChart', this.incomeChart)
    //   console.log('incomeTypeChart', this.incomeTypeChart)
    //   console.log('incomeRatioChart', this.incomeRatioChart)
    //   console.log('mediaChart', this.mediaChart)
    // }, 1000)
  },

  methods: {
    _getPrevDate(date) {
      date = new Date(this.$helper.getDateTime(date))
      const curDate = date.getDate()
      date.setDate(0) //上一个月的最后一天
      const lastDate = date.getDate()
      date.setDate(Math.min(curDate, lastDate))
      return date
    },

    incomeTypeItemChangeAction() {
      // console.log('incomeTypeChart.checkedItem', this.incomeTypeChart.checkedItem)
    },

    mediaItemChangeAction() {
      // console.log('mediaChart.checkedItem', this.mediaChart.checkedItem)
    },

    async loadIncomeRatioData() {
      this.loading.incomeRatio = true
      try {
        const res = await this.$request('/manage/dashboard/typeanalysis/chart', {
          params: {
            startDate: this.$helper.formatDate(this.incomeRatioChart.monthFieldStart.value),
            endDate: this.$helper.formatDate(this.incomeRatioChart.monthFieldEnd.value),
          },
        })
        if (this.$helper.checkRequestResultMessage(this, res)) {
          const resultData = res.value.sort((p1, p2) => (p1.statDate > p2.statDate ? 1 : -1))
          this.incomeRatioChart.chartOptions.xAxis.data = resultData.map(d => d.statDate)
          this.incomeRatioChart.chartOptions.series =
            Object.keys(this.incomeRatioChart.chartOptions.legend.dataMaps)
              .map((key) => ({
                type: 'line',
                name: this.incomeRatioChart.chartOptions.legend.dataMaps[key],
                smooth: true,
                stack: '总量',
                areaStyle: {normal: {}},
                data: resultData.map(p => this.$helper.formatData(this.$helper.getValueByPath(p, key), 'float')),
              }))
        }
      } catch(e) { console.log(e) }
      this.loading.incomeRatio = false
    },

    async loadIncomeData(value = this.incomeChart.daterangeField.value) {
      this.loading.income = true
      try {
        const res = await this.$request('/manage/dashboard/incomechart', {
          params: {
            startDate: value[0],
            endDate: value[1],
          },
        })
        if (this.$helper.checkRequestResultMessage(this, res)) {
          const resultData = res.value.sort((p1, p2) => (p1.statDate > p2.statDate ? 1 : -1))
          this.incomeChart.chartOptions.xAxis.data = resultData.map(d => d.statDate)
          this.incomeChart.chartOptions.series =
            Object.keys(this.incomeChart.chartOptions.legend.dataMaps)
              .map((key) => ({
                type: 'line',
                name: this.incomeChart.chartOptions.legend.dataMaps[key],
                smooth: true,
                data: resultData.map(p => this.$helper.formatData(this.$helper.getValueByPath(p, key), 'float')),
              }))
        }
      } catch(e) { console.log(e) }
      this.loading.income = false
    },

    async loadIncomeTypeCurData(date) {
      this.loading.income = true
      try {
        const res = await this.$request('/manage/dashboard/typeanalysis', {
          params: {
            startDate: date[0],
            endDate: date[1],
          },
        })
        if (this.$helper.checkRequestResultMessage(this, res)) {
          const chartOptions = this.incomeTypeChart.chartOptions
          chartOptions.series = chartOptions.series.filter((item) => {
            return item.dataType !== 'cur'
          })
          chartOptions.legend.dataMaps.forEach((item) => {
            chartOptions.series.push({
              dataType: 'cur',
              type: 'bar',
              name: Object.keys(item)[0],
              label: {
                show: true,
                position: 'top',
                formatter: (params) => {
                  return `${(params.value/1000).toFixed(2)}万`
                },
              },
              barMaxWidth: '40px',
              data: Object.values(item)[0].map((list) => {
                return res.value[0][list]
              }),
              itemStyle: {
                normal: {
                  color: '#E6941A',
                }
              },
            })
          })
          
        }
      } catch(e) { console.log(e) }
      this.loading.income = false
    },
    async loadIncomeTypePrevData(date) {
      this.loading.income = true
      try {
        const res = await this.$request('/manage/dashboard/typeanalysis', {
          params: {
            startDate: date[0],
            endDate: date[1],
          },
        })
        if (this.$helper.checkRequestResultMessage(this, res)) {
          const chartOptions = this.incomeTypeChart.chartOptions
          chartOptions.series = chartOptions.series.filter((item) => {
            return item.dataType !== 'prev'
          })
          chartOptions.legend.dataMaps.forEach((item) => {
            chartOptions.series.push({
              dataType: 'prev',
              type: 'bar',
              name: Object.keys(item)[0],
              label: {
                show: true,
                position: 'top',
                formatter: (params) => {
                  let percent = ''
                  const series = this.incomeTypeChart.chartOptions.series
                  for(let i = 0; i < series.length; i++){
                    if(series[i].dataType === 'cur' && series[i].name === params.seriesName){
                      percent = (params.value / series[i].data[params.dataIndex]).toFixed(2)
                      if(isNaN(percent)) percent = 1
                      break
                    }
                  }
                  return `${(params.value / 1000).toFixed(2)}万\n(${parseInt(percent*100)}%)`
                },
              },
              barMaxWidth: '40px',
              data: Object.values(item)[0].map((list) => {
                return res.value[0][list]
              }),
              itemStyle: {
                normal: {
                  color: '#338FCC',
                }
              },
            })
          })
        }
      } catch(e) { console.log(e) }
      this.loading.income = false
    },

    async loadMediaCurData(date) {
      this.loading.income = true
      try {
        const res = await this.$request('/manage/dashboard/mediaanalysis/chart', {
          params: {
            startDate: date[0],
            endDate: date[1],
          },
        })
        if (this.$helper.checkRequestResultMessage(this, res)) {
          const chartOptions = this.mediaChart.chartOptions
          chartOptions.series = chartOptions.series.filter((item) => {
            return item.dataType !== 'cur'
          })
          const xAxis = res.value[0].mediaDataChart.map( item => {
            return item.mediaId
          })
          chartOptions.xAxis.data = xAxis
          chartOptions.xAxis.fields = xAxis
          const legendDataMaps = chartOptions.legend.dataMaps
          const legendData = chartOptions.legend.data
          legendDataMaps.forEach((item, idx) => {
            chartOptions.series.push({
              dataType: 'cur',
              type: 'bar',
              name: legendData[idx],
              label: {
                show: true,
                position: 'top',
                formatter: (params) => {
                  return `${(params.value/10000).toFixed(2)}万`
                },
              },
              barMaxWidth: '30px',
              data: res.value[0].mediaDataChart.map( mediaItem => {
                return mediaItem[item]
              }),
              itemStyle: {
                normal: {
                  color: '#E6941A',
                }
              },
            })
          })
        }
      } catch(e) { console.log(e) }
      this.loading.income = false
    },
    async loadMediaPrevData(date) {
      this.loading.income = true
      try {
        const res = await this.$request('/manage/dashboard/mediaanalysis/chart', {
          params: {
            startDate: date[0],
            endDate: date[1],
          },
        })
        if (this.$helper.checkRequestResultMessage(this, res)) {
          const chartOptions = this.mediaChart.chartOptions
          chartOptions.series = chartOptions.series.filter((item) => {
            return item.dataType !== 'prev'
          })
          const xAxis = res.value[0].mediaDataChart.map( item => {
            return item.mediaId
          })
          chartOptions.xAxis.data = xAxis
          chartOptions.xAxis.fields = xAxis
          const legendDataMaps = chartOptions.legend.dataMaps
          const legendData = chartOptions.legend.data
          legendDataMaps.forEach((item, idx) => {
            chartOptions.series.push({
              dataType: 'prev',
              type: 'bar',
              name: legendData[idx],
              label: {
                show: true,
                position: 'top',
                formatter: (params) => {
                  let percent = ''
                  const series = this.mediaChart.chartOptions.series
                  for(let i = 0; i < series.length; i++){
                    if(series[i].dataType === 'cur' && series[i].name === params.seriesName){
                      percent = (params.value / series[i].data[params.dataIndex]).toFixed(2)
                      if(isNaN(percent)) percent = 1
                      break
                    }
                  }
                  return `${(params.value / 1000).toFixed(2)}万\n(${parseInt(percent*100)}%)`
                },
              },
              barMaxWidth: '30px',
              data: res.value[0].mediaDataChart.map( mediaItem => {
                return mediaItem[item]
              }),
              itemStyle: {
                normal: {
                  color: '#338FCC',
                }
              },
            })
          })
        }
      } catch(e) { console.log(e) }
      this.loading.income = false
    },

    async loadIncomeTypeRatioData() {},

    async loadIndictor() {
      this.loading.indictor = true
      try {
        const res = await this.$request('/manage/dashboard/keyincome', {
          params: {
            // startDate: this.$helper.formatDate(Date.now())
            startDate: '2018-10-01'
          },
        })
        if (this.$helper.checkRequestResultMessage(this, res)) {
          this.indictor = res.value[0] || {}
        }
      } catch(e) { console.log(e) }
      this.loading.indictor = false
    },
  },
}
</script>

<style lang="stylus">
.home-wrapper
  .box-card
    margin-bottom 2rem
  .box-card-indictor
    p
      margin-top: 2.2rem
    dl,dt,dd
      padding 0
      margin 0
      text-align center
      dt
        margin-bottom 10px
        font-size 16px
        min-height 43px
      dd
        color #666
        line-height 1.6
        margin-bottom 3px
        font-size 13px
      b
        font-size 110%
      .good
        color #20a0ff
        margin-right 3px
      .down
        color #51ca50
      .up
        color #ff4949
  .box-card-income
    .form-item
      margin-left: 10px
  .box-card-income-analysis
    .income-type, .income-ratio, .media
      width: 49%
      display: inline-block;
      vertical-align: top;
      .bar-color-wrap
        display: flex;
        justify-content: center;
        align-items: center;
        .bar-color
          width: 40px;
          height: 10px;
          margin: 10px;
        .orange
          background: #E6941A;
        .blue
          background: #338FCC;
    .form-item
      margin-left: 10px
    .income-type, .media
      .form-item
        margin-left: 0
      .label
        margin-left: 10px
      .el-date-editor--daterange
        width 200px
        .el-range__close-icon, .el-range__icon
          display: none
        .el-range-input
          width: 45%
    div[slot="header"]
      margin-bottom: 1.5rem
    .el-radio-group
      text-align: center;
      width: 100%
</style>
