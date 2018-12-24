const fetch = require('node-fetch')
const tf = require('@tensorflow/tfjs')
require('@tensorflow/tfjs-node')

let modelname

async function save (model) {
  await model.save(`file://models/${ modelname }`)
  console.log(`generated: ${ modelname }`)
}

async function train (labels, colors) {
  const labelsTensor = tf.tensor1d(labels, 'int32')
  const xs = tf.tensor2d(colors)
  const ys = tf.oneHot(labelsTensor, 6)

  const model = tf.sequential()

  const hidden = tf.layers.dense({
    units: 16,
    activation: 'sigmoid',
    inputShape: [3]
  })

  const output = tf.layers.dense({
    units: 6,
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
    .then(async (results) => {
      console.log(`remaining tensors: ${ tf.memory().numTensors }`)
      save(model)
    })

  tf.dispose(labelsTensor)
  tf.dispose(xs)
  tf.dispose(ys)
}

function prepare (data) {
  const list = ['violet', 'blue', 'green', 'yellow', 'orange', 'red']
  const set = data.map(entry => entry.data)
  const labels = set.map(entry => list.indexOf(entry.label))
  const colors = set.map(entry => [entry.color.r / 255, entry.color.g / 255, entry.color.b / 255])

  train(labels, colors)
}

function get (limit) {
  limit = limit || undefined

  fetch('https://cnrd.computer/toc/dataset/')
  .then(res => res.json())
  .then(data => {
    console.log(data.length)
    prepare(data.slice(0, limit))
  })
}

function go(date) {
  modelname = date
  get()
}

module.exports = {
  go
}