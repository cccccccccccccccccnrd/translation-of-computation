const BASE_URL = 'https://translation-of-computation.com'
const WS_URL = 'wss://translation-of-computation.com/ws'
const socket = new WebSocket(WS_URL)

const app = new Vue({
  el: '#app',
  data: {
    contexts: {
      left: [{
        title: 'Google Photos, y\'all fucked up. My friend\'s not a gorilla.',
        img: './google-photos.png',
        source: 'https://twitter.com/jackyalcine/status/615329515909156865',
        text: 'Another rather troublesome example is when Google\'s Photo app image classification algorithm failed and labeled two black people as "Gorillas" (@jackyalcine, 2015). In June 2015 @jackyalcine tweeted about the incident, but all what Google did was to remove gorillas altogether from its model (Simonite, 2018). More precisely, until this day (05.03.2019) Google still blocks all search queries for the tags "gorilla", "chimp", "chimpanzee", or "monkey" in its Photo app. Just because the pre-trained model is not being updated; since almost 4 years now. Behind the app sits most probably the wide spread ImageNet dataset. ImageNet is an academic dataset, which provides a numerous set of images according to the labels of a database called WordNet. For each "synonym set" of WordNet, ImageNet tries to provide an average of 1000 images. Browsing the explorer on the dataset’s website, taking a closer look at the node "People", quickly shows the deficiency of black people, which is not representational and most probably leading to the misclassification of Google’s Photo app (ImageNet, 2019).'
      }, {
        title: 'The Three Pillars of Predictive Policing',
        img: './predpol.png',
        source: 'https://www.predpol.com/law-enforcement/',
        text: 'In the specific example of PredPol, the self-acclaimed market leader in predictive policing, product owners have a choice on what kind of crimes to focus on, hence what kind of crime data will fill the dataset. In a freshly installed system the software asks to also include so-called "Part 2" crimes, being vagrancy, aggressive panhandling and selling, and consuming small quantities of drugs. While the system mostly works effective with "Part 1" crimes, being more severe crimes like homicide, assault or burglary, the system’s fairness starts to descent with the inclusion of "Part 2" crimes, led by the "broken-windows" policing theory. The theory goes that environments, which look more careless or less maintained, hence the broken windows, would serve as a ground for more severe crimes. A house with a broken window would invite burglars. So people started to fix broken windows and to take more care of their environment. Unfortunately the movement eventually led to zero-tolerance campaigns, where police officers would stop and arrest low-level crimes, filling U.S. prisons with numerous people convicted with victimless crimes (O’Neil, 2017). Back to PredPol, the software works with the Google Maps web interface, displaying its predictions as 150 m2 boxes with red borders signaling high-risk areas. These areas resemble the area where a crime is most likely going to happen, so police officers are instructed to patrol these areas more often. With the "Part 2" crimes feature activated, neighborhoods of low-level crimes are becoming the hot-spots for patrolling. So when the police officer visits the predicted area and sees teenagers sharing a joint on the street or any other low-level, victimless crime, the officer will stop them. With that PredPol’s cloud would spin up and start evaluating the new captured data, which of course would be evaluated as a success, because the new location data point of the new crime would match within the predicted red bordered box. So the model would update its "patrol heat maps", sending more patrols to the same area again leading to more reported crimes of that neighbourhood, resembling another vicious self-reinforcement mechanism.'
      }],
      right: [{
        title: 'Google Photos, y\'all fucked up. My friend\'s not a gorilla.',
        img: './google-photos.png',
        source: 'https://twitter.com/jackyalcine/status/615329515909156865',
        text: 'Another rather troublesome example is when Google\'s Photo app image classification algorithm failed and labeled two black people as "Gorillas" (@jackyalcine, 2015). In June 2015 @jackyalcine tweeted about the incident, but all what Google did was to remove gorillas altogether from its model (Simonite, 2018). More precisely, until this day (05.03.2019) Google still blocks all search queries for the tags "gorilla", "chimp", "chimpanzee", or "monkey" in its Photo app. Just because the pre-trained model is not being updated; since almost 4 years now. Behind the app sits most probably the wide spread ImageNet dataset. ImageNet is an academic dataset, which provides a numerous set of images according to the labels of a database called WordNet. For each "synonym set" of WordNet, ImageNet tries to provide an average of 1000 images. Browsing the explorer on the dataset’s website, taking a closer look at the node "People", quickly shows the deficiency of black people, which is not representational and most probably leading to the misclassification of Google’s Photo app (ImageNet, 2019).'
      }, {
        title: 'The Three Pillars of Predictive Policing',
        img: './predpol.png',
        source: 'https://www.predpol.com/law-enforcement/',
        text: 'In the specific example of PredPol, the self-acclaimed market leader in predictive policing, product owners have a choice on what kind of crimes to focus on, hence what kind of crime data will fill the dataset. In a freshly installed system the software asks to also include so-called "Part 2" crimes, being vagrancy, aggressive panhandling and selling, and consuming small quantities of drugs. While the system mostly works effective with "Part 1" crimes, being more severe crimes like homicide, assault or burglary, the system’s fairness starts to descent with the inclusion of "Part 2" crimes, led by the "broken-windows" policing theory. The theory goes that environments, which look more careless or less maintained, hence the broken windows, would serve as a ground for more severe crimes. A house with a broken window would invite burglars. So people started to fix broken windows and to take more care of their environment. Unfortunately the movement eventually led to zero-tolerance campaigns, where police officers would stop and arrest low-level crimes, filling U.S. prisons with numerous people convicted with victimless crimes (O’Neil, 2017). Back to PredPol, the software works with the Google Maps web interface, displaying its predictions as 150 m2 boxes with red borders signaling high-risk areas. These areas resemble the area where a crime is most likely going to happen, so police officers are instructed to patrol these areas more often. With the "Part 2" crimes feature activated, neighborhoods of low-level crimes are becoming the hot-spots for patrolling. So when the police officer visits the predicted area and sees teenagers sharing a joint on the street or any other low-level, victimless crime, the officer will stop them. With that PredPol’s cloud would spin up and start evaluating the new captured data, which of course would be evaluated as a success, because the new location data point of the new crime would match within the predicted red bordered box. So the model would update its "patrol heat maps", sending more patrols to the same area again leading to more reported crimes of that neighbourhood, resembling another vicious self-reinforcement mechanism.'
      }]
    },
    left: {},
    right: {},
    offset: {
      left: 0,
      right: 0
    },
    pos: {
      left: 0,
      right: 0
    },
    prediction: true,
    updating: false
  },
  created: function () {
    this.left = this.contexts.left[0]
    this.right = this.contexts.right[1]

    this.scroll('left')
    this.scroll('right')
  },
  mounted: function () {

  },
  computed: {

  },
  methods: {
    scroll: function (side) {
      this.offset[side] = document.body.offsetHeight

      const interval = setInterval(() => {
        this.offset[side] = this.offset[side] - 1
        if (this.offset[side] <= -this.$refs[side].offsetHeight - 20) {
          clearInterval(interval)

          if (this.pos[side] < this.contexts[side].length - 1) {
            this.pos[side]++
          } else {
            this.pos[side] = 0
          }

          this[side] = this.contexts[side][this.pos[side]]
          this.scroll(side)
        }
      }, 5)
    }
  }
})