const BASE_URL = 'https://translation-of-computation.com'

const app = new Vue({
  el: '#app',
  data: {
    ui: {
      group: '',
      clientId: ''
    },
    dataset: ''
  },
  computed: {

  },
  methods: {
    get: function () {
      fetch(`${ BASE_URL }/dataset?group=${ this.ui.group }&client=${ this.ui.clientId }`)
        .then(res => res.json())
        .then(data => {
          this.dataset = data
        })
    }
  }
})