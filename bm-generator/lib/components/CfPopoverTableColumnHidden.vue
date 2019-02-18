<template>
  <div class="popover-table-column-hidden">
    <el-popover
      ref="popover"
      placement="bottom"
      width="600"
      trigger="click">
      <el-form label-width="120px">
        <el-checkbox-group
          v-model="selected"
          :min="1"
          @change="handleChange">
          <el-form-item :label="key"
            :key="key"
            v-for="(value, key) in entry.options.data">
            <el-checkbox v-for="column in value"
              :label="column.field"
              :style="{width: '120px'}"
              :disabled="entry.options.limit > 0 && selected.length >= entry.options.limit && selected.indexOf(column.field) == -1"
              :key="column.field">
                {{column.title.replace(/\(.*\)/g, '')}}
            </el-checkbox>
          </el-form-item>
          <p class="limit-message" v-if="entry.options.limit > 0">最多只可选择{{ entry.options.limit }}个指标</p>
        </el-checkbox-group>
      </el-form>
    </el-popover>
    <el-button type="text" v-popover:popover>更多指标</el-button>
  </div>
</template>

<script>
export default {
  name: 'CfPopoverTableColumnHidden',

  props: {
    value: {
      type: Array,
      default() {
        return []
      },
    },

    entry: {
      type: Object,
      default() {
        return {}
      },
    },
  },

  data() {
    return {
      selected: this.value, // 默认
    }
  },

  watch: {
    value(val) {
      this.selected = val
    },
  },

  computed: {
  },

  methods: {
    handleChange(val) {
      this.$emit('input', val)
    },
  }
}
</script>
<style lang="stylus">
.el-popover
  .limit-message
    color: #c73b3b
    font-size 12px
    text-align center
</style>
