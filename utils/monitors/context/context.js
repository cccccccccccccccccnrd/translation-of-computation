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
        title: 'Automated Inference on Criminality using Face Images',
        img: './criminal-faces.png',
        source: 'https://arxiv.org/pdf/1611.04135v2.pdf',
        text: 'But there is no need for us humans to put these shortcuts into our systems, with machine learning in the tool belt we are set and ready to interpolate. Essentially machine learning is a proxy producing gambling machine. With pattern recognition, we never know what we are going to get and how the importance weights of the various features will look like. Looking back at our cat and dog classification project, I want to add another important step in the creation of the dataset. While preparing the dataset we would have to pay attention to not create wrong correlations in the dataset. Let me explain what I mean by that: when taking the pictures of the cats and dogs, we would have to normalize them in a way, that the model would actually pick upon the features we want it to pick upon, meaning the visual difference between a cat and a dog; and nothing more. If we would decide to place all cats in front of an orange background and all dogs in front of a purple background, the model would essentially also assign the feature of a lot of orange pixels to cats and the feature of a lot of purple ones to dogs. So when we would place a dog in front of an orange background, the model would most probably, predict it to be a cat. While training the model, the classification can pick up very fine features, and there is no guarantee that it would be a feature which is in correlation with our initial goal, meaning there is no guarantee if the recognized pattern is a proxy or not; making pattern recognition a proxy producing gambling machine. "Machine learning does not distinguish between correlations that are causally meaningful and ones that are incidental" (Agüera y Arcas, Mitchell and Todorov, 2017). The same is what probably happened to the model of the paper "Automated Inference on Criminality Using Face Images" of Xiaolin Wu and Xi Zhang, which was extensively analysed in the great article "Physiognomy’s New Clothes" by Blaise Agüera y Arcas, Margaret Mitchell and Alexander Todorov. Wu and Zhang’s paper states that they can "predict the likelihood that a person is a convicted criminal with nearly 90% accuracy using nothing but a driver’s license-style face photo" (Agüera y Arcas, Mitchell and Todorov, 2017). When having a closer look at the sample of the dataset provided in the paper, it doesn\'t need much to spot a clear classification feature, which is not part of the face. All three people labeled as ‘non-criminal ID’ are wearing a white collar shirt, being a way too easy catch for our proxy gambling machine.'
      }, {
        title: 'U.S. News Best Colleges Ranking',
        img: './usnews-ranking.png',
        source: 'https://www.usnews.com/best-colleges',
        text: 'In 1983 the news magazine "U.S. News & World Report" started to rank several major colleges and universities from the U.S and would publish its findings as "U.S. News Best Colleges Rankings". In the beginning the list was solely based on an internal survey send out to university presidents. But as the complaints entered, the magazine needed to come up with a more sophisticated model. But again confronted with the fundamental question, on which data will the model be based on? They decided to stay with the survey and give it a 25 percent cut of the whole evaluation. The remaining 75 percent would be the model trained on "educational excellence". Of course "educational excellence" represented as a vast collection of proxies, which were debatable to represent the desired goal. Again the fundamental embodiment of the rationalistic tradition did its duty and U.S. News later defined "educational excellence" with SAT scores, student-teacher ratios, acceptance rates, drop-out rates, and number of alumni who would actively contribute money. The complex reality was once again simplified to a bunch of computable data points (O’Neil, 2017). Referring back to the importance of the missing variable, this particular model has a great confession to make: tuition fees were not included in the prediction of the model. Ever since the ranking went public tuition fees skyrocketed. Leaving many students and families with depts in unimaginable amounts. Nevertheless the ranking became a national standard and with that a much bigger problem arose. Just like it is often the case, the model reinforced itself. Because of the wide acceptance, the ranking became the new objective for all colleges and universities. Everyone wanted to be at the top of the list, because that\'s where everybody was looking at. And as we know from the nature of proxies, once they are implemented and out in the open, they will be exploited to practice deceit. And this is exactly what happened. The ranking turned into a race of who can trick the algorithm the best, where the value of education just didn\'t matter anymore.'
      }],
      right: [{
        title: 'Kodak\'s Shirley Cards',
        img: './shirley-cards.png',
        source: 'Pater, R. (2016). The Politics of Design: A (Not So) Global Manual for Visual Communication',
        text: 'Continuing with the racist history of failed systems, let\'s take a look at computer vision systems. In the movie industry around the 1960s Kodak films were widely used and resembled the industry standard at that time. Unfortunately the films were designed for people of white skin color, because the model posing for the Kodak test cards, which were used to calibrate the color films, happened to be white. The films were unusable for working with darker skinned people. The pictures would always turn out to be under-exposed. The most ironic part is that Kodak didn’t change their calibration methods. Kodak just didn’t update their model to work with darker tones. But when complaints, not being able to photograph chocolate or dark horses, were filed, only then Kodak reacted (Pater, 2016).'
      }, {
        title: 'The Three Pillars of Predictive Policing',
        img: './predpol.png',
        source: 'https://www.predpol.com/law-enforcement/',
        text: 'In the specific example of PredPol, the self-acclaimed market leader in predictive policing, product owners have a choice on what kind of crimes to focus on, hence what kind of crime data will fill the dataset. In a freshly installed system the software asks to also include so-called "Part 2" crimes, being vagrancy, aggressive panhandling and selling, and consuming small quantities of drugs. While the system mostly works effective with "Part 1" crimes, being more severe crimes like homicide, assault or burglary, the system’s fairness starts to descent with the inclusion of "Part 2" crimes, led by the "broken-windows" policing theory. The theory goes that environments, which look more careless or less maintained, hence the broken windows, would serve as a ground for more severe crimes. A house with a broken window would invite burglars. So people started to fix broken windows and to take more care of their environment. Unfortunately the movement eventually led to zero-tolerance campaigns, where police officers would stop and arrest low-level crimes, filling U.S. prisons with numerous people convicted with victimless crimes (O’Neil, 2017). Back to PredPol, the software works with the Google Maps web interface, displaying its predictions as 150 m2 boxes with red borders signaling high-risk areas. These areas resemble the area where a crime is most likely going to happen, so police officers are instructed to patrol these areas more often. With the "Part 2" crimes feature activated, neighborhoods of low-level crimes are becoming the hot-spots for patrolling. So when the police officer visits the predicted area and sees teenagers sharing a joint on the street or any other low-level, victimless crime, the officer will stop them. With that PredPol’s cloud would spin up and start evaluating the new captured data, which of course would be evaluated as a success, because the new location data point of the new crime would match within the predicted red bordered box. So the model would update its "patrol heat maps", sending more patrols to the same area again leading to more reported crimes of that neighbourhood, resembling another vicious self-reinforcement mechanism.'
      }, {
        title: 'Death by GPS',
        img: './death-by-gps.png',
        source: 'Bridle, J. (2018). New Dark Age: Technology and the End of the Future',
        text: 'The phenomenon of automation bias shows a repeating pattern, which can be observed in the use of computational systems. Again tightly connected to computational thinking, automation bias describes our unconditional love and trust in computational systems. In the national park in Death Valley, rangers came up with the term "Death by GPS", because the event of people following the blue route until their death was occurring again and again. It might seem implausible, but the trust we have in our everyday algorithms, is astonishingly high. Another incident happened when a tourist group drove their car into a lake, because the navigation system told them too (Bridle, 2018). Whether it is the dataset, the model, the app, or the blue route, we treat every stage of the design of computational systems as the single source of truth, resulting in an inevitable cascading waterfall of unpredictable bias. "The problem is not only in the semantic bias of the data set, but also in the design of the algorithm that treats the data as unbiased fact, and finally in the users of the computer program who believe in its scientific objectivity" (Cramer, 2019, p. 33). We build these highly optimized systems, but the underlying foundation is again and again disregarded. The same is happening in the discourse of algorithmic bias and machine learning. Most of the biases are not a new phenomenon of machine learning, they are inherently rooted in software development. The data that we feed our systems with is not looked at enough, and as we know from the translation of computation its the most crucial step, where all interpretations and observations take place.'
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
    this.left = this.contexts.left[this.pos.left]
    this.right = this.contexts.right[this.pos.right]

    this.scroll('left')
    this.scroll('right')
  },
  mounted: function () {

  },
  computed: {

  },
  methods: {
    scroll: function (side) {
      this.offset[side] = 0

      const interval = setInterval(() => {
        this.offset[side] = this.offset[side] - 1
        if (this.offset[side] <= -this.$refs[side].offsetHeight + document.body.offsetHeight) {
          clearInterval(interval)

          if (this.pos[side] < this.contexts[side].length - 1) {
            this.pos[side]++
          } else {
            this.pos[side] = 0
          }

          this[side] = this.contexts[side][this.pos[side]]
          this.scroll(side)
        }
      }, 25)
    }
  }
})