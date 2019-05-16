import './styles.scss'
import moment from 'moment'
import midwest from './data/midwest.json'

function initMap() {
  return new google.maps.Map(document.getElementById('map'), {
    center: { lat: 42.61291, lng: -88.0402219 },
    zoom: 9
  })
}

let date = '2019-05-17'
// let mockNow = ``
let mockNow = `2019-05-18T12:04:50-05:00`

const legIndices = [
  // leg 1
  {
    distance: 2,
    start: 3,
    projected: 4,
    actual: 5
  },
  // leg 2
  {
    distance: 6,
    start: 7,
    projected: 8,
    actual: 9
  },
  // leg 3
  {
    distance: 10,
    start: 12,
    projected: 13,
    actual: 14
  }
]

const images = [
  '/hawley.8e67240a.jpg',
  '/hawley.8e67240a.jpg',
  '/hawley.8e67240a.jpg',
  '/hawley.8e67240a.jpg',
  '/hawley.8e67240a.jpg',
  '/hawley.8e67240a.jpg',
  '/hawley.8e67240a.jpg',
  '/hawley.8e67240a.jpg',
  '/hawley.8e67240a.jpg',
  '/hawley.8e67240a.jpg',
  '/hawley.8e67240a.jpg',
  '/hawley.8e67240a.jpg',
  '/hawley.8e67240a.jpg',
  '/hawley.8e67240a.jpg',
  '/hawley.8e67240a.jpg',
  '/hawley.8e67240a.jpg',
  '/hawley.8e67240a.jpg',
  '/hawley.8e67240a.jpg',
  '/hawley.8e67240a.jpg',
  '/hawley.8e67240a.jpg',
  '/hawley.8e67240a.jpg',
  '/hawley.8e67240a.jpg',
  '/hawley.8e67240a.jpg',
  '/hawley.8e67240a.jpg',
  '/hawley.8e67240a.jpg',
  '/hawley.8e67240a.jpg',
  '/hawley.8e67240a.jpg',
  '/hawley.8e67240a.jpg',
  '/hawley.8e67240a.jpg',
  '/hawley.8e67240a.jpg',
  '/hawley.8e67240a.jpg',
  '/hawley.8e67240a.jpg',
  '/hawley.8e67240a.jpg',
  '/hawley.8e67240a.jpg',
  '/hawley.8e67240a.jpg',
  '/hawley.8e67240a.jpg'
]

const formatSheetTime = time => {
  return `${date}T${moment(time, 'hh:mm:ss a').format('HH:mm:ss')}-05:00`
}

const formatPace = decimal => {
  let minutes = decimal % 1 * 60
  return `${Math.floor(decimal)}:${minutes.toString().length === 1 ? '00' : minutes}`
}

const setLeg = function (indices, sheet) {
  return sheet.values.map(r => {
    let leg = {
      runner: r[0],
      pace: r[1],
      formattedPace: formatPace(r[1]),
      distance: r[indices.distance],
      start: formatSheetTime(r[indices.start])
    }

    // increment the day if it has flipped, this is jank as fuck
    // http://www.reactiongifs.com/r/whid1.gif
    if (r[indices.start].indexOf('PM') >= 0 && r[indices.projected].indexOf('AM') >= 0) {
      date = '2019-05-18'
    }

    leg.isActual = !!r[indices.actual]
    leg.finish = r[indices.actual] ? formatSheetTime(r[indices.actual]) : formatSheetTime(r[indices.projected])

    return leg
  })
}

const card = Vue.component('card', {
  props: [
    'leg'
  ],
  methods: {
    toggle: function () {
      this.open = !this.open
    },
    getOnlyTime: function (dateTime) {
      return moment(dateTime).format('h:mm:ss A')
    },
    goToStart: function (leg) {
      this.$root.goToStart(leg)
    }
  },
  data: function () {
    return {
      open: false
    }
  },
  computed: {
    reallyOpen: function () {
      return (this.open || this.$root.currentLeg.id === this.leg.id || this.$root.nextLeg.id === this.leg.id)
    },
    getGoogleLink: function () {
      return `https://maps.google.com/maps/search/?api=1&query=${this.leg.mapData.start_point.lat},${this.leg.mapData.start_point.long}`
    }
  }
})

var app = new Vue({
  el: '#app',
  components: {
    card
  },
  data: {
    courseDrawn: false,
    map: undefined,
    current: moment(),
    startTime: '06:30:00',
    legs: [],
    mapOpen: false
  },
  created () {
    setInterval(() => {
      date = '2019-05-17'
      this.current = moment()
      let state = this
      fetch('https://sheets.googleapis.com/v4/spreadsheets/1BZi6E1iPDVFPzowFPNIMXizi1DCrFuF0FYcDeLZ8RRs/values/Sheet1!B2:Q13?key=AIzaSyBIAuNXg5viSRY2d8-dnD6pssHxLQ-07Ew')
        .then(response => response.json())
        .then(data => {
          state.startTime = '0' + data.values[0][3].replace(' AM', '')
          state.legs = setLeg(legIndices[0], data)
            .concat(setLeg(legIndices[1], data))
            .concat(setLeg(legIndices[2], data))
            .map((r, index) => {
              r.id = midwest[index].id
              r.mapData = midwest[index]
              r.image = images[index]
              return r
            })
          // state.drawEntireCourse()
        })
        .catch(error => console.log(error))
    }, 1000)
  },
  methods: {
    goToStart: function (leg) {
      this.mapOpen = true
      if (!this.map) {
        this.map = initMap()
      }
      this.drawEntireCourse()
      let start = this.getLegStartLocation(leg)
      let coord = {
        lat: parseFloat(start.lat),
        lng: parseFloat(start.long)
      }
      this.map.setZoom(12)
      this.map.setCenter(new google.maps.LatLng(coord))
    },
    getLegStartLocation: function (leg) {
      return {
        lat: leg.mapData.start_point.lat,
        long: leg.mapData.start_point.long
      }
    },
    drawEntireCourse: function () {
      if (!this.courseDrawn) {

        let allPoints = this.legs.map(l =>
          l.mapData.points.map(p => ({
            lat: parseFloat(p.lat),
            lng: parseFloat(p.lon)
          }))
        )

        let state = this

        allPoints.forEach(function (pointArray, index) {

          var marker = new google.maps.Marker({
            position: pointArray[0],
            map: state.map,
            icon: 'http://maps.google.com/mapfiles/kml/paddle/wht-blank-lv.png',
            label: {
              text: 'Leg ' + (index + 1),
              color: '#000000',
              fontSize: '16px',
              fontWeight: 'bold'
            }
          })

          marker.setMap(state.map)

          var flightPath = new google.maps.Polyline({
            path: pointArray,
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2
          })
        
          flightPath.setMap(state.map)
        })

        this.courseDrawn = true
      }
    },
    getLegClass: function (id) {
      if (this.currentLeg && id === this.currentLeg.id) {
        return 'current-runner'
      } else if (this.nextLeg && id === this.nextLeg.id) {
        return 'next-runner'
      } else if (this.nextLeg && id > this.nextLeg.id) {
        return 'upcoming-runner'
      }
      return 'previous-runner'
    },
    getOnlyTime: function (dateTime) {
      return moment(dateTime).format('h:mm:ss A')
    }
  },
  computed: {
    now: function () {
      return mockNow ? moment(mockNow) : this.current
    },
    startDateTime: function () {
      return moment(`2019-05-17T${this.startTime}-05:00`)
    },
    stopwatch: function () {
      return this.now.diff(this.startDateTime)
    },
    formattedStopwatch: function () {
      let duration = moment.duration(this.stopwatch)
      return `${Math.floor(duration.asHours())}:${duration.minutes() < 10 ? 0 : ''}${duration.minutes()}:${duration.seconds() < 10 ? 0 : ''}${duration.seconds()}`
    },
    formattedStartTime: function () {
      return this.startDateTime.format('MMMM Do YYYY, h:mm:ss A')
    },
    currentLeg: function () {
      return this.legs.filter(l => moment(l.start) <= this.now && this.now < moment(l.finish))[0]
    },
    nextLeg: function () {
      return this.legs.filter(l => moment(l.start) > this.now)[0]
    },
    lastLeg: function () {
      return this.legs[this.legs.length - 1]
    },
    totalDistance: function () {
      return this.legs.reduce((acc, current) => acc + parseFloat(current.distance), 0)
    },
    currentDistance: function () {
      let completedLegs = this.legs.filter(l => moment(l.finish) < this.now)
      if (completedLegs.length === 36)  {
        return this.totalDistance
      } else {
        return completedLegs.reduce((acc, current) => acc + parseFloat(current.distance), 0)
      }
    },
    progress: function () {
      return Math.floor((this.currentDistance / this.totalDistance) * 100)
    },
    road: function () {
      return `width: calc(${this.progress}% - 40px)`
    }
  }
})
