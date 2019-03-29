const path = require('path')
const fetch = require('node-fetch')
const tf = require('@tensorflow/tfjs')
require('@tensorflow/tfjs-node')

/* const BASE_URL = 'http://localhost:5000' */
const BASE_URL = 'https://translation-of-computation.com'

async function save (model, group, filename) {
  await model.save(`file:/${ path.join(__dirname, `../archive/models/${ group }/${ filename }`) }`)
  return { group: group, filename: filename }
}

async function train ([labels, colors]) {
  const labelsTensor = tf.tensor1d(labels, 'int32')
  const xs = tf.tensor2d(colors)
  const ys = tf.oneHot(labelsTensor, labels.length)

  const model = tf.sequential()

  const hidden = tf.layers.dense({
    units: 16,
    activation: 'sigmoid',
    inputShape: [3]
  })

  const output = tf.layers.dense({
    units: labels.length,
    activation: 'softmax'
  })

  model.add(hidden)
  model.add(output)

  const lr = 0.2
  const optimizer = tf.train.adam(lr)

  model.compile({
    loss: 'categoricalCrossentropy',
    optimizer: optimizer
  })

  const options = {
    epochs: 100,
    validationSplit: 0.1,
    shuffle: true
  }

  await model.fit(xs, ys, options)
    .then(results => {
      console.log(`remaining tensors: ${ tf.memory().numTensors }`)
    })

  tf.dispose(labelsTensor)
  tf.dispose(xs)
  tf.dispose(ys)

  return model
}

function prepare ([dataset, list]) {
  const set = dataset.map(entry => entry.data)
  const labels = set.map(entry => list.indexOf(entry.label))
  const colors = set.map(entry => [entry.color.r / 255, entry.color.g / 255, entry.color.b / 255])

  return [labels, colors]
}

async function get (group, limit) {
  limit = limit || undefined

  const dataset = await fetch(`${ BASE_URL }/dataset?group=${ group }`)
    .then(res => res.json())
    .then(data => {
      return data.slice(0, limit)
    })
  
  const list = await fetch(`${ BASE_URL }/labels?group=${ group }`)
    .then(res => res.json())
    .then(data => {
      return data.map(entry => entry.data.label)
    })

  return [dataset, list]
}

async function init (group, filename) {
  const got = await get(group)
  const prepared = await prepare(got)
  const trained = await train(prepared)
  const saved = await save(trained, group, filename)
  return saved
}

/* if (process.argv[2]) {
  const group = process.argv[2]
  const timestamp = Date.now()

  init(group, timestamp)
} */

module.exports = {
  init
}