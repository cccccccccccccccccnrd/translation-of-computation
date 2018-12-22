const sample = document.getElementById('color')
const rgb = document.getElementById('rgb')
const violet = document.getElementById('violet')
const blue = document.getElementById('blue')
const green = document.getElementById('green')
const yellow = document.getElementById('yellow')
const orange = document.getElementById('orange')
const red = document.getElementById('red')
const pink = document.getElementById('pink')
const brown = document.getElementById('brown')
const grey = document.getElementById('grey')

const socket = new WebSocket('ws://localhost:5001')

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
  rgb.innerText = `${ r }, ${ g }, ${ b }`
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
}, 30)  */

setColor()