var walkdir = require ('walkdir'),
    fs = require('fs'),
    Lexer = require('marked').Lexer,
    Parser = require('./parser.js');

walkdir('tests/fixtures', function (path, stat) {
    fs.readFile(path, function (readError, readStream) {
        var lexer = new Lexer(),
            parser = new Parser({
                // bullet: '+',
                // fixlistorder: false
            });

        parser.parse(lexer.lex(readStream.toString()));


        console.log(parser + '')
    });
});
