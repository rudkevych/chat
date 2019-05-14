const express = require('express');
const app = express();
const path = require('path');

const server = require('http').Server(app);
const io = require('socket.io')(server, {serverClient: true});


app.get('/', function (req, res) {
    res.sendFile('index.html', { root: __dirname });
});

io.on('connection', function (socket) {
    socket.emit('connected', 'Oksana,you are connected');
});

app.use(express.static('chat'));
app.listen(7777, () => {
    console.log('server is running on port 7777');
});


