const fetch = require('node-fetch')
const tf = require('@tensorflow/tfjs')
require('@tensorflow/tfjs-node')

let modelname

async function save (model) {
  await model.save(`file://models/${ modelname }`)
}

async function train (model, xs, ys, epochs) {
  const options = {
    epochs: epochs,
    validationSplit: 0.1,
    shuffle: true
  }

  await model.fit(xs, ys, options)
    .then(async (results) => {
      console.log(results)
      save(model)
    })
}

function build (labels, colors) {
  const xs = tf.tensor2d(colors)
  const ys = tf.oneHot(tf.tensor1d(labels, 'int32'), 6)
  
  xs.print()
  ys.print()

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

  train(model, xs, ys, 100)
}

function prepare (data) {
  const list = ['violet', 'blue', 'green', 'yellow', 'orange', 'red']
  const set = data.map(entry => entry.data)
  const labels = set.map(entry => list.indexOf(entry.label))
  const colors = set.map(entry => [entry.color.r / 255, entry.color.g / 255, entry.color.b / 255])

  build(labels, colors)
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
  console.log(modelname)
  get()
}

module.exports = {
  go
}