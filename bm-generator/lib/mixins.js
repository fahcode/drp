import OffsetManage from '@flyme/utils/lib/domUtils/OffsetManage'
import throttle from '@flyme/utils/lib/helper/throttle'


const tableHeaderFixMixin = {
  mounted() {
    this.routerViewEl = document.querySelector('.main-router-view')
    if (this.routerViewEl) {
      this.scrollFn = throttle(() => {
        if (this.tableHeader) {
          const top = parseInt(this.tableHeader.dataset.top)
          if (this.routerViewEl.scrollTop > top) {
            this.tableHeader.classList.add('fixed-table-header')
            this.tableHeader.style.width = this.tableHeader.parentNode.offsetWidth + 'px'
          } else {
            this.tableHeader.classList.remove('fixed-table-header')
            this.tableHeader.style.width = '100%'
          }
        }
      }, 90)
      this.routerViewEl.addEventListener('scroll', this.scrollFn)
      this.$nextTick(() => {
        this.initStickyTableHeader()
      })
    }

  },

  beforeDestroy() {
    this.routerViewEl.removeEventListener('scroll', this.scrollFn)
  },

  methods: {
    // 初始化datatable的header的sticky
    initStickyTableHeader() {
      this.tableHeader = document.querySelector('.el-table__header-wrapper')
      if (this.tableHeader) {
        this.tableHeader.dataset.top = OffsetManage.top(this.tableHeader)
      }
    },
  },
}

export { tableHeaderFixMixin }
