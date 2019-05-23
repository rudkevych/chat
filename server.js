const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');

// хэширование пароля
const bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';

mongoose.connect("mongodb://localhost:27017/chatUsers",  { useNewUrlParser: true } );
const db = mongoose.connection;
// Привязать подключение к событию ошибки  (получать сообщения об ошибках подключения)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {
    // console.log('We are connected db open');
});

/// express sessions
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

let usersSchema = new mongoose.Schema({
    username: String,
    password: String,
    token: String,
    isAdmin: { type: Boolean, default: false},
    isBanned: { type: Boolean, default: false},
    isMuted: { type: Boolean, default: false}
}, {
    versionKey: false
});
let User = mongoose.model("user", usersSchema);

app.use(cors());

// array for users like temporary db
// let users = [
//     {
//         id: 1,
//         username: 'admin',
//         password: 'admin'
//     },
//     {
//         id: 2,
//         username: 'user',
//         password: 'user'
//     },
//     {
//         id: 3,
//         username: 'user3',
//         password: 'user3'
//     },
//     {
//         id: 4,
//         username: 'user4',
//         password: 'user4'
//     }
// ];

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// get на страницу регистрации
app.get('/', function (req, res) {
    if (req.session.user) {
        //console.log('redirect');
        return res.redirect('/chat');
    }
    res.sendFile('index.html', { root: __dirname });
    // console.log('token ' + token);
});

app.get('/logout', (req, res)=>{
    req.session.user = null;
    res.redirect('/');
});
// get на страницу чата
app.get('/chat', function (req, res) {
    //console.log('user',req.session.user);
    if (!req.session.user) {
        return res.redirect('/');
    }
    res.sendFile('chat.html', { root: __dirname });
});

// POST method route, данные польозователя с страницы регистрации
app.post('/', async (req, res) => {
    const { username, password } = req.body;
    try {
        // without password checking
        // let user = await User.findOne({username, password});
        // console.log('user', user);
        // if (user) {
        //     console.log("User successfully found in database");
        //     res.json({
        //         success: 'OK',
        //         data: req.body
        //     })
        // } else {
        //     console.log("User doesnt exist or password not correct and we have to add him to dbs");
        //     // добавить проверку на не пустые values in user
        //     let userCreate = await User.create({
        //         username: username,
        //         password: password
        //     });
        //     res.json({
        //         success: 'OK',
        //         data: req.body
        //     });
        //     userCreate();
        // }

        let user = await User.findOne({username});
        // console.log('user', user);
        if (user) {
            console.log("User found in database");
            let userByPass = await User.findOne({password: password});
            if (userByPass) {
                req.session.user = user;
                res.json({
                    success: 'OK',
                    data: {username: username, token: userByPass.token, isAdmin: userByPass.isAdmin}
                });
                // for(let keys in req.body) {
                //     console.log(req.body[keys]);
                // }
            } else {
                res.status(422).json({
                    success: 'ERROR',
                    data: 'You entered wrong password, Please try again'
                });
                console.log('but password is not correct');
            }
        } else {
            console.log("User doesnt exist so we will add him to the database");
            // добавить проверку на не пустые values in user
            function generateToken() {
                let result  = '';
                let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                let charactersLength = characters.length;
                for (let i = 0; i < 32; i++ ) {
                    result += characters.charAt(Math.floor(Math.random() * charactersLength));
                }
                return result;
            }
            const token = generateToken();
            let userCreate = await User.create({
                username: username,
                password: password,
                token: token
            });
            req.session.user = userCreate;
            res.json({
                success: 'OK',
                data: {username: username, token: token, isAdmin: isAdmin}
            });
            // userCreate();
        }
    } catch (e) {
        console.error("E, login,", e);
    }
    // поиск по массиву на сервере => заменяем на поиск в базе данных
    // for (let i=0; i<users.length; i++) {
    //     let user = users[i];
    //     if (user.username === username && user.password === password) {
    //         findUser = user;
    //         // res.json({
    //         //     success: 'OK',
    //         //     data: req.body
    //         // })
    //     // } else {
    //         // throw Error ('User with such username doesnt exist');
    //         // users.push(req.body);
    //     }
    // }
});

app.use(express.static('chat'));
server.listen(4001);

const usersOnline = new Set([]);

io.on('connection', async function (socket) {
    let {token} = socket.handshake.query;
        // console.log(socket.handshake.query.token);
    let userByToken =  await User.findOne({token});
    // console.log('userByToken ', userByToken);
    if (!userByToken || userByToken.isBanned){
        // отключаем пользователя и заканчиваем выполнения данного замыкания
        socket.disconnect();
    }

    let { username } = userByToken;
    usersOnline.add(username);
    io.sockets.emit('usersList', {
        // data: ['quantity of users online:  ' + Object.keys(io.sockets.connected).length] // заменить на реальный список пользоватеелй
        data: [...usersOnline] // userByToken.username show only one current user
    });

    socket.on('clientMessage', function (fromClient) {
        console.log(username);
        // socket.emit('serverMessage', data); - работает только с одним пользователем
        io.sockets.emit('serverMessage', {
            message: fromClient.data,
            username
        });
        // console.log('message from client: ', data);
    });

    // sendUsersOnlineList();

    socket.on('disconnect', function(){
        usersOnline.delete(username);
        io.sockets.emit('usersList', {
            data: [...usersOnline]
        });
    });

    // console.log('client', client);
    io.sockets.on('connect', function(client) {
        // client.on('disconnect', function() {
        // usersOnline.splice(usersOnline.indexOf(client));
        // });
        // console.log('usersOnline', usersOnline);
    });

    /////// users list for admin ////////////////
    let allUsers = await User.distinct('username');
    console.log(allUsers);
    io.sockets.emit('listForAdmin', allUsers);

});


// app.use(function (req, res, next) {
//     if (!req.session.views) {
//         req.session.views = {}
//     }
//     // get the url pathname
//     let pathname = parseurl(req).pathname;
//
//     // count the views
//     req.session.views[pathname] = (req.session.views[pathname] || 0) + 1;
//
//     next()
// });

