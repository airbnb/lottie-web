var childProcess = require('child_process');
var watch = require('watch')

function runScript(scriptPath, processArguments, callback) {

    // keep track of whether callback has been invoked to prevent multiple invocations
    var invoked = false;

    var process = childProcess.fork(scriptPath, processArguments);

    // listen for errors as they may prevent the exit event from firing
    process.on('error', function (err) {
        if (invoked) return;
        invoked = true;
        callback(err);
    });

    // execute the callback once the process has finished running
    process.on('exit', function (code) {
        if (invoked) return;
        invoked = true;
        var err = code === 0 ? null : new Error('exit code ' + code);
        callback(err);
    });

}


  watch.watchTree(`${__dirname}\\..\\player\\js\\`, function (f, curr, prev) {
    runScript(`${__dirname}\\build.js`, ["reduced"], function (err) {
        if (err) throw err;
        console.log('finished running some-script.js');
    });
  })