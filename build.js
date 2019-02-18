var ncp = require('ncp').ncp;
var fs = require('fs-extra')

var dir = '../bpdc-statics/src/main/resources/'
fs.removeSync(dir)

ncp('./dist/', dir, function (err) {
  if (err) {
    return console.error(err);
  }
  console.log('Copying files complete.');
});
