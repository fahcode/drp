const helper = {
  isPureObject(val) {
    return Object.prototype.toString.call(val) === '[object Object]'
  },

  isString(val) {
    return typeof val === 'string'
  },

  isUndef(val) {
    return typeof val === 'undefined'
  },

  isEmptyValue(val) {
    let r = false

    if (Array.isArray(val)) {
      val.forEach((v) => {
        if (!v) r = true
      })
    } else if (!val) {
      r = true
    }

    return r
  },

  getDateRange(type = 'week') {
    const end = new Date()
    const start = new Date()
    const day = 3600 * 1000 * 24

    switch (type) {
      case 'month':
        start.setTime(start.getTime() - (day * 30))
        break
      case 'year':
        start.setTime(start.getTime() - (day * 365))
        break
      case 'week':
      default:
        start.setTime(start.getTime() - (day * 7))
        break
    }

    return [start, end]
  },

  getDate(type = 'today') {
    const date = new Date()
    const day = 3600 * 1000 * 24

    switch (type) {
      case 'yesterday':
        date.setTime(date.getTime() - day)
        break
      case 'last_week':
        date.setDate(date.getDate() - 7)
        break
      case 'last_month':
        date.setMonth(date.getMonth() - 1)
        break
      case 'today':
      case 'this_week':
      case 'this_month':
      default:
        break
    }

    return date
  },

  /* eslint-disable no-param-reassign */
  formatDate(source, format = 'yyyy-MM-dd') {
    let date = new Date()
    if (typeof source === 'string') format = source
    if (typeof source === 'number') date = new Date(source)
    if (typeof source === 'object') date = source

    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const miniute = date.getMinutes()
    const second = date.getSeconds()
    return format.replace('yyyy', year)
                  .replace('MM', month)
                  .replace('dd', day)
                  .replace('HH', hour)
                  .replace('mm', miniute)
                  .replace('ss', second)
                  .replace(/\b\d{1}\b/g, '0$&')
  },
  /* eslint-enable no-param-reassign */

  convertMapToArray(source, labelName = 'label', valueName = 'value') {
    return Object.keys(source)
                  .map(prop => ({
                    [labelName]: source[prop],
                    [valueName]: prop,
                  }))
  },

  /* eslint-disable no-param-reassign */
  correct(source, target) {
    Object.keys(source).forEach((prop) => {
      if (helper.isUndef(target[prop])) {
        target[prop] = source[prop]
      } else if (helper.isPureObject(target[prop])) {
        helper.correct(source[prop], target[prop])
      }
    })
  },
  /* eslint-enable no-param-reassign */

  makeParams(params, data = {}) {
    let result = {}

    if (helper.isPureObject(params)) {
      result = params
    } else if (Array.isArray(params)) {
      params.forEach((param) => {
        if (typeof param === 'string') {
          result[param] = data[param]
        } else if (helper.isPureObject(param)) {
          if ('value' in param) {
            result[param.name] = data[param.value]
          } else if ('raw' in param) {
            result[param.name] = param.raw
          }
        }
      })
    }

    return result
  },

  handleResponse(res, sucFn, errFn) {
    if (res.code === 200) {
      sucFn()
    } else {
      errFn()
    }
  },

  /* eslint-disable no-param-reassign */
  assign(target, ...args) {
    args.forEach((arg) => {
      Object.keys(arg).forEach((prop) => {
        if (typeof arg[prop] === 'object') {
          if (Array.isArray(arg[prop])) {
            target[prop] = [].concat([], arg[prop])
          } else if (helper.isPureObject(arg[prop])) {
            target[prop] = Object.assign({}, arg[prop])
          } else {
            target[prop] = arg[prop]
          }
        } else {
          target[prop] = arg[prop]
        }
      })
    })
    return target
  },
  /* eslint-enable no-param-reassign */
}

export default helper
