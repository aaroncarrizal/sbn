const lexer = require("./codigoPorPartes/lexer");
const parser = require("./codigoPorPartes/parser");
const transformer = require("./codigoPorPartes/transformer");
const generator = require("./codigoPorPartes/generator");

let SBN = {}
SBN.lexer = lexer
SBN.parser = parser
SBN.transformer = transformer
SBN.generator = generator

SBN.compile = function (code) {
  return this.generator(this.transformer(this.parser(this.lexer(code))))
}


module.exports = SBN;
