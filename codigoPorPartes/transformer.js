/**
 * Función transformer: Convierte un AST en una representación estructurada de SVG.
 * @param {Object} ast - Árbol de sintaxis abstracta (AST) generado a partir del código fuente.
 * @returns {Object} - Representación estructurada de SVG.
 */
function transformer(ast) {
    /**
     * Función makeColor: Genera una cadena de color RGB a partir de un nivel dado.
     * @param {number} level - Nivel de color (0-100).
     * @returns {string} - Cadena de color en formato RGB.
     */
    function makeColor(level) {
        if (typeof level === 'undefined') {
            level = 100;
        }
        level = 100 - parseInt(level, 10); // invertir
        return 'rgb(' + level + '%, ' + level + '%, ' + level + '%)';
    }

    /**
     * Función findParamValue: Busca el valor de un parámetro en función de su tipo.
     * @param {Object} p - Parámetro.
     * @returns {number|string} - Valor del parámetro.
     */
    function findParamValue(p) {
        if (p.type === 'word') {
            return variables[p.value];
        }
        return p.value;
    }

    // Definición de elementos SVG correspondientes a comandos específicos
    var elements = {
        'Linea': function (param, pen_color_value) {
            return {
                tag: 'line',
                attr: {
                    x1: findParamValue(param[0]),
                    y1: 100 - findParamValue(param[1]),
                    x2: findParamValue(param[2]),
                    y2: 100 - findParamValue(param[3]),
                    stroke: makeColor(pen_color_value),
                    'stroke-linecap': 'round'
                },
                body: []
            };
        },
        'Papel': function (param) {
            return {
                tag: 'rect',
                attr: {
                    x: 0,
                    y: 0,
                    width: 100,
                    height: 100,
                    fill: makeColor(findParamValue(param[0]))
                },
                body: []
            };
        }
    };

    // Estructura base del nuevo AST en formato SVG
    var newAST = {
        tag: 'svg',
        attr: {
            width: 100,
            height: 100,
            viewBox: '0 0 100 100',
            xmlns: 'http://www.w3.org/2000/svg',
            version: '1.1'
        },
        body: []
    };

    var current_pen_color;
    var variables = {};

    // Procesa los nodos del AST y construye el nuevo AST en formato SVG
    while (ast.body.length > 0) {
        var node = ast.body.shift();
        if (node.type === 'CallExpression' || node.type === 'VariableDeclaration') {
            if (node.name === 'Lapiz') {
                current_pen_color = findParamValue(node.arguments[0]);
            } else if (node.name === 'Set') {
                variables[node.identifier.value] = node.value.value;
            } else {
                var el = elements[node.name];
                if (!el) {
                    throw node.name + ' no es un comando válido.';
                }
                if (typeof !current_pen_color === 'undefined') {
                    // TODO: mensaje 'Debes definir Lapiz antes de dibujar Linea'
                }
                newAST.body.push(el(node.arguments, current_pen_color));
            }
        }
    }

    return newAST;
}

module.exports = transformer