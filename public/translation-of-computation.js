let model, labels

const BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://translation-of-computation.com'
const WS_URL = window.location.hostname === 'localhost' ? 'ws://localhost:5001' : 'wss://translation-of-computation.com/ws'
const socket = new WebSocket(WS_URL)

const app = new Vue({
  el: '#app',
  data: {
    label: '',
    color: {
      r: 0,
      g: 0,
      b: 0
    },
    client: Math.random().toString(16).slice(2),
    group: window.location.pathname.replace(/\//g, ''),
    dataset: null,
    labels: null,
    writing: null,
    ui: {
      invalid: false,
      hide: true,
      rgb: '',
      selectedLabel: '',
      missingLabel: '',
      entryInfo: null,
      showDataset: false,
      showWriting: false,
      showAddLabel: false
    },
    prediction: true,
    amount: 50,
    count: 0
  },
  created: async function () {
    this.setColor()
    this.fetchLabels()
    /* this.fetchWriting() */

    socket.addEventListener('message', message => {
      const msg = JSON.parse(message.data)

      if (msg.group != this.group) return

      if (msg.do === 'update-dataset') this.updateDataset(msg.label)
      if (msg.do === 'update-labels') this.fetchLabels()
    })

    if (this.prediction) {
      fetch(`${ BASE_URL }/model?group=${ this.group }&time=latest`)
      .then(res => res.json())
      .then(async (data) => {
        if (data.hasOwnProperty('errors')) {
          return console.error('no trained model found')
        }

        const timestamp = data.timestamp
        model = await tf.loadModel(`${ BASE_URL }/archive/models/${ this.group }/${ timestamp }/model.json`)

        fetch(`${ BASE_URL }/labels?group=${ this.group }`)
        .then(res => res.json())
        .then(data => {
          labels = data.filter(entry => entry.timestamp <= timestamp).map(entry => entry.data.label)
        })
      })
    }
  },
  computed: {
    rgb: function () {
      return `${ this.color.r }, ${ this.color.g }, ${ this.color.b }`
    },
    background: function () {
      return `rgb(${ this.color.r }, ${ this.color.g }, ${ this.color.b })`
    }
  },
  methods: {
    setColor: function () {
      const r = Math.floor(Math.random() * 256)
      const g = Math.floor(Math.random() * 256)
      const b = Math.floor(Math.random() * 256)
    
      this.color = {
        r: r,
        g: g,
        b: b
      }

      this.ui.invalid = false
      this.ui.rgb = `${ this.color.r }, ${ this.color.g }, ${ this.color.b }`
    },
    sendColor: function (label) {
      if (this.ui.invalid) {
        this.setColor()
        return
      }

      const msg = {
        do: 'insert-color',
        data: {
          label: label,
          color: this.color
        },
        group: this.group,
        client: this.client
      }
    
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(msg))
      } else {
        throw 'closed?'
      }

      this.count++
      this.setColor()
      this.updateDataset(label)
    },
    sendMissingLabel: function () {
      const msg = {
        do: 'insert-label',
        data: {
          label: this.ui.missingLabel,
        },
        group: this.group,
        client: this.client
      }

      socket.send(JSON.stringify(msg))

      this.ui.missingLabel = ''
      this.fetchLabels()
    },
    validationColor: function () {
      const values = this.ui.rgb.split(',').map(value => Number.parseInt(value))

      if (values[0] || values[0] === 0) this.color.r = values[0]
      if (values[1] || values[1] === 0) this.color.g = values[1]
      if (values[2] || values[2] === 0) this.color.b = values[2]

      if (values.length !== 3) {
        this.ui.invalid = true
        this.ui.hide = true
        return
      } else if (values.some(e => isNaN(e))) { 
        this.ui.invalid = true
        this.ui.hide = true
        return
      } else if (values.some(e => e < 0 || e > 255)) {
        this.ui.invalid = true
        this.ui.hide = true
        return
      } else {
        this.ui.invalid = false
        this.ui.hide = false
        if (this.prediction) this.predict()
      }
    },
    validationMissingLabel: function () {
      if (this.ui.missingLabel === '') {
        this.ui.showAddLabel = false
      } else if (this.labels.indexOf(this.ui.missingLabel) !== -1) {
        this.ui.showAddLabel = false
      } else if (/\d/.test(this.ui.missingLabel) || /(?!-)\W/.test(this.ui.missingLabel) || /\W$/.test(this.ui.missingLabel)) {
        this.ui.showAddLabel = false
      } else {
        this.ui.showAddLabel = true
      }
    },
    hideMissingLabel: function () {
      if (this.ui.missingLabel === '') this.ui.showAddLabel = false
    },
    predict: async function () {
        const values = this.ui.rgb.split(',').map(value => Number.parseInt(value) / 255)
        const xs = tf.tensor2d([values])
        
        const prediction = model.predict(xs)
        const index = await prediction.argMax(1).data()
        
        this.label = labels[index[0]]

        tf.dispose(xs)
    },
    fetchDataset: function () {
      if (!this.ui.showDataset) return

      fetch(`${ BASE_URL }/dataset?group=${ this.group }&label=${ this.ui.selectedLabel }`)
        .then(res => res.json())
        .then(data => {
          if (data.errors) {
            this.dataset = null
            this.ui.entryInfo = 'no entries yet'
            return
          }

          this.dataset = data
          this.ui.entryInfo = null
        })
    },
    updateDataset: function (label) {
      if (!this.ui.showDataset) return
      
      if (this.ui.selectedLabel === label) {
        fetch(`${ BASE_URL }/dataset?group=${ this.group }&label=${ this.ui.selectedLabel }`)
          .then(res => res.json())
          .then(data => {
            this.dataset = data
          })
      }
    },
    toggleDataset: function () {
      this.ui.showDataset = !this.ui.showDataset
    },
    info: function (item) {
      this.ui.entryInfo = item
    },
    hide: function () {
      this.ui.hide = true
    },
    toggleWriting: function () {
      this.ui.showWriting = !this.ui.showWriting
    },
    fetchWriting: function () {
      fetch('writing.json')
        .then(res => res.json())
        .then(data => {
          this.writing = data
        })
    },
    fetchLabels: function () {
      fetch(`${ BASE_URL }/labels?group=${ this.group }`)
        .then(res => res.json())
        .then(data => {
          if (data.hasOwnProperty('errors')) {
            labels = []
            this.labels = []
            return
          }

          this.labels = data.map(entry => entry.data.label).sort(() => 0.5 - Math.random())
        })
    }
  }
})