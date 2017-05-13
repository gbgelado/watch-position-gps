class Position {
  constructor ($http) {
    this.$http = $http
    this.geo = {}
    this.tracking = []
    this.currentPosition = {}
    this.tailInterval
    this.options = {
      timeout: 10000,
      enableHighAccuracy: true
    }
    if (this.isRunning()) this.watch()
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
    navigator.geolocation.clearWatch(this.geo)
    this.reset('tracking')
    this.setStatus(false)
    this.removeLocal('trackHistory')
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
    this.geo = window.navigator.geolocation.watchPosition(
      (position) => {
        vm.setStatus(true)
        let pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: position.coords.timestamp
        }
        vm.addPosition(pos)
      },
      (err) => {
        const message = {
          message: 'ERROR(' + err.code + '): ' + err.message,
          timestamp: Date.now()
        }
        this.incrementLocal('error_log', message)
      },
      this.options
    )
  }
  save (pos) {
    const item = pos
    this.$http.post('api/', item)
        .then(response => {
          console.log(response)
        })
        .catch(e => {
          console.log(e)
        })
  }
}

export { Position }
