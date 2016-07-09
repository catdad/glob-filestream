/* jshint node: true, mocha: true */

var expect = require('chai').expect;
var es = require('event-stream');
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
        
        runPositiveTests();
    });
    
});
