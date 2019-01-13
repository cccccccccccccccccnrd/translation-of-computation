const path = require('path')
const fs = require('fs')

const expressions = {
  code: /(?<=<code>)(.+?)(?=<\/code>)/g,
  string: /(\'|\`)(.*?)(\'|\`)/g,
  number: /(?![a-zA-Z])(\d+)(?![a-zA-Z])(?=([^"]*"[^"]*")*[^"]*$)/g,
  definition: /(?<= )([a-zA-Z]+?)(?=\ =)/g,
  operator: /(?<= )(=|\*)(?= )/g,
  variable: /(?<=( |\(|\.))([a-zA-Z]+?)(?=\.)|(?<=\(|, )([a-zA-Z]+?)(?=\)|,)|(?<=( |\())([a-zA-Z]+?)(?=:)|(?<=throw )([a-zA-Z]+)/g,
  property: /(?<=\.|function )([a-zA-Z0-9]+?)(?=\(| \()/g,
  keyword: /(const|let|function|return|if|throw|=>)/g,
  json: /(?<=<code class='json'>)(.+?)(?=<\/code>)/g,
  jsonString: /(?<=: )"(.*?)"/g,
  jsonNumber: /(?![a-zA-Z])(\d+)(?![a-zA-Z])(?=([^"]*"[^"]*")*[^"]*$)|(true|false|null)/g,
  jsonKey: /"([a-zA-Z_]+?)"(?=: )/g
}

function save (writing) {
  fs.writeFile('cool.json', writing, (err) => {
    if (err) throw err
    console.log(`compiled`)
  })
}

function replace (code, type) {
  type = type || 'code'
  if (type === 'code') {
    return code
      .replace(expressions.string, match => `<span class='code-string'>${ match }</span>`)
      .replace(expressions.number, match => `<span class='code-number'>${ match }</span>`)
      .replace(expressions.definition, match => `<span class='code-definition'>${ match }</span>`)
      .replace(expressions.operator, match => `<span class='code-operator'>${ match }</span>`)
      .replace(expressions.variable, match => `<span class='code-variable'>${ match }</span>`)
      .replace(expressions.property, match => `<span class='code-property'>${ match }</span>`)
      .replace(expressions.keyword, match => `<span class='code-keyword'>${ match }</span>`)
  } else if (type === 'json') {
    return code
      .replace(expressions.jsonString, match => `<span class='json-string'>${ match }</span>`)
      .replace(expressions.jsonNumber, match => `<span class='json-number'>${ match }</span>`)
      .replace(expressions.jsonKey, match => `<span class='json-key'>${ match }</span>`)
  }
}

function match (content) {
  const codes = content.match(expressions.code)
  const jsons = content.match(expressions.json)
  if (!codes && !jsons) return content

  if (jsons) {
    const compiled = content.replace(expressions.code, match => {
      return replace(match)
    })

    return compiled.replace(expressions.json, match => {
      console.log(replace(match, 'json'))
      return replace(match, 'json')
    })
  } else {
    return content.replace(expressions.code, match => {
      return replace(match)
    })
  }
}

function compile (writing) {
  writing.map(article => article.content = match(article.content))
  save(JSON.stringify(writing))
}

fs.readFile(path.join(__dirname, '../public/writing.json'), 'utf8', (err, data) => {
  if (err) throw err
  compile(JSON.parse(data))
})