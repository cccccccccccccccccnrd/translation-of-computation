const path = require('path')
const fs = require('fs')
const fetch = require('node-fetch')
const train = require('./train')

const BASE_URL = 'https://translation-of-computation.com'

async function archive(groups) {
  const timestamp = Date.now()

  fs.readFile(path.join(__dirname, '../store-dataset'), (err, data) => {
    if (err) console.log(err)
  
    fs.writeFile(path.join(__dirname, `../archive/datasets/${ timestamp }`), data, (err) => {
      if (err) console.log(err)
      console.log(`saved ${ timestamp } dataset`)
    })
  })

  fs.readFile(path.join(__dirname, '../store-labels'), (err, data) => {
    if (err) console.log(err)
  
    fs.writeFile(path.join(__dirname, `../archive/labels/${ timestamp }`), data, (err) => {
      if (err) console.log(err)
      console.log(`saved ${ timestamp } labels`)
    })
  })

  let logs = []

  for (const group of groups) {
    const trained = await train.init(group, timestamp)
    logs.push(trained)
  }

  return logs
}

async function init (groups) {
  if (!groups) {
    groups = await fetch(`${ BASE_URL }/labels`)
      .then(res => res.json())
      .then(data => {
        return [...new Set(data.map(entry => entry.group))]
      })
  }

  const archived = await archive(groups)
  return archived
}

if (process.argv[2]) {
  const groups = process.argv.slice(2)
  archive(groups)
}

module.exports = {
  init
}