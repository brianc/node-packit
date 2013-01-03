var fs = require('fs');

var async = require('async');

var Converter = require(__dirname + '/converter');

var Packit = function(config) {
  this.config = config;
  this.converters = [Converter.empty];
}

var readFile = function(filename, cb) {
  fs.readFile(filename, 'utf8', function(err, text) {
    cb(err, {
      name: filename,
      text: text
    })
  })
}

//find available converters for each file
var filterConverters = function(file, converters) {
  var start = function(cb) { cb(null, file.text); }
  var result = [start];
  for(var i = 0; i < converters.length; i++) {
    var converter = converters[i];
    if(converter.matches(file.name)) {
      result.push(converter.convert.bind(converter));
    }
  }
  return result;
}


Packit.prototype._convert = function(file, cb) {
  async.waterfall(filterConverters(file, this.converters), cb);
}

Packit.prototype.get = function(name, cb) {
  var files = this.config[name];
  if(!files) {
    return cb(new Error("Cannot find package with name " + name));
  }
  var convert = this._convert.bind(this);
  //read files
  async.mapSeries(files, readFile, function(err, all) {
    //convert the files
    async.mapSeries(all, convert, function endConvert(err, converted) {
      //return the joined results of the files
      cb(err, (converted||[]).join(''));
    })
  })
}

//allow either an extension check + convert function
//or an object which conforms to the converter interface
Packit.prototype.use = function(extension, fn) {
  this.converters.unshift('string' === typeof extension ? new Converter(extension, fn) : extension);
}

module.exports = Packit;
