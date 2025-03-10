const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');


// TWILIO NI DIRI PARA SA SMS NOTIFICATION 
const twilio = require('twilio');
const accountSid = "ACb47918b9fc2cc86a792b2cd24281a3f0";
const authToken = "15a79e1fd79b3dc19c3ff117769c1c84";
const client = twilio(accountSid, authToken);





//pagkuha sa extension sa static files
function getContentType(ext) {
    switch (ext) {
        case '.html': return 'text/html';
        case '.css': return 'text/css';
        case '.js': return 'application/javascript';
        case '.jpg':
        case '.jpeg': return 'image/jpeg';
        case '.png': return 'image/png';
        case '.gif': return 'image/gif';
        case '.svg': return 'image/svg+xml';
        case '.ico': return 'image/x-icon';
        case '.json': return 'application/json';
        default: return 'application/octet-stream';
    }
}


//pag set up sa server
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);

    if (req.method === 'POST' && parsedUrl.pathname === '/send-sms') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString(); 
        });

        req.on('end', () => {
            try {
                const { contact, messageBody } = JSON.parse(body);
                client.messages.create({
                    body: messageBody,
                    from: "+14433643260",
                    to: "+63" + contact,
                })
                .then((message) => {
                    // console.log('Message SID:', message.sid);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, messageSid: message.sid }));
                })
                .catch((error) => {
                    console.error('Error sending SMS:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: error.message }));
                });
            } catch (error) {
                console.error("Error parsing request body:", error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: "Invalid JSON data" }));
            }
        });
    } else {
        let filePath = parsedUrl.pathname === '/' ? '/index.html' : parsedUrl.pathname;
        const fullPath = path.join(__dirname, filePath);

        fs.access(fullPath, fs.constants.F_OK, (err) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                fs.createReadStream(path.join(__dirname, '/404.html')).pipe(res);
            } else {
                const extname = path.extname(fullPath);
                const contentType = getContentType(extname);

                res.writeHead(200, { 'Content-Type': contentType });
                fs.createReadStream(fullPath).pipe(res);
            }
        });
    }
});



// pag start sa server 
server.listen(3000, () => {
    console.log("Server running on port 3000");
});
