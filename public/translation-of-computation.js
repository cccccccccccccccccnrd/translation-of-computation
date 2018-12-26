const socket = new WebSocket('wss://cnrd.computer/toc-ws')
let model

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
    ui: {
      invalid: false,
      hide: true,
      rgb: '',
      selectedLabel: '',
      entryInfo: null,
      showDataset: false
    }
  },
  created: async function () {
    this.setColor()

    socket.addEventListener('message', message => {
      const msg = JSON.parse(message.data)

      if (msg.do === 'update') this.update(msg.label)
    })

    const now = new Date()
    const day = now.getDate() - 1
    const month = now.getMonth() + 1
    const year = now.getFullYear()

    model = await tf.loadModel(`https://cnrd.computer/toc/models/model-${ day }-${ month }-${ year }/model.json`)
  },
  computed: {
    rgb: function () {
      return `${ this.color.r }, ${ this.color.g }, ${ this.color.b }`
    },
    background: function () {
      return `rgb(${ this.color.r }, ${ this.color.g }, ${ this.color.b })`
    },
    datasetBackground: function (index) {
      console.log(index)
      console.log(this.dataset[0])
      return `rgb(${ this.dataset[index].data.color.r }, ${ this.dataset[index].data.color.g }, ${ this.dataset[index].data.color.b })`
    }
  },
  methods: {
    setColor: function () {
      const r = Math.floor(Math.random() * 255)
      const g = Math.floor(Math.random() * 255)
      const b = Math.floor(Math.random() * 255)
    
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
        do: 'insert',
        data: {
          label: label,
          color: this.color
        },
        client: this.client
      }
    
      socket.send(JSON.stringify(msg))

      this.setColor()
      this.fetch()
    },
    validation: function () {
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
    hide: function () {
      this.ui.hide = true
    },
    predict: async function () {
        const values = this.ui.rgb.split(',').map(value => Number.parseInt(value) / 255)
        const xs = tf.tensor2d([values])
        
        const prediction = model.predict(xs)
        const index = await prediction.argMax(1).data()
        
        const labels = ['violet', 'blue', 'green', 'yellow', 'orange', 'red']
        this.label = labels[index[0]]

        tf.dispose(xs)
    },
    fetch: function () {
      if (!this.ui.selectedLabel) return

      fetch(`https://cnrd.computer/toc/dataset/label/${ this.ui.selectedLabel }`)
        .then(res => res.json())
        .then(data => {
          this.dataset = data
          this.ui.entryInfo = null
        })
    },
    info: function (item) {
      this.ui.entryInfo = item
    },
    toggleDataset: function () {
      this.ui.showDataset = !this.ui.showDataset
    },
    update: function (label) {
      if (!this.ui.selectedLabel) return

      if (this.ui.selectedLabel === label) {
        console.log('ima update')
        fetch(`https://cnrd.computer/toc/dataset/label/${ this.ui.selectedLabel }`)
          .then(res => res.json())
          .then(data => {
            this.dataset = data
          })
      }

    },
  }
})