const path = require('path')
const fs = require('fs')
const express = require('express')
const cors = require('cors')
const WebSocket = require('ws')
const Datastore = require('nedb')
const train = require('./utils/train')

async function archive() {
  const timestamp = Date.now()

  fs.readFile(path.join(__dirname, 'store-dataset'), (err, data) => {
    if (err) console.log(err)
  
    fs.writeFile(path.join(__dirname, `archive/datasets/${ timestamp }`), data, (err) => {
      if (err) console.log(err)
      console.log(`saved ${ timestamp } dataset`)
    })
  })
  
  fs.writeFile(path.join(__dirname, `archive/labels/${ timestamp }`), JSON.stringify(labels), (err) => {
    if (err) console.log(err)
    console.log(`saved ${ timestamp } labels`)
  })
  
  const groups = [...new Set(labels.map(entry => entry.group))]

  for (const group of groups) {
    const trained = await train.init(group, timestamp)
    console.log(trained)
  }
}

const storeDataset = new Datastore({ filename: path.join(__dirname, 'store-dataset'), autoload: true })
const storeLabels = new Datastore({ filename: path.join(__dirname, 'store-labels'), autoload: true })
const wss = new WebSocket.Server({ port: 5001 })
const app = express()

app.use(cors())

const port = 5000
let labels = []

function setLabels() {
  storeLabels.find({}).sort({ timestamp: 1 }).exec((err, entries) => {
    if (err) console.log(err)

    if (entries.length === 0) {
      console.log('No labels entries')
    } else {
      labels = entries
      /* archive() */
    }
  })
}

setLabels()

app.use('/turk', express.static(path.join(__dirname, 'public')))
app.use('/kisd', express.static(path.join(__dirname, 'public')))

/* app.use('/', express.static(path.join(__dirname, 'public'))) */
app.use('/archive', express.static(path.join(__dirname, 'archive')))

app.use('/dataset', (req, res) => {
  const group = req.query.group
  const label = req.query.label
  const client = req.query.client

  let search = {}

  if (group) search['group'] = group
  if (label) search['data.label'] = label
  if (client) search['client'] = client

  storeDataset.find(search).sort({ timestamp: 1 }).exec((err, entries) => {
    if (err) console.log(err)

    if (entries.length === 0) {
      res.statusCode = 404
      res.json({ errors: [`No entries`] })
    } else {
      res.json(entries)
    }
  })
})

app.use('/labels', (req, res) => {
  const group = req.query.group
  const client = req.query.client

  let search = {}

  if (group) search['group'] = group
  if (client) search['client'] = client

  storeLabels.find(search).sort({ timestamp: 1 }).exec((err, entries) => {
    if (err) console.log(err)

    if (entries.length === 0) {
      res.statusCode = 404
      res.json({ errors: [`No labels entries`] })
    } else {
      res.json(entries)
    }
  })
})

app.use('/model', (req, res) => {
  const group = req.query.group
  const time = req.query.time

  const groups = [...new Set(labels.map(entry => entry.group))]

  if (groups.indexOf(group) === -1 || time != 'latest') {
    res.statusCode = 404
    res.json({ errors: [`No model entries`] })
    return
  }

  fs.readdir(`archive/models/${ group }`, (err, files) => {
    if (err) return console.log(err)

    const timestamps = files.map(file => Number(file)).filter(file => !isNaN(file))
    const latest = Math.max.apply(Math, timestamps)

    res.json({ timestamp: latest })
  })
})

app.set('json spaces', 2)
app.listen(port)

function validateLabel (group, data) {
  const labelsGroup = labels.filter(entry => entry.group === group).map(entry => entry.data.label)

  if (labelsGroup.indexOf(data.label) !== -1) {
    return false
  } else if (/\d/.test(data.label)) {
    return false
  } else {
    return true
  }
}

function validateColor (group, data) {
  const labelsGroup = labels.filter(entry => entry.group === group).map(entry => entry.data.label)

  if (labelsGroup.indexOf(data.label) === -1) {
    return false
  } else if (!Number.isInteger(data.color.r) || data.color.r < 0 || data.color.r > 255) {
    return false
  } else if (!Number.isInteger(data.color.g) || data.color.g < 0 || data.color.g > 255) {
    return false
  } else if (!Number.isInteger(data.color.b) || data.color.b < 0 || data.color.b > 255) {
    return false
  } else {
    return true
  }
}

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    try {
      JSON.parse(message)
    } catch (err) {
      console.log(err)
      return
    }

    const msg = JSON.parse(message)
  
    const entry = {
      data: msg.data,
      group: msg.group,
      client: msg.client,
      timestamp: Date.now(),
    }

    if (msg.do === 'insert-color') {
      if (validateColor(msg.group, msg.data)) {
        storeDataset.insert(entry)
  
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            const update = {
              group: msg.group,
              do: 'update-dataset',
              label: msg.data.label
            }
    
            client.send(JSON.stringify(update))
          }
        })
      } else {
        console.log(`no valid color ${ JSON.stringify(msg) }`)
      }
    } else if (msg.do === 'insert-label') {
      if (validateLabel(msg.group, msg.data)) {
        storeLabels.insert(entry, (err, entry) => {
          if (err) console.log(err)
          setLabels()
        })

        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            const update = {
              group: msg.group,
              do: 'update-labels'
            }

            client.send(JSON.stringify(update))
          }
        })
      } else {
        console.log(`no valid label ${ JSON.stringify(msg) }`)
      }
    }
  })
})

console.log(`toc servin at http://localhost:${ port }`)
