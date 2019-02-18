<template lang="html">
  <div class="form-item">
    <template v-if="field.type == 'raw'">
      <span>{{field.value}}</span>
    </template>
    <template v-if="field.type == 'enum'">
      <span>{{field.value}}</span>
    </template>
    <template v-else-if="field.type == 'image'">
      <image-viewer :src="fieldValue">
      </image-viewer>
    </template>
    <template v-else-if="field.type == 'text-list'">
      <ul class="text-list">
        <li v-for="item in this.field.value" :key="item">{{item}}</li>
      </ul>
    </template>
    <template v-else-if="['text', 'password', 'textarea'].indexOf(field.type) != -1">
      <el-input
        :type="field.type"
        :value="fieldValue"
        @input="handleValueChange"
        @blur="handleInputBlur"
        :row="field.type == 'textarea' ? (field.rows || 4) : 1"
        :disabled="field.disabled"
        :placeholder="field.placeholder">
      </el-input>
    </template>
    <template v-else-if="field.type == 'dropdown'">
      <cf-select
        :value="fieldValue"
        @input="handleValueChange"
        :entry="field"
        :extend="extend"
        :placeholder="field.placeholder || '全部'">
      </cf-select>
    </template>
    <template v-else-if="field.type == 'switch'">
      <el-switch
        :value="fieldValue"
        @input="handleValueChange"
        active-value="field.options.on.value"
        inactive-value="field.options.off.value"
        active-text="field.options.on.text"
        inactive-text="field.options.off.text"
        :placeholder="field.placeholder || '全部'">
      </el-switch>
    </template>
    <template v-else-if="['date', 'datetime', 'daterange', 'datetimerange'].indexOf(field.type) != -1">
      <el-date-picker
        v-model="fieldValue"
        @input="handleValueChange"
        :type="field.type"
        :placeholder="field.placeholder || '选择日期'"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :pickerOptions="getDatePickerOptions(field.options)"
        :format="field.format"
        :disabled="field.disabled"
        :clearable="false">
      </el-date-picker>
    </template>
    <template v-else-if="field.type == 'checkbox-group'">
      <cf-checkbox-group
        :value="fieldValue"
        @input="handleValueChange"
        :entry="field"
        :extend="extend"
        :origin="origin">
      </cf-checkbox-group>
    </template>
    <template v-else-if="field.type == 'radio-group'">
      <cf-radio-group
        :value="fieldValue"
        @input="handleValueChange"
        :entry="field"
        :extend="extend"
        :origin="origin">
      </cf-radio-group>
    </template>
    <template v-else-if="field.type == 'color'">
      <cf-color-picker
        :value="fieldValue"
        @input="handleValueChange"
        :extend="extend"
        :entry="field">
      </cf-color-picker>
    </template>
    <template v-else-if="custom">
      <component
        :is="field.options.componentName"
        :value="fieldValue"
        @input="handleValueChange"
        :entry="field"
        :extend="extend">
      </component>
    </template>
  </div>
</template>
<script>
import Helper from '../helper'
import Config from '../config'

export default {
  name: 'FormItem',

  props: {
    value: {
      required: true,
    },
    field: {
      type: Object,
      required: true,
    },
    origin: {
      type: String,
      required: true,
    },
    extend: {
      type: Object,
      default() {
        return {}
      },
    },
  },

  data() {
    let fieldValue = this.field.value
    if (!fieldValue) {
      if (this.field.type == 'daterange') {
        fieldValue = this.$helper.getDateRange(this.field.defaultValue || 'week', this.field.options.notIncludeToday ? 1 : 0)
      }
    }
    // if (!fieldValue && ['daterange', 'datetimerange'].indexOf(this.field.type) == -1) {
    //   fieldValue = this.field.defaultValue
    // }
    if (['text', 'password', 'textarea'].indexOf(this.field.type) != -1 && Array.isArray(fieldValue)) {
      fieldValue = fieldValue.join(',')
    }
    return {
      fieldValue,
    }
  },

  watch: {
    value(value) {
      if (['text', 'password', 'textarea'].indexOf(this.field.type) != -1 && Array.isArray(value)) {
        value = value.join(',')
      }
      this.fieldValue = value
    }
  },

  methods: {
    getDatePickerOptions(options) {
      const pickerOptions = {
        shortcuts: ['today', 'yesterday', 'week', 'twoWeek', 'month', 'year'],
      }

      if (options && options.disabledDate && typeof options.disabledDate) {
        pickerOptions.disabledDate = this.getDatePickerDisableDate(options.disabledDate, options.disabledDateFilter)
        if (!pickerOptions.disabledDate) {
          delete pickerOptions.disabledDate
        }
      }

      if (options && options.shortcuts) {
        if (!Array.isArray(pickerOptions.shortcuts)) {
          pickerOptions.shortcuts = []
        }
      }
      const notIncludeToday = options.notIncludeToday ? 1 : 0
      pickerOptions.shortcuts = pickerOptions.shortcuts.map(shortcut => ({
        text: Config.daterangeShortcuts[shortcut] || '',
        onClick(picker) {
          picker.$emit('pick', Helper.getDateRange(shortcut, notIncludeToday))
        },
      }))

      return pickerOptions
    },

    handleValueChange(val) {
      if (Helper.isUndef(val)) return
      if (val === null) val = ''
      let v = val
      if (this.field.type === 'date') {
        v = Helper.formatDate(val, this.field.format)
      }
      if (this.field.type === 'daterange' || this.field.type === 'datetimerange') {
        if (v[0] && v[1]) {
          v = [
            Helper.formatDate(v[0], this.field.format, this.field.dataType),
            Helper.formatDate(v[1], this.field.format, this.field.dataType),
          ]
        }
        this.field.value = v
      }

      if (!Array.isArray(v)) {
        switch (this.field.dataType) {
          case 'number':
            if (Object.prototype.toString.call(v) === '[object Date]') {
              v = v.getTime()
            } else if (v) {
              v = Number(v)
            }
            if (isNaN(v)) {
              console.error('表单值转换number类型失败', val, this.field)
            }
            break
          case 'boolean':
            v = v === 'true' || v === 'True' || v === true
            break
          case 'string':
            if (Object.prototype.toString.call(v) === '[object Date]') {
              v = Helper.formatDate(v, this.field.format)
            }
            break
          default:
            break
        }
      }

      this.$emit('input', v)

      // 有引用字段
      if (this.field.options.ref) {
        // 设置了引用属性后，由控件自主触发引用变更
        if (!this.field.options.refProp) {
          this.emitRefValueChange(this.field.options.ref, v)
        }
      }

      // 是否立即执行 搜索
      if (this.field.options.immediate) {
        if (this.field.type == 'dropdown') {
          this.$emit('fieldChangeDoSearch', this.field.options.data.filter(p => p.value == v)[0])
        }
      } else if (this.field.type == 'table-column-hidden') { // 针对 popover 控制列，单独处理
        this.$emit('fieldChangeDoSearch', {
          columnFields: val,
        }, false)
      }
    },

    emitRefValueChange(ref, val) {
      this.$emit('syncRefValueChange', ref, val, this.origin, this.extend)
    },

    handleInputBlur() {
      if (this.field.options.blur) {
        /* eslint-disable no-new-func */
        const fn = new Function('value', 'field', this.field.options.blur).bind(this)
        fn(this.field.value, this.field)
        /* eslint-enable no-new-func */
      }
    },


    getDatePickerDisableDate(opt, filter) {
      // let disabledDate
      if (opt === 'beforeToday') {
        return time => time.getTime() < Date.now()
      }
      if (opt == 'afterToday') {
        return time => time.getTime() >= Date.now()
      }
      if (opt == 'custom' && filter) {
        /* eslint-disable no-new-func */
        return new Function('time', filter)
        /* eslint-enable no-new-func */
      }
    },
  },
}
</script>
<style lang="stylus" scoped>
.form-item
  display: inline-block;
</style>
