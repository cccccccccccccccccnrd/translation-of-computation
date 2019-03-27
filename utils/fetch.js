const fetch = require('node-fetch')

const BASE_URL = 'https://translation-of-computation.com'
const clientId = '7f44a42c326c7'

fetch(`${ BASE_URL }/dataset?client=${ clientId }`)
  .then(res => res.json())
  .then(data => {
    console.log(data, data.length)
  })