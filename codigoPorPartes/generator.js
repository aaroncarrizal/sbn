/**
 * Función generator: Convierte una representación estructurada de SVG en una cadena SVG.
 * @param {Object} ast - Representación estructurada de SVG.
 * @returns {string} - Cadena SVG resultante.
 */
function generator(ast) {
    /**
     * Función traverseSvgAst: Recorre la representación estructurada de SVG y genera una cadena SVG.
     * @param {Object|Array} obj - Nodo o array de nodos de la representación estructurada de SVG.
     * @param {Array} parent - Pila de elementos padre para mantener la estructura jerárquica.
     * @param {Array} rest - Pila de nodos restantes para procesar.
     * @param {string} text - Cadena SVG resultante.
     * @returns {string} - Cadena SVG resultante.
     */
    function traverseSvgAst(obj, parent, rest, text) {
        parent = parent || [];
        rest = rest || [];
        text = text || '';

        // Convierte el nodo en un array si no lo es
        if (!Array.isArray(obj)) {
            obj = [obj];
        }

        while (obj.length > 0) {
            var currentNode = obj.shift();
            var body = currentNode.body || '';
            var attr = Object.keys(currentNode.attr).map(function (key) {
                return key + '="' + currentNode.attr[key] + '"';
            }).join(' ');

            text += parent.map(function () {
                return '\t';
            }).join('') + '<' + currentNode.tag + ' ' + attr + '>';

            if (currentNode.body && Array.isArray(currentNode.body) && currentNode.body.length > 0) {
                text += '\n';
                parent.push(currentNode.tag);
                rest.push(obj);
                return traverseSvgAst(currentNode.body, parent, rest, text);
            }

            text += body + '</' + currentNode.tag + '>\n';
        }

        while (rest.length > 0) {
            var next = rest.pop();
            var tag = parent.pop();
            text += parent.map(function () {
                return '\t';
            }).join('') + '</' + tag + '>\n';
            if (next.length > 0) {
                traverseSvgAst(next, parent, rest, text);
            }
        }

        return text;
    }

    return traverseSvgAst(ast);
}

module.exports = generator