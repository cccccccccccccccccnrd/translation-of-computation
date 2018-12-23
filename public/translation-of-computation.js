const sample = document.getElementById('color')
const rgb = document.getElementById('rgb')
const label = document.getElementById('label')
const violet = document.getElementById('violet')
const blue = document.getElementById('blue')
const green = document.getElementById('green')
const yellow = document.getElementById('yellow')
const orange = document.getElementById('orange')
const red = document.getElementById('red')
const pink = document.getElementById('pink')
const brown = document.getElementById('brown')
const grey = document.getElementById('grey')

const socket = new WebSocket('wss://cnrd.computer/toc-ws')

let color
const client = Math.random().toString(16).slice(2)

async function predict () {
  const model = await tf.loadModel('https://cnrd.computer/toc/model/model.json')

  const values = rgb.value.split(',').map(value => value / 255)
  const xs = tf.tensor2d([values])
  
  const prediction = model.predict(xs)
  const index = await prediction.argMax(1).data()
  
  const labels = ['violet', 'blue', 'green', 'yellow', 'orange', 'red', 'pink', 'brown', 'grey']
  
  label.classList.remove('hidden')
  label.innerText = labels[index[0]]
}

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

rgb.addEventListener('focusin', () => {
  label.classList.remove('hidden')
})

rgb.addEventListener('focusout', () => {
  setTimeout(() => {
    label.classList.add('hidden')
  }, 400)
})

rgb.addEventListener('input', () => {
  const values = rgb.value.split(',').map(value => Number.parseInt(value))

  if (values.length !== 3) {
    sample.style.background = 'white'
    label.classList.add('hidden')
    return
  } else if (values.some(e => Number.isNaN(e))) { 
    sample.style.background = 'white'
    label.classList.add('hidden')
  } else if (values.some(e => e < 0 || e > 255)) {
    sample.style.background = 'white'
    label.classList.add('hidden')
  } else {
    sample.style.background = `rgb(${ values[0] }, ${ values[1] }, ${ values[2] })`
    predict()
  }

  console.log(values)
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