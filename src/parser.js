/**
 * This module contains the codes for Marked Lexer generated MarkDown AST to Markdown Parser.
 * @module parser
 * @requires lib
 */
var E = '',
    S = ' ',
    DOT = '.',

    lib = require('./lib.js'),
    wordwrap = require('wordwrap'),

    extend = lib.extend,
    copy = lib.copy,
    stringclean = lib.stringclean,
    stringrepeat = lib.stringrepeat,

    Parser; // function

/**
 * @constructor
 * @param {Parser.options} options
 */
Parser = function (options) {
    this.options = extend(options || {}, Parser.options);
    this.reset();

};

/**
 * @type {Object}
 */
Parser.options = {
    maxlength: 120,
    baseindent: 0,
    eol: '\n',
    indentsize: 4,
    bullet: '-',
    fixlistorder: true
};

/**
 * @param {array} tokens
 * @param {object=} [options]
 * @returns {Parser}
 */
Parser.parse = function (tokens, options) {
    return (new Parser(options)).parse(tokens);
};


/**
 * @returns {string}
 */
Parser.prototype.toString = function () {
    return this.buffer();
};

/**
 *
 * @param {array} tokens
 * @returns {string}
 */
Parser.prototype.parse = function (tokens) {
    //console.log(tokens); return;
    return this.reset(), tokens.forEach(this.parseToken, this), this.toString();
};

/**
 * @private
 *
 * @param {string=...} [content]
 * @returns {string}
 */
Parser.prototype.buffer = function () {
    return Array.prototype.forEach.call(arguments, function (content) {
        content && content.toString() && (this._buffer += content.toString());
    }, this), this._buffer;
};

/**
 * @private
 * @returns {Parser}
 */
Parser.prototype.reset = function () {
    return copy(this, {
        _buffer: E,
        prebuffer: [],

        outputbuffer: E,

        listindent: 0,
        listdepth: 0,
        listmode: [],

        quoteindent: 0
    });
};

/**
 * @private
 * @param {object} token
 */
Parser.prototype.parseToken = function (token) {
    var eol = this.options.eol,

        doindent = ((this.listindent || 1) - 1) * 4,
        outqueue = E;

    switch (token.type) {
        case 'space':
            this.buffer(eol);
        break;

        case 'hr':
            /** @todo full hr or three-dash one? config maybe? */
            this.buffer(stringrepeat('-', this.options.maxlength), eol, eol);
        break;

        case 'heading':
            this.buffer(stringrepeat('#', token.depth), S, stringclean(token.text), eol, eol);
        break;

        case 'text':
        case 'paragraph':
            doindent += this.options.baseindent + (this.quoteindent ? this.quoteindent + 1 : 0);
            this.listindent && (doindent + (this.listindent - 1) * 2);

            outqueue = this.prebuffer.join(E);
            doindent += outqueue.length;

            outqueue = wordwrap(doindent, this.options.maxlength)(stringclean(token.text))
                .replace(new RegExp('^(\\s*)?\\s{' + (outqueue.length) + '}', 'g'), '$1' + outqueue);

            this.prebuffer.length && (this.prebuffer.length = 0);

            if (this.quoteindent) {
                outqueue = outqueue.replace(new RegExp('(^|\n)\\s{' + this.quoteindent + '}', 'g'), '$1' +
                    stringrepeat('>', this.quoteindent));
            }

            this.buffer(outqueue, eol);
            !this.listindent && !this.quoteindent && this.buffer(eol);

        break;

        case 'list_start':
            this.listindent++;
            this.listmode.unshift(token.ordered ? 1 : 0);
        break;

        case 'list_end':
            this.listindent--;
            this.listmode.shift();
        break;

        case 'loose_item_start':
        case 'list_item_start':
            this.prebuffer.push((this.listmode[0] ? (this.listmode[0]) + DOT : this.options.bullet) + S);
            this.listdepth++;
            this.options.fixlistorder && this.listmode[0] && (this.listmode[0]++);
        break;

        case 'list_item_end':
            this.listdepth--;
        break;

        case 'blockquote_start':
            this.quoteindent++;
        break;

        case 'blockquote_end':
            this.quoteindent--;
            !this.quoteindent && this.buffer(eol);
        break;

        case 'code':
            /** @todo do code formatting on token.text here */
            this.buffer('```', eol, token.text, eol, '```', eol, eol);

        break;

        case 'html':
            this.buffer(token.text.replace(/\n*$/, E), eol);
            this._lastToken && this._lastToken.type !== token.type && this.buffer(eol);
        break;

        case 'table':
        default:
            console.log('Unknown token %s', token.type, token);
    }

    this._lastToken = token;
};

module.exports = Parser;
