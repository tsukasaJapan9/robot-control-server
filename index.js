'use strict;'

const http = require('http');
const fs = require('fs');
const url = require('url');
const mqtt = require('mqtt');
const qs = require('querystring');
// const BlynkLib = require('blynk-library');
const client  = mqtt.connect('mqtt://localhost');

// blynk
// const blynk = new BlynkLib.Blynk(process.env.BLYNK_TOKEN);
// const v0 = new blynk.VirtualPin(0);
// const v1 = new blynk.VirtualPin(1);
// const v2 = new blynk.VirtualPin(2);
// const v3 = new blynk.VirtualPin(3);
  
// MQTT
client.subscribe('robot/event');
client.publish('robot/command', 'hello');

client.on('message', function (topic, message) {
    // message is Buffer
    console.log(message.toString());
});

function sendCommand(command) {
    switch (command) {
        case "forward":
            forward();
            break;
        case "backward":
            backward();
            break;
        case "right":
            right();
            break;
        case "left":
            left();
            break;
        default:
            break;
    }
}

function forward() {
    client.publish('robot/command', '1');
}

function backward() {
    client.publish('robot/command', '2');
}

function right() {
    client.publish('robot/command', '3');
}

function left() {
    client.publish('robot/command', '4');
}

// web server
const server = http.createServer((req, res) => {
    const now = new Date();
    console.info('[' + now + '] Requested by ' + req.connection.remoteAddress + " method: " + req.method);

    res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8'
    });

    let url = req.url;
    let tmp = url.split('.');
    let ext = tmp[tmp.length -1]
    let path = '.' + url;

    console.log(url)
    
    switch (req.method) {
        case 'GET':
            if (ext == '/') {
                const rs = fs.createReadStream('./index.html');
                rs.pipe(res);
            } else if (ext == 'js') {
                const rs = fs.createReadStream(path);
                rs.pipe(res);
            }
            break;
        case 'POST':
            let rawData = '';
            req.on('data', (chunk) => {
                rawData = rawData + chunk;
            }).on('end', () => {
                const decoded = decodeURIComponent(rawData);
                const command = qs.parse(decoded);
                console.log("command: " + command["command"]);
                sendCommand(command);
                res.end();
            });
            break;
        default:
            break;
    }
}).on('error', e => {
    console.error('[' + new Date() + '] Server error', e)       
}).on('clientError', e => {
    console.error('[' + new Date() + '] Client error', e)       
});

const port = process.env.PORT || 9999;
server.listen(port, () => {
    console.log('listening on ' + port)
});