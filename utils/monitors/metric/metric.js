const BASE_URL = 'https://translation-of-computation.com'
const WS_URL = 'wss://translation-of-computation.com/ws'
const socket = new WebSocket(WS_URL)

const app = new Vue({
  el: '#app',
  data: {
    groups: ['test', 'turk'],
    datasets: {
      test: [],
      turk: []
    },
    labels: {
      test: [],
      turk: []
    },
    prediction: true,
    updating: false
  },
  created: async function () {
    socket.addEventListener('message', message => {
      const msg = JSON.parse(message.data)

      console.log(msg)
      if (msg.do === 'update-dataset') this.fetchDataset(msg.group)
      if (msg.do === 'update-labels') this.fetchLabels(msg.group)
      /* if (msg.do === 'update-model' && this.groups.indexOf(msg.group) != -1) this.init() */
    })

    for (group of this.groups) {
      this.fetchDataset(group)
      this.fetchLabels(group)
    }
  },
  methods: {
    fetchDataset: async function (group) {
      return await fetch(`${ BASE_URL }/dataset?group=${ group }`)
        .then(res => res.json())
        .then(data => {
          this.datasets[group] = data
        })
    },
    fetchLabels: async function (group) {
      return await fetch(`${ BASE_URL }/labels?group=${ group }`)
        .then(res => res.json())
        .then(data => {
          this.labels[group] = data.map(entry => entry.data.label)
        })
    }
  }
})