import './styles.scss'
import moment from 'moment'

let date = '2019-05-17'
// let mockNow = ``
let mockNow = `2019-05-17T06:31:00-05:00`

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

    // increment the day if it has flipped
    if (r[indices.start].indexOf('PM') >= 0 && r[indices.projected].indexOf('AM') >= 0) {
      date = '2019-05-18'
    }

    leg.isActual = !!r[indices.actual]
    leg.finish = r[indices.actual] ? formatSheetTime(r[indices.actual]) : formatSheetTime(r[indices.projected])

    return leg
  })
}

var app = new Vue({
  el: '#app',
  data: {
    current: moment(),
    startTime: '06:30:00',
    firstLeg: [],
    secondLeg: [],
    thirdLeg: []
  },
  created () {
    setInterval(() => {
      this.current = moment()
    }, 1000)
    let state = this
    fetch('https://sheets.googleapis.com/v4/spreadsheets/1BZi6E1iPDVFPzowFPNIMXizi1DCrFuF0FYcDeLZ8RRs/values/Sheet1!B2:Q13?key=AIzaSyBIAuNXg5viSRY2d8-dnD6pssHxLQ-07Ew')
      .then(response => response.json())
      .then(data => {
        state.startTime = '0' + data.values[0][3].replace(' AM', '')
        state.firstLeg = setLeg(legIndices[0], data)
        state.secondLeg = setLeg(legIndices[1], data)
        state.thirdLeg = setLeg(legIndices[2], data)
      })
      .catch(error => console.log(error))
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
      return `${Math.floor(duration.asHours())} :
        ${duration.minutes() < 10 ? 0 : ''}${duration.minutes()} :
        ${duration.seconds() < 10 ? 0 : ''}${duration.seconds()}`
    },
    formattedStartTime: function () {
      return this.startDateTime.format('MMMM Do YYYY, h:mm:ss A')
    },
    legs: function () {
      return this.firstLeg.concat(this.secondLeg).concat(this.thirdLeg)
    },
    currentLeg: function () {
      return this.legs.filter(l => moment(l.start) <= this.now && this.now < moment(l.finish))[0]
    },
    nextLeg: function () {
      return this.legs.filter(l => moment(l.start) > this.now)[0]
    },
    previousLeg: function () {
      return this.legs.filter(l => moment(l.start) < this.now)[0]
    }
  }
})
