/* jshint node: true */

var fs = require('fs');

var globby = require('globby');
var multistream = require('multistream');
var through = require('through2');

function parseOptions(options) {
    options = options || {};
    
    var gsOptions = {};
    
    if (!!options.appendNewLine) {
        gsOptions.appendNewLine = true;
        delete options.appendNewLine;
    }
    
    return {
        globOptions: options,
        gsOptions: gsOptions
    };
}

function newLineStream() {
    var temp = through();
    
    setTimeout(function() {
        temp.write('\n');
        temp.end();
    });
    
    return temp;
}

function buildStreams(files, appendNewLine) {
    var streams = [];
    var temp;
    
    files.forEach(function(file) {
        streams.push(fs.createReadStream(file));
        
        if (appendNewLine) {
            streams.push(newLineStream());
        }
    });
    
    return streams;
}

module.exports = function globStream(glob, options) {
    var output = through();
    
    var opts = parseOptions(options);
    
    globby(glob, opts.globOptions).then(function(files) {
        if (files.length) {
            var streams = buildStreams(files, opts.gsOptions.appendNewLine);
            multistream(streams).pipe(output);
        } else {
            output.end();
        }
    }).catch(function(err) {
        output.emit(err);
    });
    
    return output;
};
