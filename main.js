var fs = require('fs')
var sbn = require('./sbn.js')

var code = `Paper 95
            Pen 1
            Line 50 15 85 80`

console.log('holap');
fs.writeFile("sbn_drawing.svg", sbn.compile(code), function(err) {
    console.log('SVG was saved!')
})