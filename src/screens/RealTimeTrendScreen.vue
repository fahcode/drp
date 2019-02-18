<template>
  <div class="trend-wrapper">
    <el-card class="box-card">
      <div class="trend-head">
        <div class="trend-title" :class="[totalExposeChart.changeRatio <= 0.7 || totalCostChart.changeRatio <= 0.7 ? 'back-red' : '']">
          <span class="title-left">广告平台实时监控系统</span>
          <span class="title-center" v-show="totalExposeChart.changeRatio <= 0.7 || totalCostChart.changeRatio <= 0.7">
            实时数据：{{changeRatioTip}}
          </span>
        </div>
        <el-row type="flex" justify="space-between">
          <el-col class="left">环比上周同期曝光变化 
            <span :class="[totalExposeChart.changeRatio >= 1 ? 'font-red' : 'font-green']">
              {{totalExposeChangeRatio}}
            </span>
          </el-col>
          <el-col class="right">环比上周同期消耗变化 
            <span :class="[totalCostChart.changeRatio >= 1 ? 'font-red' : 'font-green']">
              {{totalCostChangeRatio}}
            </span>
          </el-col>
        </el-row>
      </div>
      <vue-echart :options="totalExposeChart.chartOptions" v-loading="loading.totalExpose"></vue-echart>
      <vue-echart :options="totalCostChart.chartOptions" v-loading="loading.totalCost"></vue-echart>
    </el-card> 
    <el-card class="box-card">
      <div class="trend-head">
        <!-- <div class="trend-title" :class="[totalExposeChart.changeRatio <= 0.7 || totalCostChart.changeRatio <= 0.7 ? 'back-red' : '']">
          <span class="title-left">广告平台实时监控系统-各媒体消耗</span>
          <span class="title-center" v-show="totalExposeChart.changeRatio <= 0.7 || totalCostChart.changeRatio <= 0.7">
            实时数据：{{changeRatioTip}}
          </span>
        </div> -->
        <div class="trend-title">
          <span class="title-left">广告平台实时监控系统-各媒体消耗</span>
        </div>
      </div>
      <div class="medias-echart-group">
        <div class="medias-echart" v-for="(mediaOption, idx) in mediasChartOptions" :key="idx">
          <vue-echart :options="mediaOption" ></vue-echart>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import Config from '../../bm-generator/lib/config'

export default {
  name: 'RealTimeTrendScreen',
  
  data() {
    const legend = {
      trendType: {lastWeek: '上周', yesterday: '昨日', today: '今日'},
    }
    return {
      indictor: {},
      loading: {
        indictor: false,
        totalExpose: false,
        totalCost: false,
      },
      totalExposeChart: {
        daterangeField: {
          type: 'daterange',
        },
        chartOptions: this.$helper.assign({}, Config.chartOptions, {
          tooltip: {
            show: false,
          },
          legend: {
            dataMaps: legend.trendType,
            data: Object.values(legend.trendType),
          },
          title: {
            text: '曝光',
            left: '20%',
          },
          yAxis: {
            type: 'value',
            axisLabel: {
              show: false
            }
          },
        }),
        changeRatio: 1
      },
      totalCostChart: {
        daterangeField: {
          type: 'daterange',
        },
        chartOptions: this.$helper.assign({}, Config.chartOptions, {
          tooltip: {
            show: false,
          },
          legend: {
            dataMaps: legend.trendType,
            data: Object.values(legend.trendType),
          },
          title: {
            text: '消耗',
            left: '20%',
          },
          yAxis: {
            type: 'value',
            axisLabel: {
              show: false
            }
          },
        }),
        changeRatio: 1
      },
      mediasChartOptions: [],
      legendData: Object.values(legend.trendType),
      intervalId: 0,
    }
  },

  computed: {
    totalExposeChangeRatio() {
      return this.totalExposeChart.changeRatio >= 1 ? 
              `+ ${ parseInt((this.totalExposeChart.changeRatio - 1) * 100) }%` : 
              `- ${ parseInt((1 - this.totalExposeChart.changeRatio) * 100) }%`
    },
    totalCostChangeRatio() {
      return this.totalCostChart.changeRatio >= 1 ? 
              `+ ${ parseInt((this.totalCostChart.changeRatio - 1) * 100) }%` : 
              `- ${ parseInt((1 - this.totalCostChart.changeRatio) * 100) }%`
    },
    changeRatioTip() {
      let exposeTip = this.totalExposeChart.changeRatio <= 0.7 ? `曝光量环比上周下降 ${ parseInt((1 - this.totalExposeChart.changeRatio) * 100) }%` : ''
      let costTip = this.totalCostChart.changeRatio <= 0.7 ? `消耗量环比上周下降 ${ parseInt((1 - this.totalCostChart.changeRatio) * 100) }%` : ''
      if(exposeTip && costTip) exposeTip += ', '
      return exposeTip + costTip
    }
  },

  mounted() {
    this.loadTotalData()
    this.loadMediaData()
    this.intervalId = setInterval( () => {
      this.loadTotalData()
      this.loadMediaData()
    }, 1000*60*30)
  },

  methods: {
    async loadTotalData() {
      this.loading.totalExpose = true
      this.loading.totalCost = true
      try {
        const res = await this.$request('/trendData/all', {
          params: {}
        })
        if(this.$helper.checkRequestResultMessage(this, res)) {
          const dateArr = Object.keys(res.value).sort((p1, p2) => (p1 > p2 ? 1 : -1))
          const exposeChartOptions = this.totalExposeChart.chartOptions
          const exposeLegend = this.totalExposeChart.chartOptions.legend
          exposeChartOptions.xAxis.data = Object.keys(res.value[dateArr[1]]).sort((p1, p2) => (p1 > p2 ? 1 : -1))
          exposeChartOptions.series = Object.keys(exposeLegend.dataMaps).map((key, idx) => {
            let dateObj = res.value[dateArr[idx]]
            let dateKeys = Object.keys(dateObj).sort((p1, p2) => (p1 > p2 ? 1 : -1))
            return {
              type: 'line',
              name: exposeLegend.dataMaps[key],
              smooth: true,
              areaStyle: {},
              data: dateKeys.map(item => {
                return dateObj[item].exposeCount
              }),
            }
          })
          const todayExpose = exposeChartOptions.series[2].data
          const lastWeekExpose = exposeChartOptions.series[0].data
          const exposeChangeRatio = todayExpose.length > 1 ? (todayExpose[todayExpose.length - 2] / lastWeekExpose[todayExpose.length - 2]).toFixed(2) : 1
          this.totalExposeChart.changeRatio = exposeChangeRatio 
          this.loading.totalExpose = false

          const costChartOptions = this.totalCostChart.chartOptions
          const costLegend = this.totalCostChart.chartOptions.legend
          this.totalCostChart.chartOptions.xAxis.data = Object.keys(res.value[dateArr[1]]).sort((p1, p2) => (p1 > p2 ? 1 : -1))
          costChartOptions.series = Object.keys(costLegend.dataMaps).map((key, idx) => {
            let dateObj = res.value[dateArr[idx]]
            let dateKeys = Object.keys(dateObj).sort((p1, p2) => (p1 > p2 ? 1 : -1))
            return {
              type: 'line',
              name: costLegend.dataMaps[key],
              smooth: true,
              areaStyle: {},
              data: dateKeys.map(item => {
                return dateObj[item].totalCost
              }),
            }
          })
          const todayCost = costChartOptions.series[2].data
          const lastWeekCost = costChartOptions.series[0].data
          const costChangeRatio = todayExpose.length > 1 ? (todayCost[todayExpose.length - 2] / lastWeekCost[todayExpose.length - 2]).toFixed(2) : 1
          this.totalCostChart.changeRatio = costChangeRatio 
          this.loading.totalCost = false
        }
      } catch(e) { console.log(e) }
    },
    async loadMediaData() {
      try {
        const res = await this.$request('/trendData/media', {
          params: {}
        })
        if(this.$helper.checkRequestResultMessage(this, res)) {
          const medias =  Object.keys(res.value)
          this.mediasChartOptions = medias.map( media => {
            const mediaData = res.value[media]
            const xAxisData = Object.keys(Object.values(mediaData)[0])
            return this.$helper.assign({}, Config.chartOptions, {
              tooltip: {
                show: false,
              },
              title: {
                text: media,
                top: 20,
                textStyle: {
                  fontSize: 16
                }
              },
              xAxis: {
                type: 'category',
                data: xAxisData,
              },
              yAxis: {
                type: 'value',
                axisLabel: {
                  show: false
                }
              },
              legend: {
                data: this.legendData,
              },
              series: this.legendData.map((item, index) =>  {
                return {
                  name: item,
                  type: 'line',
                  smooth: true,
                  areaStyle: {},
                  data: xAxisData.map((list) => {
                    const mediaArr = Object.values(mediaData)[index]
                    if(mediaArr && mediaArr.hasOwnProperty(list)){
                      const obj = mediaArr[list]
                      if(obj) return mediaArr[list].totalCost
                    }
                  })
                }
              }),
            })
          })
        }
      } catch(e) { console.log(e) }
    },
    clearIntervalId() {
      if(this.intervalId) {
        clearInterval(this.intervalId)
        this.intervalId = 0
      }
    }
  },

  watch: {
  },

  beforeDestroy() {
     this.clearIntervalId()
  }
}
</script>

<style lang="stylus">
.trend-wrapper
  .medias-echart-group
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    .medias-echart
      width: 23%;
  .trend-head
    padding: 0 150px;
    font-size: 18px;
    font-weight: bold;
    .trend-title
      position: relative;
      height: 50px;
      .title-left
        position: absolute;
        left: 0;
        top: 50%;
        transform: translate(0, -50%);
      .title-center
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        font-size: 14px;
        color: #fff;
    .right
      text-align: right;
    .font-red
      color: red;
    .font-green
      color: green;
    .back-red
      background: red;
</style>