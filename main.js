var fs = require('fs')
var sbn = require('./sbn.js')

var code = `Papel 0
            Lapiz 100
            Linea 10 90 90 90
            Linea 90 10 90 90
            Linea 10 10 90 10
            Linea 10 10 10 90`

console.log('Lexer:')
console.log(sbn.lexer(code))
console.log('\n\n\nParser:')
console.log(sbn.parser(sbn.lexer(code)))
console.log('\n\n\nTransformador:')
console.log(sbn.transformer(sbn.parser(sbn.lexer(code))))
console.log('\n\n\nGenerador:')
console.log(sbn.generator(sbn.transformer(sbn.parser(sbn.lexer(code)))))

fs.writeFile('dibujo.svg', sbn.compile(code), function (err) {
    console.log('SVG generado y guardado en dibujo.svg')
})
