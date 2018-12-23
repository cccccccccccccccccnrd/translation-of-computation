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
    inputs: {
      invalid: false,
      hide: true,
      rgb: ''
    }
  },
  created: async function () {
    this.setColor()
    model = await tf.loadModel('https://cnrd.computer/toc/model/model.json')
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
      const r = Math.floor(Math.random() * 255)
      const g = Math.floor(Math.random() * 255)
      const b = Math.floor(Math.random() * 255)
    
      this.color = {
        r: r,
        g: g,
        b: b
      }

      this.inputs.invalid = false
      this.inputs.rgb = `${ this.color.r }, ${ this.color.g }, ${ this.color.b }`
    },
    sendColor: function (label) {
      const msg = {
        data: {
          label: label,
          color: this.color
        },
        client: this.client
      }
    
      socket.send(JSON.stringify(msg))
      this.setColor()
    },
    validation: function () {
      const values = this.inputs.rgb.split(',').map(value => Number.parseInt(value))

      if (values[0]) this.color.r = Number.parseInt(values[0])
      if (values[1]) this.color.g = Number.parseInt(values[1])
      if (values[2]) this.color.b = Number.parseInt(values[2])

      console.log(values)
      if (values.length !== 3) {
        this.inputs.invalid = true
        this.inputs.hide = true
        return
      } else if (values.some(e => isNaN(e))) { 
        this.inputs.invalid = true
        this.inputs.hide = true
        return
      } else if (values.some(e => e < 0 || e > 255)) {
        this.inputs.invalid = true
        this.inputs.hide = true
        return
      } else {
        this.inputs.invalid = false
        this.inputs.hide = false
        this.predict()
      }

      console.log(this.color)
    },
    hide: function () {
      this.inputs.hide = true
    },
    predict: async function () {
      const values = this.inputs.rgb.split(',').map(value => Number.parseInt(value) / 255)
      const xs = tf.tensor2d([values])
      
      const prediction = model.predict(xs)
      const index = await prediction.argMax(1).data()
      
      const labels = ['violet', 'blue', 'green', 'yellow', 'orange', 'red', 'pink', 'brown', 'grey']
      
      this.label = labels[index[0]]
    }
  }
})