<template lang="html">
  <div class="echarts" :style="{width, height}"></div>
</template>

<script>
import echarts from 'echarts/lib/echarts'
import 'echarts/lib/chart/bar'
import 'echarts/lib/chart/line'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import debounce from '@flyme/utils/src/helper/debounce'

export default {
  name: 'VueEchart',
  props: {
    options: {
      type: Object,
      default() {
        return {}
      },
    },
    width: {
      type: String,
      default: '100%',
    },
    height: {
      type: String,
      default: '400px',
    }
  },

  watch: {
    options: {
      handler(options) {
        if (this.echart) this.echart.dispose()
        this.echart = echarts.init(this.$el, 'light', 'canvas')
        this.echart.clear()
        this.echart.setOption(options)
        this.__resizeHanlder = debounce(() => {
          this.echart.resize()
        }, 200, { leading: true })
      },
      deep: true,
    },
  },

  data() {
    return {
      echart: null,

    }
  },

  created() {},
  mounted() {
    this.echart = echarts.init(this.$el, 'light', 'canvas')
    this.echart.clear()
    this.echart.setOption(this.options)
    this.__resizeHanlder = debounce(() => {
      this.echart.resize()
    }, 200, { leading: true })
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.__resizeHanlder)
    this.echart.dispose() // 销毁ehcart实例
  }
}
</script>

<style lang="stylus">
</style>
