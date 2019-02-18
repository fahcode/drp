<template lang="html">
  <div class="user_role_wrapper" v-loading="loading.page">
    <el-form>
      <el-form-item label="角色" label-width="90px">
        <el-checkbox v-for="role in roles" :key="role.id" v-model="role.grant">{{role.name}}</el-checkbox>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'UserRoleScreen',

  data() {
    return {
      userId: this.$route.query.id,
      roles: [],
      loading: {
        page: false,
      },
    }
  },

  created() {
    this.loadRoles()
    window.addEventListener('message', ( event ) => {
      if (event.data.type == 'iframe-submit') {
        this.save()
      }
    }, false );
  },

  methods: {
    async loadRoles() {
      this.loading.page = true
      try {
        const res = await this.$request.get('/manage/auth/user/role', {
          params: {userId: this.userId},
        })
        if (this.$helper.checkRequestResultMessage(this, res)) {
          this.roles = res.value
        }
      } catch(e) { console.log(e) }
      this.loading.page = false
    },

    async save() {
      this.loading.page = true
      try {
        const res = await this.$request.post('/manage/auth/user/role/update', this.$helper.filterEmptyParams({
          userId: this.userId,
          roleIds: this.roles.filter(p => p.grant).map(p => p.id),
        }))
        if (this.$helper.checkRequestResultMessage(this, res)) {
          parent.postMessage({type: 'iframe-success'}, '*')
        }
      } catch(e) { console.log(e) }
      this.loading.page = false
    },
  },
}
</script>

<style lang="stylus">
</style>
