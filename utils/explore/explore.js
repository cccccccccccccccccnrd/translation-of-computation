const BASE_URL = 'https://translation-of-computation.com'

const app = new Vue({
  el: '#app',
  data: {
    group: '',
    clientId: '',
    dataset: [],
    labelsCreated: [],
    entry: ''
  },
  computed: {
    labels: function () {
      return [...new Set(this.dataset.map(entry => entry.data.label))]
    },
    clients: function () {
      return [...new Set(this.dataset.map(entry => entry.client))]
    }
  },
  methods: {
    get: function () {
      fetch(`${ BASE_URL }/dataset?group=${ this.group }&client=${ this.clientId }`)
        .then(res => res.json())
        .then(data => {
          if (data.hasOwnProperty('errors')) {
            this.clientId = ''
            this.dataset = []
            return
          }

          this.dataset = data
        })
      
      fetch(`${ BASE_URL }/labels?group=${ this.group }&client=${ this.clientId }`)
      .then(res => res.json())
      .then(data => {
        if (data.hasOwnProperty('errors')) {
          this.labelsCreated = []
          return
        }

        this.labelsCreated = data.map(entry => entry.data.label)
      })

      this.entry = ''
    }
  }
})