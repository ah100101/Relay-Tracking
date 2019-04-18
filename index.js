import './styles.scss'
import moment from 'moment'

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
    start: 11,
    projected: 12,
    actual: 13
  }
]

const setLeg = (indices, sheet) => {
  // todo: set leg
}

var app = new Vue({
  el: '#app',
  data: {
    now: moment(),
    startTime: moment('2019-04-10T06:30:00-05:00'),
    firstLeg: [],
    secondLeg: [],
    thirdLeg: []
  },
  created () {
    setInterval(() => {
      this.now = moment()
    }, 1000)
    let state = this
    fetch('https://sheets.googleapis.com/v4/spreadsheets/1BZi6E1iPDVFPzowFPNIMXizi1DCrFuF0FYcDeLZ8RRs/values/Sheet1!B2:P13?key=AIzaSyBIAuNXg5viSRY2d8-dnD6pssHxLQ-07Ew')
      .then(response => response.json())
      .then(data => {
        state.firstLeg = setLeg(legIndices[0], data)
        state.secondLeg = setLeg(legIndices[1], data)
        state.thirdLeg = setLeg(legIndices[2], data)
      })
      .catch(error => console.log(error))
  },
  computed: {
    stopwatch: function () {
      return this.now.diff(this.startTime)
    },
    formattedStopwatch: function () {
      let duration = moment.duration(this.stopwatch)
      return `${Math.floor(duration.asHours())} :
        ${duration.minutes() < 10 ? 0 : ''}${duration.minutes()} :
        ${duration.seconds() < 10 ? 0 : ''}${duration.seconds()}`
    },
    formattedStartTime: function () {
      return this.startTime.format('MMMM Do YYYY, h:mm:ss A')
    },
    legs: function () {
      return this.firstLeg.concat(this.secondLeg).concat(this.thirdLeg)
    }
  }
})
