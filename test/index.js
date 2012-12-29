var expect = require('expect.js');
var Packit = require(__dirname + '/../');

var asset = function(name) {
  return __dirname + '/assets/' + name;
}

describe('packit', function() {
  describe('javascript', function() {
    var packit = new Packit({
      "simple": [asset("simple.js")],
      "js": [asset("simple.js"), asset("two.js")]
    })

    it('works on single file', function(done) {
      packit.get('simple', function(err, data) {
        if(err) return done(err);
        expect(data).to.eql('var one = 1;');
        done();
      })
    })

    it('works on multiple files', function(done) {
      packit.get('js', function(err, data) {
        if(err) return done(err);
        expect(data).to.eql('var one = 1;var two = 2;');
        done();
      })
    })
  })

  describe('custom converter', function() {
    var packit = new Packit({
      "tpl": [asset('simple.tpl')]
    })

    describe('without converstion', function() {
      it('renders raw', function(done) {
        packit.get('tpl', function(err, data) {
          if(err) return done(err);
          expect(data).to.eql('var one = 1;');
          done();
        })
      })
    })

    describe('with conversion', function() {
      it('converts', function(done) {
        packit.addConverter('.tpl', function(raw, cb) {
          cb(null, "ok");
        })

        packit.get('tpl', function(err, data) {
          if(err) return done(err);
          expect(data).to.eql('ok');
          done();
        })
      })
    })
  })
})