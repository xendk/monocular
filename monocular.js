
var split = require('split');
var fs = require('fs');
var Eyes = require('eyes.images').Eyes;

var package = require('./package.json');

var opts = require('nomnom')
  .options(
    {
      file: {
        position: 0,
        help: 'File to read',
        required: false
      },
      delete: {
        abbr: 'd',
        flag: true,
        help: 'Delete images after processing'
      },
      simulate: {
        abbr: 'n',
        flag: true,
        help: 'Simulate submission to Applitools'
      }
    }
  )
  .parse();

process.stdin.setEncoding('utf8');

var input = process.stdin;

if (opts.file) {
  input = fs.createReadStream(opts.file);
}

var eyes = new Eyes(false, opts.simulate ? true : false);
var eyesPromise;

var handleMessage = function(data) {
  if (typeof data.cmd === 'undefined') {
    // do nothing.
    return;
  }

  switch (data.cmd) {
  case 'init':
    var apiKey = data.apiKey || '';
    eyes.setApiKey(apiKey);
    var os = data.os || '';
    eyes.setOs(os);
    var browser = data.browser || '';
    eyes.setHostingApp(browser);
    break;

  case 'open':
    var appName = data.appName || '';
    var testName = data.testName || '';
    // We're not implementing imageSize.
    eyesPromise = eyes.open(appName, testName, {width: 800, height: 600});
    break;

  case 'image':
    var file = data.file || '';
    var tag = data.tag || '';
    eyesPromise = eyesPromise.then(function () {
      var imageData = fs.readFileSync(file);
      return eyes.checkImage(imageData, tag);
    });
    if (opts.delete) {
      eyesPromise = eyesPromise.then(function () {
        fs.unlinkSync(file);
      });
    }
    break;

  case 'end':
    eyesPromise.then(function () {
      return eyes.close(false);
    },function () {
        return eyes.abortIfNotClosed();
    })
    .then(function (results) {
      var status = (results.isPassed ? 'OK' : 'FAIL');
      if (!results.isPassed && results.isNew) {
        status = 'NEW';
      }

      console.log('Result: ' + status + ' ' + results.url);
      if (!results.isPassed) {
        process.exit(20);
      }
    })
      .catch(function (err) {console.log('Error: ' + err);});
    break;
  }
};

input.pipe(split(JSON.parse))
  .on('data', function (obj) {
    //each chunk now is a a js object
    try {
      handleMessage(obj);
    }
    catch (e) {
      console.log(e.message);
      eyes.abortIfNotClosed(function () {
        process.exit(1);
      });
    }
  })
  //.on('close', function () { console.log('close');})
  .on('error', function (err) {
    // We'll just quietly gobble these up.
    if (err.message !== 'Unexpected end of input') {
      throw err;
    }
  });


// process.stdin.on('end', function() {
//   process.stdout.writenl('end');
// });
