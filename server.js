const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const cors = require('cors');
const short = require('short-uuid')('123456789');

app.use(cors());
app.get('/', function (req, res) {
    res.sendFile('index.html', { root: __dirname });
});

let users = [
    {
        id: 1,
        username: 'admin',
        password: 'q1w2e3r4'
    }
];


app.use(express.static('chat'));

// app.listen(7777, () => {
//     console.log('server is running on port 7777');
// });

server.listen(4001);

// io.on('connection', function (socket) {
//     socket.emit('connected', "Oksana,you are connected");
// });

io.on('connection', function (socket) {
    socket.emit('news', { hello: 'world' });
    socket.on('myNewEvent', function (data) {
        console.log('myNewEvent', data);
    });
    socket.on('login', (data) => {
        console.log('login', data);
        users.push({
            ...data,
            id: short.generate().slice(0, 8)
        });
        console.log(users);
    })
});


