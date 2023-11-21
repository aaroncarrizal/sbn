var fs = require('fs')
var sbn = require('./sbn.js');
const { log } = require('console');

var code = `Papel 95
            Lapiz 1
            Linea 50 15 85 80`

console.log('Lexer:');
console.log(sbn.lexer(code));
console.log('Parser:');
console.log(sbn.parser(sbn.lexer(code)));
console.log('Transformer:');
console.log(sbn.transformer(sbn.parser(sbn.lexer(code))));
console.log('Generator:');
console.log(sbn.generator(sbn.transformer(sbn.parser(sbn.lexer(code)))));
fs.writeFile("sbn_drawing.svg", sbn.compile(code), function(err) {
    console.log('SVG was saved!')
})