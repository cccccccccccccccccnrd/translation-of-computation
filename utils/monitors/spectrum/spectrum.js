const BASE_URL = 'https://translation-of-computation.com'
const WS_URL = 'wss://translation-of-computation.com/ws'
const socket = new WebSocket(WS_URL)

const app = new Vue({
  el: '#app',
  data: {
    groups: ['kisd', 'turk'],
    spectrum: [],
    models: {},
    labels: {},
    left: [],
    right: [],
    prediction: true,
    updating: false
  },
  created: async function () {
    this.spectrum = this.getSpectrum(200)

    socket.addEventListener('message', message => {
      const msg = JSON.parse(message.data)

      console.log(msg)
      if (msg.do === 'update-model' && this.groups.indexOf(msg.group) != -1) this.init()
    })

    if (this.prediction) {
      this.init()
    }
  },
  methods: {
    getSpectrum: function (steps) {
      const iteration = Math.floor(steps / 6)
      const step = Math.floor(255 / iteration)
    
      let r = 255
      let g = 0
      let b = 0
    
      let spectrum = []
    
      for (let i = 0; i < steps; i++) {
        if (i < iteration) {
          g = g + step
        } else if (i < iteration * 2) {
          r = r - step
        } else if (i < iteration * 3) {
          b = b + step
        } else if (i < iteration * 4) {
          g = g - step
        } else if (i < iteration * 5) {
          r = r + step
        } else if (i < iteration * 6) {
          b = b - step
        }
    
        spectrum.push({ r, g, b })
      }
    
      return spectrum
    },
    getRandomSpectrum: function (steps) {
      const iteration = Math.floor(steps / 6)

      let spectrum = []

      for (let i = 0; i < steps; i++) {
        const r = Math.floor(Math.random() * 0)
        const g = Math.floor(Math.random() * 100)
        const b = Math.floor(Math.random() * 250)

        spectrum.push({ r, g, b })
      }
    
      return spectrum
    },
    init: async function () {
      console.log('initin')

      this.updating = true

      this.left = []
      this.right = []

      this.groups.forEach(async (group) => {
        const model = await this.getModel(group)

        this.models[group] = model.model
        this.labels[group] = model.labels

        this.spectrum.forEach(async (color, index) => {
          index = index + 5
          if (index % 8 === 0) { /* 200 steps / 25 wanted labels */
            const prediction = await this.predict(group, [color.r, color.g, color.b])
            /* console.log([color.r, color.g, color.b], prediction, group) */
            if (group === this.groups[0]) {
              this.left.push(prediction)
            } else {
              this.right.push(prediction)
            }
          }
        })
        
        setTimeout(() => {
          this.updating = false
        }, 2000)
      })
    },
    getModel: async function (group) {
      let timestamp

      const model = await fetch(`${ BASE_URL }/model?group=${ group }&time=latest`)
        .then(res => res.json())
        .then(async (data) => {
          if (data.hasOwnProperty('errors')) {
            return console.warn('no trained model found')
          }

          timestamp = data.timestamp
          return await tf.loadModel(`${ BASE_URL }/archive/models/${ group }/${ timestamp }/model.json`)
        })
      
      const labels = await fetch(`${ BASE_URL }/labels?group=${ group }`)
        .then(res => res.json())
        .then(data => {
          return data.filter(entry => entry.timestamp <= timestamp).map(entry => entry.data.label)
        })

      return { model, labels }
    },
    predict: async function (group, color) {
      const values = color.map(value => Number.parseInt(value) / 255)
      const xs = tf.tensor2d([values])
      
      const prediction = this.models[group].predict(xs)
      const index = await prediction.argMax(1).data()
      
      tf.dispose(xs)
      return this.labels[group][index[0]]
    }
  }
})