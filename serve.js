const path = require('path')
const fs = require('fs')
const express = require('express')
const WebSocket = require('ws')
const Datastore = require('nedb')
const train = require('./utils/train')

function testo () {
  const now = new Date()

  const day = now.getDate() - 1
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const date = `${ day }-${ month }-${ year }`

  fs.readFile('dataset-store', (err, data) => {
    if (err) throw err

    fs.writeFile(`datasets/${ date }`, data, (err) => {
      if (err) throw err
      console.log(`saved ${ date } dataset`)
    })
  })

  fs.writeFile(`labels/${ date }.json`, JSON.stringify(labels), (err) => {
    if (err) throw err
    console.log(`saved ${ date } labels`)
  })

  train.init(date, labels)
}

setInterval(() => {
  const now = new Date()

  if (now.getHours() === 3 && now.getMinutes() === 0) {
    const day = now.getDate() - 1
    const month = now.getMonth() + 1
    const year = now.getFullYear()
    const date = `${ day }-${ month }-${ year }`

    fs.readFile('dataset-store', (err, data) => {
      if (err) throw err

      fs.writeFile(`datasets/${ date }`, data, (err) => {
        if (err) throw err
        console.log(`saved ${ date } dataset`)
      })
    })

    fs.writeFile(`labels/${ date }.json`, JSON.stringify(labels), (err) => {
      if (err) throw err
      console.log(`saved ${ date } labels`)
    })

    train.init(date, labels)
  }
}, 60 * 1000)

const storeDataset = new Datastore({ filename: path.join(__dirname, 'dataset-store'), autoload: true })
const storeLabels = new Datastore({ filename: path.join(__dirname, 'labels-store'), autoload: true })
const wss = new WebSocket.Server({ port: 5001 })
const app = express()

const port = 5000
let labels = []

function setLabels() {
  storeLabels.find({}).sort({ timestamp: 1 }).exec((err, entries) => {
    if (err) console.log(err)

    if (entries.length === 0) {
      console.log('No labels entries')
    } else {
      labels = entries.map(entry => entry.data.label)
      testo()
    }
  })
}

setLabels()

app.use('/', express.static(path.join(__dirname, 'public')))
app.use('/models', express.static(path.join(__dirname, 'models')))
app.use('/labels', express.static(path.join(__dirname, 'labels')))

app.use('/dataset/labels', (req, res) => {
  storeLabels.find({}).sort({ timestamp: 1 }).exec((err, entries) => {
    if (err) console.log(err)

    if (entries.length === 0) {
      res.statusCode = 404
      res.json({ errors: [`No ${ req.params.label } entries`] })
    } else {
      res.json(entries)
    }
  })
})

app.use('/dataset/label/:label', (req, res) => {
  if (labels.indexOf(req.params.label) === -1) {
    res.json({
      errors: ['Invalid label'],
      labels: labels
    })
    return
  }

  storeDataset.find({ 'data.label': req.params.label }).sort({ timestamp: 1 }).exec((err, entries) => {
    if (err) console.log(err)

    if (entries.length === 0) {
      res.statusCode = 404
      res.json({ errors: [`No ${ req.params.label } entries`] })
    } else {
      res.json(entries)
    }
  })
})

app.use('/dataset/client/:client', (req, res) => {
  storeDataset.find({ client: req.params.client }).sort({ timestamp: 1 }).exec((err, entries) => {
    if (err) console.log(err)

    if (entries.length === 0) {
      storeDataset.find({}, (err, entries) => {
        const clients = [...new Set(entries.map(entry => entry.client))]
        
        res.statusCode = 404
        res.json({
          errors: [`No entries from ${ req.params.client }`],
          clients: clients
        })
      })
    } else {
      res.json(entries)
    }
  })
})

app.use('/dataset/id/:id', (req, res) => {
  storeDataset.find({ _id: req.params.id }).sort({ timestamp: 1 }).exec((err, entries) => {
    if (err) console.log(err)

    if (entries.length === 0) {
      res.statusCode = 404
      res.json({
        errors: [`No entry with id ${ req.params.id }`]
      })
    } else {
      res.json(entries)
    }
  })
})

app.use('/dataset', (req, res) => {
  storeDataset.find({}).sort({ timestamp: 1 }).exec((err, entries) => {
    if (err) console.log(err)

    if (entries.length === 0) {
      res.statusCode = 404
      res.json({ errors: [`No entries`] })
    } else {
      res.json(entries)
    }
  })
})

app.set('json spaces', 2)
app.listen(port)

function validateLabel (data) {
  if (labels.indexOf(data.label) !== -1) {
    return false
  } else if (/\d/.test(data.label)) {
    return false
  } else {
    return true
  }
}

function validateColor (data) {
  if (labels.indexOf(data.label) === -1) {
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
      console.error(err)
      return
    }

    const msg = JSON.parse(message)
  
    const entry = {
      data: msg.data,
      client: msg.client,
      timestamp: Date.now(),
    }

    if (msg.do === 'insert-color') {
      if (validateColor(msg.data)) {
        storeDataset.insert(entry)
  
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            const update = {
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
      if (validateLabel(msg.data)) {
        storeLabels.insert(entry, (err, entry) => {
          if (err) console.log(err)
          setLabels()
        })

        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            const update = {
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
