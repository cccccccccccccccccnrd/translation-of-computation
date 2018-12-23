const sample = document.getElementById('color')
const rgb = document.getElementById('rgb')
const predict = document.getElementById('predict')
const violet = document.getElementById('violet')
const blue = document.getElementById('blue')
const green = document.getElementById('green')
const yellow = document.getElementById('yellow')
const orange = document.getElementById('orange')
const red = document.getElementById('red')
const pink = document.getElementById('pink')
const brown = document.getElementById('brown')
const grey = document.getElementById('grey')

const socket = new WebSocket('ws://localhost:5001') // wss://cnrd.computer/toc-ws

let color
const client = Math.random().toString(16).slice(2)

function setColor () {
  const r = getValue()
  const g = getValue()
  const b = getValue()

  color = {
    r: r,
    g: g,
    b: b
  }

  sample.style.background = `rgb(${ r }, ${ g }, ${ b })`
  rgb.value = `${ r }, ${ g }, ${ b }`
}

function sendColor (label) {
  const msg = {
    data: {
      label: label,
      color: color
    },
    client: client
  }

  socket.send(JSON.stringify(msg))
  setColor()
}

function getValue () {
  return Math.floor(Math.random() * 255)
}

rgb.addEventListener('focus', () => {
  predict.classList.remove('hidden')
})

rgb.addEventListener('input', () => {
  const values = rgb.value.split(',').map(value => Number.parseInt(value))

  console.log(values)
  if (!values.length === 3) {
    sample.style.background = 'white'
    return
  } else if (values.some(e => Number.isNaN(e))) { 
    sample.style.background = 'white'
  } else if (values.some(e => e < 0 || e > 255)) {
    sample.style.background = 'white'
  } else {
    sample.style.background = `rgb(${ values[0] }, ${ values[1] }, ${ values[2] })`
  }

})

predict.addEventListener('click', async () => {
  if (predict.style.visibility === 'hidden') return

  const model = await tf.loadModel('https://cnrd.computer/toc/model/model.json')

  const values = rgb.value.split(',').map(value => value / 255)
  const xs = tf.tensor2d([values])
  
  const prediction = model.predict(xs)
  const index = prediction.argMax(1).dataSync()[0]
  
  const labels = ['violet', 'blue', 'green', 'yellow', 'orange', 'red', 'pink', 'brown', 'grey']
  
  predict.innerText = labels[index]

  setTimeout(() => {
    predict.innerText = 'predict'
  }, 3000)
})

violet.addEventListener('click', () => {
  sendColor('violet')
})

blue.addEventListener('click', () => {
  sendColor('blue')
})

green.addEventListener('click', () => {
  sendColor('green')
})

yellow.addEventListener('click', () => {
  sendColor('yellow')
})

orange.addEventListener('click', () => {
  sendColor('orange')
})

red.addEventListener('click', () => {
  sendColor('red')
})

pink.addEventListener('click', () => {
  sendColor('pink')
})

brown.addEventListener('click', () => {
  sendColor('brown')
})

grey.addEventListener('click', () => {
  sendColor('grey')
})

/* setInterval(() => {
  setColor()
  sendColor('red')
}, 30)  */

setColor()