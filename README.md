# Watch position globaly with JS using [Navigator.geolocation](https://developer.mozilla.org/pt-BR/docs/Web/API/Navigator/geolocation).

You can use this in yours Vue or Cordovova projects.

## How to use:

Install with npm or clone the project

> npm install gbgelado/watch-position-gps --save

```
import Position from 'watch-position-gps'
window.Position = new Position()
```


## Start watching position

```
window.Position.watch()
```
> Do not stop tracking the position even if the page is reloaded.
> Imports are saved in localStorage


## Stop watching

```
window.Position.watch()
```


## Get history

```
window.Position.getHistory()
return Object as [{"lat":-23.5791608,"lng":-46.8955197},{"lat":-23.5791523,"lng":-46.895524300000004}, ...}]
```

## Get the current position

```
window.Position.getCurrentPosition().then((position){
  console.log(position)
  // Object {lat: -23.579131, lng: -48.7954888, timestamp: 1494712194526}
},
function(error){
  console.log(error)
})
```
> position returns a Object with lat, lng and timestamp

## You can pass your resourse (vue-resorse | $http or $axios) as argument

```
window.Position = new Position($http)
```


## Others functions


```
window.Position.isRunning()
window.Position.tail()
window.Position.tailStop()
window.Position.getLog()
window.Position.getHistory()
window.Position.stop()
window.Position.getCurrentPosition()
window.Position.watch()
window.Position.save()
```


## If you're using cordova.plugins.backgroundMode [(see here)](https://github.com/katzer/cordova-plugin-background-mode)


To start background tracking
```
window.Position.initBackgroud()
```


To stop background tracking
```
window.Position.stopBackgroud()
```

To get brackgroundMode status

```
window.Position.backgroundStatus()
```

***Note:*** If the plugin is not installed, these methods are ignored.

> This is done automatically when the 'watch' and 'stop' methods are called. So do not worry about it.