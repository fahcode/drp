<template>
  <el-select
    v-model="choice"
    :loading="loading"
    :multiple="entry.options.multiple"
    :filterable="entry.options.filterable"
    :clearable="entry.options.clearable"
    :remote="entry.options.remote"
    :remote-method="queryItems"
    :filter-method="queryItems"
    :disabled="entry.disabled"
    :placeholder="entry.placeholder"
    @change="changeValue">
    <el-option
      v-for="(item, i) in items"
      :key="i + '-' + item.value"
      :label="item.name"
      :value="item.value">
    </el-option>
  </el-select>
</template>

<script>
import request from '../request'
import Helper from '../helper'

export default {
  name: 'CfSelect',

  props: {
    value: {
      required: true,
    },

    entry: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      choice: this.value,
      items: (this.entry.options.items || []).slice(0, 100),
      allItems: this.entry.options.items || [],
      loading: this.entry.options.remote,
    }
  },

  mounted() {
    // 本地搜索，则先获取全部数据
    if (this.entry.options.remote && !this.entry.options.param) {
      this.requestData()
    }
  },
  
  watch: {
    value(val) {
      this.choice = val
    }
  },

  methods: {
    changeValue(val) {
      this.choice = val
      this.$emit('input', val)

      let labels = Array(val.length).fill(),
          idx = -1;
      this.items.map(it => {
        idx = val.indexOf(it.value);
        if(idx>-1) labels[idx] = it.name;
      })
      // 判断当前的值是否是清空，是则使用再上一级的关键字
      labels.length<1 && this.entry.parentLabels && (labels = labels.concat(this.entry.parentLabels));
      this.entry.childName && this.$bus.$emit('groupInput', {val: val, labels: labels, childName: this.entry.childName})
    },

    requestData(params = {}) {
      this.loading = true
      request({
        url: this.entry.options.url,
        method: this.entry.options.method,
        params,
      }).then((res) => {
        this.loading = false
        Helper.handleResponse(res, () => {
          if (this.entry.options.filter) {
            /* eslint-disable no-new-func */
            const fn = new Function('res', this.entry.options.filter)
            /* eslint-enable no-new-func */
            this.allItems = fn(res)
          } else {
            this.allItems = res.value.data
          }
          this.items = this.allItems.slice(0, 100)
        }, () => {
          this.$message({
            type: 'error',
            message: '获取搜索输入数据出现异常',
          })
        })
      })
    },

    queryItems(query) {
        if (query) {
            if ( !isNaN(Number(query)) ) {
                // 通过value来搜索
                this.items = this.allItems.filter(p => p.value==query).slice(0, 100)
            } else if(typeof query === 'string') {
				if (this.entry.options.param) {
                    const params = {
                        [this.entry.options.param]: query,
                    }
                    this.requestData(params)
                } else {
                    this.items = this.allItems
                        .filter(
                            p => p.name
                            .toLowerCase()
                            .indexOf(query.toLowerCase()) > -1
                        ).slice(0, 100)
                }
            }
        } else {
            this.items = this.allItems.slice(0, 100)
        }
    }
  },
}
</script>
