<template>
  <main>
    <app-header></app-header>
    <div class="main-router-view">
      <router-view></router-view>
    </div>
  </main>
</template>

<script>
import AppHeader from './AppHeader'

export default {
  name: 'AppContent',

  components: {
    AppHeader,
  },

  data() {
    return {
    }
  },
}
</script>

<style lang="stylus">
  main
    display flex
    flex 1
    flex-direction column
    overflow-y auto
    overflow-x hidden
    .main-router-view
      flex 1
      padding 2rem
      background-color #eef1f5
      overflow auto
</style>
