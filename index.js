const path = require('path')
const express = require('express')
const WebSocket = require('ws')
const Datastore = require('nedb')

const db = new Datastore({ filename: path.join(__dirname, 'dataset'), autoload: true })
const wss = new WebSocket.Server({ port: 5001 })
const app = express()

const labels = ['violet', 'blue', 'green', 'yellow', 'orange', 'red', 'pink', 'brown', 'grey']

app.use('/', express.static(path.join(__dirname, 'public')))

app.use('/dataset/label/:label', (req, res) => {
  if (labels.indexOf(req.params.label) === -1) {
    res.json({
      errors: ['Invalid label'],
      labels: labels
    })
    return
  }

  db.find({ 'data.label': req.params.label }, (err, entries) => {
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
  db.find({ client: req.params.client }, (err, entries) => {
    if (err) console.log(err)

    if (entries.length === 0) {
      db.find({}, (err, entries) => {
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

app.use('/dataset', (req, res) => {
  db.find({}, (err, entries) => {
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
app.listen(5000)

function validate (data) {
  if (labels.indexOf(data.label) === -1) {
    return false
  } else if (!Number.isInteger(data.color.r) || data.color.r <= 0 || data.color.r >= 255) {
    return false
  } else if (!Number.isInteger(data.color.g) || data.color.g <= 0 || data.color.g >= 255) {
    return false
  } else if (!Number.isInteger(data.color.b) || data.color.b <= 0 || data.color.b >= 255) {
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

    if (validate(msg.data)) {
      db.insert(entry)
    } else {
      console.log(`not valid ${ msg }`)
    }
  })
})
