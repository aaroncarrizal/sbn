/**
 * Función parser: Convierte una secuencia de tokens en un árbol de sintaxis abstracta (AST).
 * @param {Array} tokens - Un array de objetos que representan los tokens del código fuente.
 * @returns {Object} - Un objeto que representa el AST generado.
 */
function parser(tokens) {
    /**
     * Función expectedTypeCheck: Verifica si el tipo actual coincide con el tipo esperado.
     * @param {string} type - Tipo actual del token.
     * @param {string|Array} expect - Tipo esperado o un array de tipos esperados.
     * @returns {boolean} - true si hay coincidencia, false de lo contrario.
     */
    function expectedTypeCheck(type, expect) {
        if (Array.isArray(expect)) {
            var i = expect.indexOf(type);
            return i >= 0;
        }
        return type === expect;
    }

    /**
     * Función createDot: Crea un nodo "dot" a partir de tokens.
     * @param {Object} current_token - Token actual.
     * @param {number} currentPosition - Posición actual en la secuencia de tokens.
     * @param {Object} node - Nodo actual que se está construyendo.
     * @returns {Object} - Nodo "dot" creado.
     */
    function createDot(current_token, currentPosition, node) {
        var expectedType = ['ob', 'number', 'number', 'cb'];
        var expectedLength = 4;
        currentPosition = currentPosition || 0;
        node = node || { type: 'dot' };

        if (currentPosition < expectedLength - 1) {
            if (expectedTypeCheck(current_token.type, expectedType[currentPosition])) {
                if (currentPosition === 1) {
                    node.x = current_token.value;
                }
                if (currentPosition === 2) {
                    node.y = current_token.value;
                }
                currentPosition++;
                createDot(tokens.shift(), currentPosition, node);
            } else {
                throw 'Esperando ' + expectedType[currentPosition] + ' pero se encontró ' + current_token.type + '.';
            }
        }
        return node;
    }

    /**
     * Función findArguments: Busca y valida los argumentos esperados para un comando.
     * @param {string} command - Nombre del comando.
     * @param {number} expectedLength - Longitud esperada de los argumentos.
     * @param {Array} expectedType - Tipos esperados para cada argumento.
     * @param {number} currentPosition - Posición actual en la secuencia de tokens.
     * @param {Array} currentList - Lista actual de argumentos que se están construyendo.
     * @returns {Array} - Lista de argumentos validada.
     */
    function findArguments(command, expectedLength, expectedType, currentPosition, currentList) {
        currentPosition = currentPosition || 0;
        currentList = currentList || [];
        while (expectedLength > currentPosition) {
            var token = tokens.shift();
            if (!token) {
                throw command + ' toma ' + expectedLength + ' argumento(s). ';
            }

            if (expectedType) {
                var expected = expectedTypeCheck(token.type, expectedType[currentPosition]);
                if (!expected) {
                    throw command + ' toma ' + JSON.stringify(expectedType[currentPosition]) + ' como argumento ' + (currentPosition + 1) + '. ' + (token ? 'Pero se encontró a ' + token.type + ' ' + (token.value || '') + '.' : '');
                }
                if (token.type === 'number' && (token.value < 0 || token.value > 100)) {
                    throw 'Valor encontrado ' + token.value + ' por ' + command + '. El valor debe estar entre 0 - 100.';
                }
            }

            var arg = {
                type: token.type,
                value: token.value
            };
            if (token.type === 'ob') {
                arg = createDot(token);
            }
            currentList.push(arg);
            currentPosition++;
        }
        return currentList;
    }

    // Inicialización del AST
    var AST = {
        type: 'Drawing',
        body: []
    };
    var paper = false;
    var pen = false;

    // Procesa los tokens y construye el AST
    while (tokens.length > 0) {
        var current_token = tokens.shift();
        if (current_token.type === 'word') {
            switch (current_token.value) {
                case '{':
                    var block = {
                        type: 'Block Start'
                    };
                    AST.body.push(block);
                    break;
                case '}':
                    var block = {
                        type: 'Block End'
                    };
                    AST.body.push(block);
                    break;
                case '//':
                    var expression = {
                        type: 'CommentExpression',
                        value: ''
                    };
                    var next = tokens.shift();
                    while (next.type !== 'newline') {
                        expression.value += next.value + ' ';
                        next = tokens.shift();
                    }
                    AST.body.push(expression);
                    break;
                case 'Papel':
                    if (paper) {
                        throw 'No puedes definir Papel más de una vez';
                    }
                    var expression = {
                        type: 'CallExpression',
                        name: 'Papel',
                        arguments: []
                    };
                    var args = findArguments('Papel', 1);
                    expression.arguments = expression.arguments.concat(args);
                    AST.body.push(expression);
                    paper = true;
                    break;
                case 'Lapiz':
                    var expression = {
                        type: 'CallExpression',
                        name: 'Lapiz',
                        arguments: []
                    };
                    var args = findArguments('Lapiz', 1);
                    expression.arguments = expression.arguments.concat(args);
                    AST.body.push(expression);
                    pen = true;
                    break;
                case 'Linea':
                    if (!paper) {
                        // TODO: No hay mensaje de error 'Debes crear Papel primero'
                    }
                    if (!pen) {
                        // TODO: No hay mensaje de error 'Debes definir Lapiz primero'
                    }
                    var expression = {
                        type: 'CallExpression',
                        name: 'Linea',
                        arguments: []
                    };
                    var args = findArguments('Linea', 4);
                    expression.arguments = expression.arguments.concat(args);
                    AST.body.push(expression);
                    break;
                case 'Set':
                    var args = findArguments('Set', 2, [['word', 'ob'], 'number']);
                    var obj = {};
                    if (args[0].type === 'dot') {
                        AST.body.push({
                            type: 'CallExpression',
                            name: 'Lapiz',
                            arguments: [args[1]]
                        });
                        obj.type = 'CallExpression';
                        obj.name = 'Linea';
                        obj.arguments = [
                            { type: 'number', value: args[0].x },
                            { type: 'number', value: args[0].y },
                            { type: 'number', value: args[0].x },
                            { type: 'number', value: args[0].y }
                        ];
                    } else {
                        obj.type = 'VariableDeclaration';
                        obj.name = 'Set';
                        obj.identifier = args[0];
                        obj.value = args[1];
                    }

                    AST.body.push(obj);
                    break;
                default:
                    throw current_token.value + ' no es un comando válido';
            }
        } else if (['newline', 'ocb', 'ccb'].indexOf[current_token.type] < 0) {
            throw 'Token inesperado de tipo: ' + current_token.type;
        }
    }

    return AST;
}

module.exports = parser