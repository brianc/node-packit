var path = require('path');

//interface for a converter is something
//which responds to bool matches(filename)
//and responds to convert(text, cb[err, convertedText])
var Converter = function(extension, fn) {
  this.extension = extension;
  this.fn = fn;
}

Converter.prototype.convert = function(text, cb) {
  this.fn(text, cb);
}

Converter.prototype.matches = function(file) {
  var extension = path.extname(file);
  return extension === this.extension;
}

Converter.empty = {
  matches: function() {
    return true;
  },
  convert: function(text, cb) {
    cb(null, text.trim());
  }
}

module.exports = Converter;
