const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const cors = require('cors');
const short = require('short-uuid')('123456789');
const bodyParser = require('body-parser');

app.use(cors());
// array for users like temporary db
let users = [
    {
        id: 1,
        username: 'admin',
        password: 'q1w2e3r4'
    }
];

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// get на страницу регистрации
app.get('/', function (req, res) {
    res.sendFile('index.html', { root: __dirname });
});

// get на страницу чата
app.get('/chat', function (req, res) {
    res.sendFile('chat.html', { root: __dirname });
});

// POST method route, данные польозователя с страницы регистрации
app.post('/', function (req, res) {
    console.log(req.body);
    const { username, password } = req.body;
        // if (req.body) {
        //     res.json({
        //         success: 'OK',
        //         data: req.body,
        //         // isUserExist
        //         // username,
        //         // password
        //     });
        // }

    // const isUserExist = users.some(user => user.username === username);
    //
    // if (isUserExist){
    //     return res.status(422).send('We`ve already have user with such login!');
    // }
    // users.push({
    //     ...req.body,
    //     id: short.generate().slice(0, 8)
    // });

    res.json({
        success: 'OK',
        data: req.body,
        // isUserExist
        // username,
        // password
    });

});

app.use(express.static('chat'));

server.listen(4001);

// task #4 - сделать колонку "пользователи online". на фронте - сделать блок, где будем выводить всех подключенных сейчас клиетов
// при подключении к серверу, сервер должен отдать список всех подключенных к нему сейчас клиентов
// полученный от сервера список - отображаем в сделанном блоке

// поскольку у нас еще нет имен пользователей, можно отдавать случайное число, строчку или порядковый номер

// socket - это работа с конкретным подключением. для каждого открытого подключения - он свой
// io.sockets - все текущие подключения

io.on('connection', function (socket) {

    socket.on('login', function (data) {
        console.log('login', data);
        users.push({
            ...data,
            id: short.generate().slice(0, 8)
        });
        console.log(users);
    });

    socket.on('clientMessage', function (data) {
        // получили сообщение от клиента, рассылаем всем остальным клиентам
        // socket.emit('serverMessage', data);
        io.sockets.emit('serverMessage', data);
        console.log('message from client: ', data);
    });

    // socket.on('onConnect', function (socket) {
    //     oi.sockets.emit('onConnect', {
    //         data: 'a user connected to chat'
    //     })
    // });

    // users online
    // /работает на одну сторону
    socket.emit('onConnect', {
        data: 'a user connected to chat'
    });

    /////////////////// users online
    // socket.on('connection', function (data) {
    //     // получили сообщение от клиента, рассылаем всем остальным клиентам
    //     io.sockets.emit('usersMessage', data);
    //     console.log('message from client: ', data);
    // });

});

// io.on('connection', function(socket) {
//     console.log('a user connected to chat 2');
//     // socket.on('disconnect', function(){
//     //     console.log('user disconnected from chat');
//     // });
//
// });



// app.get('/', function(req, res){
//     res.sendFile(__dirname + '/chat.html');
// });
//
// io.on('connection', function(socket){
//     console.log('a user connected');
// });
//
// server.listen(3000, function(){
//     console.log('listening on *:3000');
// });


// io.on('connection', function (socket) {
//     socket.emit('chat', { hello: 'oksana from chat' });
//     // socket.on('chat', function (data) {
//     //     console.log('myNewEvent', data);
//     // })
// });




// oi.on('connection', function (socket) {
//     // получили сообщение от клиента, рассылаем всем остальным клиентам
//     io.sockets.emit('usersMessage', data);
//     console.log('message from client: ', data);
// });


