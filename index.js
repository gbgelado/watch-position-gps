export default class Position {
  constructor ($http, postUrl) {
    this.postUrl = (postUrl) ? postUrl : '/api'
    this.$http = $http
    this.geo = {}
    this.tracking = []
    this.currentPosition = {}
    this.tailInterval
    this.cordova
    this.options = {
      timeout: 10000,
      enableHighAccuracy: true
    }
    if (this.isRunning()) this.watch()

    const vm = this
    document.addEventListener('deviceready', () => {
      this.cordova = cordova.plugins.backgroundMode
    }, false)
  }
  backgroundStatus () {
    return this.cordova.isActive()
  }
  initBackgroud () {
    if (this.cordova === undefined) return false
    return this.cordova.enable()
  }
  stopBackgroud () {
    if (this.cordova === undefined) return false
    return this.cordova.disable()
  }
  isRunning () {
    let track = window.localStorage.getItem('trackPosition')
    if (track === 'true') return true
    return false
  }
  tail () {
    const vm = this
    vm.getLog()
    this.tailInterval = setInterval(() => {
      vm.getLog()
    }, 5000)
  }
  tailStop () {
    clearInterval(this.tailInterval)
  }
  getLog () {
    const trackHistory = this.getLocal('trackHistory')
    const obj = {
      trackHistory: trackHistory,
      totalTracks: (trackHistory === null) ? 0 : trackHistory.length,
      isActive: this.getLocal('trackPosition'),
      errors: this.getLocal('error_log')
    }
    console.log(obj)
    return obj
  }
  incrementLocal (key, value) {
    let local = this.getLocal(key)
    let data = (local === null) ? [] : local

    if (typeof data === 'object') {
      data.push(value)
      this.setLocal(key, data)
      return this.getLocal(key)
    }
    return null
  }
  setLocal (key, value) {
    let data = JSON.stringify(value)
    return window.localStorage.setItem(key, data)
  }
  getLocal (key) {
    let data = window.localStorage.getItem(key)
    return JSON.parse(data)
  }
  removeLocal (key) {
    window.localStorage.removeItem(key)
  }
  setStatus (status) {
    this.setLocal('trackPosition', status)
  }
  getHistory () {
    let history = this.getLocal('trackHistory')
    return (history === null) ? [] : history
  }
  setHistory (tracking) {
    return this.incrementLocal('trackHistory', tracking)
  }
  addPosition (pos) {
    if (!this.isRunning()) {
      this.stop()
      return false
    }
    if (this.tracking.length > 0) {
      this.tracking.push(pos)
    }
    else {
      this.tracking = pos
    }
    this.setHistory(this.tracking)
    return this.save(pos)
  }
  reset (item) {
    if (this[item]) this[item] = []
  }
  stop () {
    this.setStatus(false)
    this.reset('tracking')
    this.removeLocal('trackHistory')
    navigator.geolocation.clearWatch(this.geo)
    this.stopBackgroud()
  }
  getCurrentPosition () {
    const vm = this
    let counter = 0
    vm.reset('currentPosition')
    vm.searchCurrentPosition()

    let promise = new Promise((resolve, reject) => {
      const interval = window.setInterval(() => {
        if (counter < (vm.options.timeout / 1000)) {
          if (Object.keys(vm.currentPosition).length > 0) {
            const r = vm.currentPosition
            clearInterval(interval)
            resolve(r)
          }
        }
        else {
          clearInterval(interval)
          reject('currentPosition timeout')
          return false
        }
        counter++
      }, 500)
    })

    return promise
  }
  setCurrentPosition (pos) {
    this.currentPosition = pos
  }
  searchCurrentPosition () {
    const vm = this
    window.navigator.geolocation.getCurrentPosition(position => {
      let pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        timestamp: Date.now()
      }
      vm.setCurrentPosition(pos)
    },
    err => {
      const message = {
        message: 'ERROR(' + err.code + '): ' + err.message,
        timestamp: Date.now()
      }
      this.incrementLocal('error_log', message)
    },
    this.options)
  }
  watch () {
    const vm = this
    this.removeLocal('error_log')
    this.initBackgroud()
    this.setStatus(true)
    const timestamp = Date.now()
    this.geo = window.navigator.geolocation.watchPosition(
      (position) => {
        let pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: timestamp
        }
        vm.addPosition(pos)
      },
      (err) => {
        const message = {
          message: 'ERROR(' + err.code + '): ' + err.message,
          timestamp: timestamp
        }
        this.incrementLocal('error_log', message)
      },
      this.options
    )
  }
  save (pos) {
    this.$http.post(this.postUrl, pos)
      .then(response => {
        console.log(response)
      })
      .catch(e => {
        console.log(e)
      })
  }
}
