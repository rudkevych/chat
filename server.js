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
        password: 'admin'
    },
    {
        id: 2,
        username: 'user',
        password: 'user'
    },
    {
        id: 3,
        username: 'user3',
        password: 'user3'
    },
    {
        id: 4,
        username: 'user4',
        password: 'user4'
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
    //     if (req.body) {
    //         res.json({
    //             success: 'OK',
    //             data: req.body,
    // //             // isUserExist
    // //             // username,admin
    // //             // password
    //         });
    //     }

////////////доделать проверку data и обьектов в массиве users
    let findUser = null;
    for (let i=0; i<users.length; i++) {
        let user = users[i];
        if (user.username === username && user.password === password) {
            findUser = user;
            // res.json({
            //     success: 'OK',
            //     data: req.body
            // })
        // } else {
            // throw Error ('User with such username doesnt exist');
            // users.push(req.body);
        }
    }

    if (findUser){
        res.json({
            success: 'OK',
            data: findUser
        });
    }else{
        res.sendStatus(422);
        // res.json({
        //     success: 'error',
        //     data: findUser
        // });
        // throw Error ('User with such username doesnt exist');
    }

    // users.some(isUserExist);
    // function isUserExist (users) {
    //     let user = users[i];
    //     return user.username === req.body.username && user.password === req.body.password;
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

    // socket.on('login', function (data) {
    //     console.log('login', data);
    //     users.push({
    //         ...data,
    //         id: short.generate().slice(0, 8)
    //     });
    //     console.log(users);
    // });

    socket.on('clientMessage', function (data) {
        // получили сообщение от клиента, рассылаем всем остальным клиентам - через oi.sockets.emit
        // socket.emit('serverMessage', data); - работает только с одним пользователем
        io.sockets.emit('serverMessage', data);
        console.log('message from client: ', data);
    });

    // socket.on('onConnect', function (socket) {
    //     oi.sockets.emit('onConnect', {
    //         data: 'a user connected to chat'
    //     })
    // });

    // users online работает на одну сторону ???
    // socket.emit('onConnect', {
    //     data: 'a user connected to chat'
    // });

    sendUsersOnlineList();

    socket.on('disconnect', function(){
        sendUsersOnlineList();
        console.log('user disconnected, users online:', Object.keys(io.sockets.connected).length);
    });

    function sendUsersOnlineList() {
        ////// user online and users counter
        // // список пользователей так же нужно рассылать, когда пользователь отключился (повеситься на событьие disconnect)
        io.sockets.emit('usersList', {
            data: ['quantity of users online:  ' + Object.keys(io.sockets.connected).length] // заменить на реальный список пользоватеелй
        });
    }

    // io.sockets.emit('connection', function(){
    //     console.log('a user connected', Object.keys(io.sockets.connected).length);
    // });
    //
    // io.sockets.emit('disconnect', function(){
    //     console.log('user disconnected' , Object.keys(io.sockets.connected).length);
    // });

    // io.sockets.on('disconnect', {
    //     data: ['quantity of users online:  ' + Object.keys(io.sockets.connected).length]
    // });

    // console.log('quantity of users online: ', Object.keys(io.sockets.connected).length);

});

//
io.on('connection', function(socket){
    console.log('a user connected, users online:', Object.keys(io.sockets.connected).length);
    socket.on('disconnect', function(){
        console.log('user disconnected, users online:', Object.keys(io.sockets.connected).length);
    });
});



// io.on('connection', function(socket) {
//     console.log('a user connected to chat 2');
//     // socket.on('disconnect', function(){
//     //     console.log('user disconnected from chat');
//     // });
//
// });





