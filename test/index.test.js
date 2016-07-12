/* jshint node: true, mocha: true */

var expect = require('chai').expect;
var es = require('event-stream');
var through = require('through2');
var mock = require('mock-fs');

var globStream = require('../index');

describe('[GlobStream]', function() {
    
    function runPositiveTests() {
        it('returns a single stream', function() {
            var stream = globStream('fixtures/not.txt');

            // expect that it is stream-like
            expect(stream).to.have.property('readable').and.to.equal(true);
            expect(stream).to.have.property('pipe').and.to.be.a('function');
            expect(stream).to.have.property('read').and.to.be.a('function');
            expect(stream).to.have.property('on').and.to.be.a('function');
        });

        it('takes a single glob', function(done) {
            var stream = globStream('fixtures/*.txt');

            stream.pipe(es.wait(function(err, data) {
                expect(data.toString()).to.equal('onetwo');
                done();
            }));
        });

        it('takes an array of globs', function(done) {
            var stream = globStream(['fixtures/one.txt', 'fixtures/two.txt']);

            stream.pipe(es.wait(function(err, data) {
                expect(data.toString()).to.equal('onetwo');
                done();
            }));
        });
        
        it('ends when no data are matches', function(done) {
            var stream = globStream('fixtures/not.txt');

            stream.pipe(es.wait(function(err, data) {
                expect(data.toString()).to.equal('');
                done();
            }));
        });

        it('allows for placing a newline between files', function(done) {
            var stream = globStream('fixtures/*.txt', {
                appendNewLine: true
            });

            stream.pipe(es.wait(function(err, data) {
                expect(data.toString()).to.equal('one\ntwo\n');
                done();
            }));
        });
        
        it('can transform the stream with an optional parameter', function(done) {
            function transform(stream) {
                var out = through();
                
                setImmediate(function() {
                    out.write('not ');
                    stream.pipe(out);
                });
                
                return out;
            }
            
            var stream = globStream('fixtures/one.txt', {
                transform: transform
            });
            
            stream.pipe(es.wait(function(err, data) {
                expect(data.toString()).to.equal('not one');
                done();
            }));
        });
    
    }
    
    describe('using real fixtures:', function() {
        runPositiveTests();
    });
    
    describe('using mock files:', function() {
        
        beforeEach(function() {
            mock({
                'fixtures/one.txt': 'one',
                'fixtures/two.txt': 'two',
                'errors/none.txt': 'none',
                'errors/perm.txt': mock.file({
                    content: 'secrets',
                    mode: 0111
                })
            });
        });
        
        afterEach(function() {
            mock.restore();
        });
        
        var noop = function() {};
        
        runPositiveTests();
        
        it('handles file read errors when reading a single file', function(done) {
            var stream = globStream('errors/perm.txt');

            stream.on('error', function(err) {
                expect(err).to.have.property('code').and.to.equal('EACCES');
                done();
            });
            stream.on('data', noop);
            stream.on('end', function() {
                throw new Error('out stream should not end in this test');
            });
        });
        
        it('handles file read errors when reading multiple files', function(done) {
            var stream = globStream('errors/*.txt', {
                appendNewLine: true
            });

            stream.on('error', function(err) {
                expect(err).to.have.property('code').and.to.equal('EACCES');
                done();
            });
            stream.on('data', noop);
            stream.on('end', function() {
                throw new Error('out stream should not end in this test');
            });
        });
        
        it.skip('emits an error if the glob parameters are incorrect', function(done) {
            var stream = globStream([null]);
            
            stream.on('data', noop);
            stream.on('error', function(err) {
                expect(err).to.be.an('error');
                done();
            });
            stream.on('end', function() {
                throw new Error('out stream should not end in this test');
            });
        });
    });
    
});
