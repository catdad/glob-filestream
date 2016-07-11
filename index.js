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
        // instead of opening all files at once,
        // we will wait and open them one at a time
        // as they are ready to be read
        streams.push(function() {
            return fs.createReadStream(file);
        });
        
        if (appendNewLine) {
            streams.push(function() {
                return newLineStream();
            });
        }
    });
    
    return streams;
}

module.exports = function globStream(glob, options) {
    var output = through();
    
    var opts = parseOptions(options);
    
    globby(glob, opts.globOptions).then(function(files) {
        if (!files.length) {
            return output.end();
        }
        
        var streams = buildStreams(files, opts.gsOptions.appendNewLine);
        multistream(streams).on('error', function() {
            // multistream will already handle errors from all
            // of the streams it combines, so here, we will
            // re-emit the error on the actual output stream
            var args = [].slice.call(arguments);
            output.emit.apply(output, ['error'].concat(args));
        }).pipe(output);
    }).catch(function(err) {
        output.emit(err);
    });
    
    return output;
};
