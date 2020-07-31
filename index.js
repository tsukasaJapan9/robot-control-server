'use strict;'

const http = require('http');
const fs = require('fs');
const url = require('url');

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
                const rs = fs.createReadStream('./offer.html');
                rs.pipe(res);
            } else if (ext == '/offer') {
                const rs = fs.createReadStream('./offer.html');
                rs.pipe(res);
            } else if (ext == '/answer') {
                const rs = fs.createReadStream('./answer.html');
                rs.pipe(res);
            } else if (ext == '/ble') {
                const rs = fs.createReadStream('./ble.html');
                rs.pipe(res);
            } else if (ext == 'js') {
                const rs = fs.createReadStream(path);
                rs.pipe(res);
            } else if (ext == 'css') {
                const rs = fs.createReadStream(path);
                rs.pipe(res);
            }
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