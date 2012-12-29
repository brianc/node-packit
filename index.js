var fs = require('fs');
var path = require('path');

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

var Packit = function(config) {
  this.config = config;
  this.converters = [];
}

var async = require('async');
Packit.prototype.get = function(name, cb) {
  var files = this.config[name];
  var self = this;
  async.map(files, function(file, cb) {
    fs.readFile(file, 'utf8', function(err, text) {
      if(err) cb(err);
      for(var i = 0; i < self.converters.length; i++) {
        var converter = self.converters[i];
        if(converter.matches(file)) {
          return converter.convert(text, cb);
        }
      }
      return cb(null, text.trim());
    })
  }, function(err, all) {
    cb(err, all.join(''));
  })
}

Packit.prototype.addConverter = function(extension, fn) {
  this.converters.push(new Converter(extension, fn));
}

module.exports = Packit;
