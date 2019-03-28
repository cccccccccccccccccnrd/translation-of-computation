const BASE_URL = 'https://translation-of-computation.com'

const app = new Vue({
  el: '#app',
  data: {
    dataset: [],
    offset: -20
  },
  mounted: function () {
    this.scroll()
  },
  computed: {
  },
  methods: {
    scroll: function () {
      const height = this.$refs.text.clientHeight
      
      const interval = setInterval(() => {
        this.offset = this.offset - 1
        if (this.offset < -height) clearInterval(interval)
      }, 100)
    }
  }
})