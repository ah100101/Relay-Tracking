import './styles.scss'
import moment from 'moment'

var app = new Vue({
  el: '#app',
  data: {
    now: moment(),
    startTime: moment('2019-04-10T06:30:00-05:00')
  },
  created () {
    setInterval(() => {
      this.now = moment()
    }, 1000)
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
    }
  }
})
