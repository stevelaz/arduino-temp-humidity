var SerialPort = require("serialport").SerialPort;
var serial = new SerialPort("/dev/ttyUSB0", { baudrate: 115200 });

var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');

serial.open(function(error) {
    if (error) {
        console.log('failed to open: ' + error);
    } else {
        console.log('Opened serial port.');
        var begin = false;
        var end = false;
        var data_str = "";

        serial.on('data', function(data) {
            var str = data.toString();
            for (i=0; i<str.length; i++) {
                var c = str[i];
                data_str += c;
                if (c == "{") { begin = true; }
                if (c == "}") { end = true; }

                if (begin == true && end == true) {
                    io.emit('sensor_data', data_str);
                    console.log("Got: " + data_str);
                    data_str = "";
                    begin = false;
                    end = false;
                }
            }
        });
    }
});

app.listen(8080);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

