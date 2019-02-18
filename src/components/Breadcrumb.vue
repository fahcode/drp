<template lang="html">
  <div class="breadcrumb-wrapper">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item v-for="item in breadcrumb" :key="item">{{item}}</el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Breadcrumb',

  computed: {
    ...mapState(['breadcrumb']),
  },

}
</script>

<style lang="stylus">
.breadcrumb-wrapper
  margin-bottom 1.8rem
</style>
