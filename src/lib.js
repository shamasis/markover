/**
 * This module is intended to store all low level library functions. It is for best interest that the functions added
 * here are consise, performant and does not perform intelligent validation checks. This ensures that repeated use
 * of library functions are performant.
 *
 * @module lib
 * @private
 */
var E = '',
    S = ' ',
    STRING = 'string';

module.exports = {
    /**
     * @param {object} sink
     * @param {object} source
     * @returns {object}
     */
    extend: function (sink, source) {
        return Object.getOwnPropertyNames(source).forEach(function (property) {
            !(property in sink) &&
                Object.defineProperty(sink, property, Object.getOwnPropertyDescriptor(source, property));
        }), sink;
    },

    /**
     * @param {object} sink
     * @param {object} source
     * @returns {object}
     */
    copy: function (sink, source) {
        return Object.getOwnPropertyNames(source).forEach(function (property) {
            Object.defineProperty(sink, property, Object.getOwnPropertyDescriptor(source, property));
        }), sink;
    },

    /**
     * @param {string} text
     * @param {number} count
     * @returns {string}
     */
    stringrepeat: function (text, count) {
        var out = '';
        if (count > 0) {
            while (count--) {
                out += text;
            }
        }
        return out;
    },

    /**
     * @param {string} text
     * @returns {string}
     */
    stringclean: function (text) {
        return text.trim().replace(/\s+|\s?\n/g, S);
    },

    /**
     * Simple format function. Replaces construction of type “`{<number>}`” to the corresponding argument.
     *
     * @param {string} token
     * @param {...string} params
     * @returns {string}
     */
    stringformat: function(token, params) {
        var args = Array.isArray(params) ? [0].concat(params) : arguments;
        token && (typeof token === STRING) && args.length - 1 && (token = token.replace(/\{(\d+)\}/g, function(str, i) {
            return args[++i] === null ? E : args[i];
        }));
        return token || E;
    }
};
