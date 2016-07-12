# glob-filestream

[![Build][1]][2] [![Test Coverage][3]][4] [![Code Climate][5]][6] [![Downloads][7]][8] [![Version][9]][8] [![ISC License][10]][11]

[1]: https://travis-ci.org/catdad/glob-filestream.svg?branch=master
[2]: https://travis-ci.org/catdad/glob-filestream

[3]: https://codeclimate.com/github/catdad/glob-filestream/badges/coverage.svg
[4]: https://codeclimate.com/github/catdad/glob-filestream/coverage

[5]: https://codeclimate.com/github/catdad/glob-filestream/badges/gpa.svg
[6]: https://codeclimate.com/github/catdad/glob-filestream

[7]: https://img.shields.io/npm/dm/glob-filestream.svg
[8]: https://www.npmjs.com/package/glob-filestream

[9]: https://img.shields.io/npm/v/glob-filestream.svg

[10]: https://img.shields.io/npm/l/glob-filestream.svg
[11]: http://opensource.org/licenses/ISC

Reads a glob of files into a single stream.

## Install

    npm install --save glob-filestream
    
## Usage

Pass in a glob or array of globs, and get all of the matched content in one stream.

```javascript
var globfile = require('glob-filestream');

var stream = globfile('*.txt');

// read like a regular filestream

var data = [];

stream.on('data', function(chunk) {
    data.push(chunk);
});

stream.on('end', function() {
    console.log(Buffer.concat(data).toString());
});
```

Files will be read and piped as-is, but sometimes, you may want to separate individual files with a new line. You can use the options for that, as such:

```javascript
var stream = globfile('*.txt', {
    appendNewLine: true
});
```

Every once in a while, you might find the need to transform individual files as you read them. There is an option for that as well.

```javascript
var globfile = require('glob-filestream');
var ensureGunzip = require('ensure-gunzip');

var stream = globfile(['*.txt.gzip', '*.txt'], {
    transform: ensureGunzip
});

// read `stream`, containing all plain text files
```

Transform is a function that takes a `stream` as a parameter and returns a new stream. The identify transform function would look like this:

```javascript
function transform(stream) {
    return stream;
}
```

## License

[ISC](http://opensource.org/licenses/ISC)
