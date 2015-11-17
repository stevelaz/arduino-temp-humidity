var express = require('express');
var SerialPort = require("serialport").SerialPort;
var serial = new SerialPort("/dev/ttyUSB0", { baudrate: 115200 });
var fs = require('fs');
var app = express();

serial.open(function(error) {
    if (error) {
        console.log('failed to open: ' + error);
    } else {
        console.log('Opened serial port.');
        var json_begin = false;
        var json_end = false;
        var json_data_str = "";

        serial.on('data', function(data) {
            var str = data.toString();
            for (i=0; i<str.length; i++) {
                var c = str[i];
                json_data_str += c;
                if (c == "{") { json_begin = true; }
                if (c == "}") { json_end = true; }

                /* Do we have a full json object from the serial port? */
                if (json_begin == true && json_end == true) {
                    var d = new Date();
                    console.log(d.getTime() + " - " + json_data_str);
                    io.emit('sensor_data', json_data_str);
                    json_data_str = "";
                    json_begin = false;
                    json_end = false;
                }
            }
        });
    }
});

app.use(express.static('public'));
app.get('/', function (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index');
    }

    res.writeHead(200);
    res.end(data);
  });
});

var server = app.listen(8080, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Listening at http://%s:%s', host, port);
});
var io = require('socket.io')(server);
