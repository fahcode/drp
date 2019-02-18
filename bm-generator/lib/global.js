import Vue from 'vue'
import Helper from './helper'
import request from './request'
import bus from './bus'
// import RichTextEditor from './components/RichTextEditor'
// import ImageViewer from './components/ImageViewer'
// import CfCheckboxGroup from './components/CfCheckboxGroup'
// import CfNavs from './components/CfNavs'
// import CfButton from './components/CfButton'
// import CfSelect from './components/CfSelect'
// import CfCascader from './components/CfCascader'
// import CfSearchInput from './components/CfSearchInput'
// import CfAutocomplete from './components/CfAutocomplete'
// import CfAutocompleteItem from './components/CfAutocompleteItem'
// import CfSimpTree from './components/CfSimpTree'
// import CfUpload from './components/CfUpload'
// import TmplComponent from './components/TmplComponent'
// import CustomComponent from './components/CustomComponent'
// import CfPopoverTableColumnHidden from './components/CfPopoverTableColumnHidden'
// import CfRadioGroup from './components/CfRadioGroup'
// import CfColorPicker from './components/CfColorPicker'

export default {
  installComponents() {
    Vue.component('ImageViewer', () => import( /* webpackChunkName: "ImageViewer" */ './components/ImageViewer'))
    // Vue.component('RichTextEditor', () => import( /* webpackChunkName: "RichTextEditor" */ './components/RichTextEditor'))
    Vue.component('CfNavs', () => import( /* webpackChunkName: "CfNavs" */ './components/CfNavs'))
    Vue.component('CfButton', () => import( /* webpackChunkName: "CfButton" */ './components/CfButton'))
    Vue.component('CfSelect', () => import( /* webpackChunkName: "CfSelect" */ './components/CfSelect'))
    Vue.component('CfCheckboxGroup', () => import( /* webpackChunkName: "CfCheckboxGroup" */ './components/CfCheckboxGroup'))
    Vue.component('CfCascader', () => import( /* webpackChunkName: "CfCascader" */ './components/CfCascader'))
    Vue.component('CfSearchInput', () => import( /* webpackChunkName: "CfSearchInput" */ './components/CfSearchInput'))
    // Vue.component('CfAutocomplete', () => import( /* webpackChunkName: "CfAutocomplete" */ './components/CfAutocomplete'))
    // Vue.component('CfAutocompleteItem', () => import( /* webpackChunkName: "CfAutocompleteItem" */ './components/CfAutocompleteItem'))
    Vue.component('CfUpload', () => import( /* webpackChunkName: "CfUpload" */ './components/CfUpload'))
    // Vue.component('CfSimpTree', () => import('./components/CfSimpTree'))
    Vue.component('TmplComponent', () => import( /* webpackChunkName: "TmplComponent" */ './components/TmplComponent'))
    Vue.component('CustomComponent', () => import( /* webpackChunkName: "CustomComponent" */ './components/CustomComponent'))
    Vue.component('CfPopoverTableColumnHidden', () => import( /* webpackChunkName: "CfPopoverTableColumnHidden" */ './components/CfPopoverTableColumnHidden'))
    Vue.component('CfRadioGroup', () => import( /* webpackChunkName: "CfRadioGroup" */ './components/CfRadioGroup'))
    Vue.component('CfColorPicker', () => import( /* webpackChunkName: "CfColorPicker" */ './components/CfColorPicker'))
    Vue.component('FormItem', () => import( /* webpackChunkName: "FormItem" */ './components/FormItem'))
  },

  /* eslint-disable no-shadow */
  /* eslint-disable no-param-reassign */
  installPlugins() {
    return {
      install(Vue) {
        Vue.Util = Vue.prototype.$util = Helper
        Vue.Helper = Vue.prototype.$helper = Helper
        Vue.Request = Vue.prototype.$request = request
        Vue.Bus = Vue.prototype.$bus = bus
      },
    }
  },
  /* eslint-enable no-shadow */
  /* eslint-enable no-param-reassign */
}
