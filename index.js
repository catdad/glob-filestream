/* jshint node: true */

var fs = require('fs');

var globby = require('globby');
var multistream = require('multistream');
var through = require('through2');

module.exports = function globStream(glob, options) {
    var output = through();
    
    globby(glob, options).then(function(files) {
        if (files.length) {
            var streams = files.map(function(file) {
                return fs.createReadStream(file);
            });
            
            multistream(streams).pipe(output);
        } else {
            output.end();
        }
    }).catch(function(err) {
        output.emit(err);
    });
    
    return output;
};
