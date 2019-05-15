const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const cors = require('cors');
const short = require('short-uuid')('123456789');
const bodyParser = require('body-parser');

// array for users like temporary db
let users = [
    {
        id: 1,
        username: 'admin',
        password: 'q1w2e3r4'
    }
];

app.use(cors());

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


