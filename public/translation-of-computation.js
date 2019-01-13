const socket = new WebSocket('wss://cnrd.computer/toc-ws')
let model, labels

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
      showWriting: true,
      showAddLabel: false
    }
  },
  created: async function () {
    this.setColor()
    this.fetchLabels()
    this.fetchWriting()

    socket.addEventListener('message', message => {
      const msg = JSON.parse(message.data)

      if (msg.do === 'update-dataset') this.update(msg.label)
      if (msg.do === 'update-labels') this.fetchLabels()
    })

    const now = new Date()
    const day = now.getDate() - 1
    const month = now.getMonth() + 1
    const year = now.getFullYear()

    model = await tf.loadModel(`https://cnrd.computer/toc/models/${ day }-${ month }-${ year }/model.json`)
    
    fetch(`https://cnrd.computer/toc/labels/${ day }-${ month }-${ year }.json`)
      .then(res => res.json())
      .then(data => {
        labels = data
      })
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
        client: this.client
      }
    
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(msg))
      } else {
        console.log('closed?')
      }

      this.setColor()
      this.updateDataset(label)
    },
    sendMissingLabel: function () {
      const msg = {
        do: 'insert-label',
        data: {
          label: this.ui.missingLabel,
        },
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
        this.predict()
      }
    },
    validationMissingLabel: function () {
      if (this.labels.indexOf(this.ui.missingLabel) !== -1) {
        this.ui.showAddLabel = false
      } else if (/\d/.test(this.ui.missingLabel)) {
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

      fetch(`https://cnrd.computer/toc/dataset/label/${ this.ui.selectedLabel }`)
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
        fetch(`https://cnrd.computer/toc/dataset/label/${ this.ui.selectedLabel }`)
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
      fetch(`https://cnrd.computer/toc/writing.json`)
        .then(res => res.json())
        .then(data => {
          this.writing = data
        })
    },
    fetchLabels: function () {
      fetch(`https://cnrd.computer/toc/dataset/labels`)
        .then(res => res.json())
        .then(data => {
          this.labels = data.map(entry => entry.data.label)
        })
    }
  }
})