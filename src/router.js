import Vue from 'vue'
import VueRouter from 'vue-router'
// import NotFound from './screens/NotFoundScreen'
// import PermissionDenyScreen from './screens/PermissionDenyScreen'
// import Factory from '../bm-generator/lib/export/FactoryScreen'
// import Generator from '../bm-generator/lib/export/GeneratorScreen'
// import TableColumnScreen from './screens/TableColumnScreen'
// import RoleResourcesScreen from './screens/RoleResourcesScreen'
// import HomePage from './screens/HomePage'
// import RoleSetting from './pages/role/RoleSetting'
// import RoleParamsSetting from './pages/role/RoleParamsSetting'
// import PushMailConfig from './pages/PushMailConfig'
// import ExportPage from './pages/ExportPage'
// import SponsorPushmail from './pages/SponsorPushmail'
// import ResourceScreen from './screens/ResourceScreen'
// import { allPermissionTree } from './store/state'

Vue.use(VueRouter)

export default new VueRouter({
  routes: [
    {
      name: 'homepage',
      path: '/',
      // component: Generator,
      // redirect: '/generator/client_statistic',
      // 控制默认访问的 url
      beforeEnter(to, from, next) {
        Vue.Bus.$on('setDefaultUrl', (url) => {
          if (url) {
            next(url)
          } else {
            next('permission_deny')
          }
        })
      },
    },
    {
      name: 'home',
      path: '/home',
      component: () => import( /* webpackChunkName: "HomeScreen" */ './screens/HomeScreen'),
    },
    {
      name: 'real_time_trend',
      path: '/real_time_trend',
      // meta: { '__fullscreen': 1},
      component: () => import( /*webpackChunkName: "RealTimeTrendScreen" */ './screens/RealTimeTrendScreen' )
    },
    {
      name: 'resource',
      path: '/resource',
      // component: ResourceScreen, // 该组件中使用了同一个router的动态组件，导致报错，具体原因待查
      component: () => import( /* webpackChunkName: "ResourceScreen" */ './screens/ResourceScreen'),
    },
    {
      name: 'role_resource',
      path: '/role_resource',
      component: () => import( /* webpackChunkName: "RoleResourcesScreen" */ './screens/RoleResourcesScreen'),
    },
    {
      name: 'user_role',
      path: '/user_role',
      component: () => import( /* webpackChunkName: "UserRoleScreen" */ './screens/UserRoleScreen'),
    },
    {
      name: 'login_user',
      path: '/login_user',
      component: () => import( /* webpackChunkName: "UserRoleScreen" */ './screens/LoginUserScreen'),
    },
    {
      name: 'factory',
      path: '/(factory|setting)/:code?',
      component: () => import( /* webpackChunkName: "FactoryScreen" */ '../bm-generator/lib/export/FactoryScreen'),
    },
    {
      name: 'generator',
      path: '/(generator|page)/:code?',
      component: () => import( /* webpackChunkName: "GeneratorScreen" */ '../bm-generator/lib/export/GeneratorScreen'),
    },
    {
      name: 'column',
      path: '/column',
      component: () => import( /* webpackChunkName: "TableColumnScreen" */ './screens/TableColumnScreen'),
    },
    {
      name: 'not_found',
      path: '/404',
      component: () => import( /* webpackChunkName: "NotFoundScreen" */ './screens/NotFoundScreen'),
    },
    {
      name: 'permission_deny',
      path: '/401',
      component: () => import( /* webpackChunkName: "PermissionDenyScreen" */ './screens/PermissionDenyScreen'),
    },
    {
      path: '*',
      redirect: '/404',
    },
  ],
})
