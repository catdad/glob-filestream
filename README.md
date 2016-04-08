# glob-filestream

[![Build Status](https://travis-ci.org/catdad/glob-filestream.svg?branch=master)](https://travis-ci.org/catdad/glob-filestream)

Reads a glob of files into a single stream.

## Install

    npm install --save glob-filestream
    
## Usage

Pass in a glob or array of globs, and get all of the matched content in one stream.

```javascript
var globfile = require('blob-filestream');

var stream = globfile('*.txt');

// read like it was a regular filestream

var data = [];

stream.on('data', function(chunk) {
    data.push(chunk);
});

stream.on('end', function() {
    console.log(Buffer.concat(data).toString());
});
```
