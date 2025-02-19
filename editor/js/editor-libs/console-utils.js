module.exports = {
    /**
     * Formats arrays:
     * - quotes around strings in arrays
     * - square brackets around arrays
     * - adds commas appropriately (with spacing)
     * designed to be used recursively
     * @param {any} input - The output to log.
     * @returns Formatted output as a string.
     */
    formatArray: function (input) {
        'use strict';
        var output = '';
        for (var i = 0, l = input.length; i < l; i++) {
            if (typeof input[i] === 'string') {
                output += '"' + input[i] + '"';
            } else if (Array.isArray(input[i])) {
                output += 'Array [';
                output += this.formatArray(input[i]);
                output += ']';
            } else {
                output += this.formatOutput(input[i]);
            }

            if (i < input.length - 1) {
                output += ', ';
            }
        }
        return output;
    },
    /**
     * Formats objects:
     * ArrayBuffer, DataView, SharedArrayBuffer,
     * Int8Array, Int16Array, Int32Array,
     * Uint8Array, Uint16Array, Uint32Array,
     * Uint8ClampedArray, Float32Array, Float64Array
     * Symbol
     * @param {any} input - The output to log.
     * @returns Formatted output as a string.
     */
    formatObject: function (input) {
        ('use strict');
        var bufferDataViewRegExp = /^(ArrayBuffer|SharedArrayBuffer|DataView)$/;
        var complexArrayRegExp = /^(Int8Array|Int16Array|Int32Array|Uint8Array|Uint16Array|Uint32Array|Uint8ClampedArray|Float32Array|Float64Array|BigInt64Array|BigUint64Array)$/;

        var objectName = input.constructor ? input.constructor.name : input;

        if (objectName === 'String') {
            // String object
            return `String { "${input.valueOf()}" }`;
        }

        if (input === JSON) {
            // console.log(JSON) is outputed as "JSON {}" in browser console
            return `JSON {}`;
        }

        if (objectName.match && objectName.match(bufferDataViewRegExp)) {
            return objectName + ' {}';
        }

        if (objectName.match && objectName.match(complexArrayRegExp)) {
            var arrayLength = input.length;

            if (arrayLength > 0) {
                return objectName + ' [' + this.formatArray(input) + ']';
            } else {
                return objectName + ' []';
            }
        }

        if (objectName === 'Symbol' && input !== undefined) {
            return input.toString();
        }

        if (objectName === 'Object') {
            var formattedChild = '';
            var start = true;
            for (var key in input) {
                if (input.hasOwnProperty(key)) {
                    if (start) {
                        start = false;
                    } else {
                        formattedChild = formattedChild + ', ';
                    }
                    formattedChild =
                        formattedChild +
                        key +
                        ': ' +
                        this.formatOutput(input[key]);
                }
            }
            return objectName + ' { ' + formattedChild + ' }';
        }

        // Special object created with `OrdinaryObjectCreate(null)` returned by, for
        // example, named capture groups in https://mzl.la/2RERfQL
        // @see https://github.com/mdn/bob/issues/574#issuecomment-858213621
        if (!objectName.constructor || !objectName.prototype) {
            var formattedChild = '';
            var start = true;
            for (var key in input) {
                if (start) {
                    start = false;
                } else {
                    formattedChild = formattedChild + ', ';
                }
                formattedChild =
                    formattedChild + key + ': ' + this.formatOutput(input[key]);
            }
            return 'Object { ' + formattedChild + ' }';
        }

        return input;
    },
    /**
     * Formats output to indicate its type:
     * - quotes around strings
     * - single quotes around strings containing double quotes
     * - square brackets around arrays
     * (also copes with arrays of arrays)
     * does NOT detect Int32Array etc
     * @param {any} input - The output to log.
     * @returns Formatted output as a string.
     */
    formatOutput: function (input) {
        'use strict';
        if (
            input === undefined ||
            input === null ||
            typeof input === 'boolean'
        ) {
            return String(input);
        } else if (typeof input === 'number') {
            // Negative zero
            if (Object.is(input, -0)) {
                return '-0';
            }
            return String(input);
        } else if (typeof input === 'bigint') {
            return String(input) + 'n';
        } else if (typeof input === 'string') {
            // string literal
            if (input.includes('"')) {
                return "'" + input + "'";
            } else {
                return '"' + input + '"';
            }
        } else if (Array.isArray(input)) {
            // check the contents of the array
            return 'Array [' + this.formatArray(input) + ']';
        } else {
            return this.formatObject(input);
        }
    },
    /**
     * Writes the provided content to the editor’s output area
     * @param {String} content - The content to write to output
     */
    writeOutput: function (content) {
        'use strict';
        var output = document.querySelector('#console code');
        var outputContent = output.textContent;
        var newLogItem = '> ' + content + '\n';
        output.textContent = outputContent + newLogItem;
    },
};
