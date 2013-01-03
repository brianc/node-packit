var expect = require('expect.js');
var Packit = require(__dirname + '/../lib');

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

  describe('converting non-existing package', function() {
    var packit = new Packit({});
    it('raises error', function(done) {
      packit.get('asdf', function(err, text) {
        expect(err).to.not.be(null)
        expect(err instanceof Error).to.be.ok();
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
        packit.use('.tpl', function(raw, cb) {
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

  describe('adding converter object', function() {
    var everythingConverter = {
      matches: function(filename) {
        return true;
      },
      convert: function(text, cb) {
        cb(null, 'YES');
      }
    };
  
    it('adds', function() {
      var packit = new Packit();
      var origLength = packit.converters.length;
      packit.use(everythingConverter);
      expect(packit.converters.length).to.be.greaterThan(origLength);
    })

    it('converts', function(done) {
      var packit = new Packit({
        'test': [asset('two.js')]
      });
      packit.use(everythingConverter);
      packit.get('test', function(err, text) {
        if(err) return done(err);
        expect(text).to.eql('YES');
        done();
      })
    })
  })

  describe('multiple matching converters', function() {
    var packit = new Packit({
      test: [asset('two.js')]
    });
    packit.use({
      matches: function() { return true; },
      convert: function(text, cb) {
        return cb(null, text.toUpperCase());
      }
    });

    packit.use({
      matches: function() { return true; },
      convert: function(text, cb) {
        return cb(null, text.replace('2','3').trim());
      }
    });

    it('uses all converters', function(done) {
      packit.get('test', function(err, txt) {
        if(err) return done(err);
        expect(txt).to.eql('VAR TWO = 3;');
        done();
      })
    })
  })
})
