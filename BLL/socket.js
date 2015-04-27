var passportSocketIo = require('passport.socketio');
var cookieParser = require('cookie-parser');
var sessionConfig = require('../configs/session');
var PublicMessageModel = require('../DAL/chatDAL').PublicMessageModel;
var PrivateMessageModel = require('../DAL/chatDAL').PrivateMessageModel;
var UserModel = require('../DAL/chatDAL').UserModel;

var allUsers = {};

var manageConnection = function (io, socket) {
    var username = socket.request.user.username;
    if (!username) {
        return;
    }

    function generateUsersListToClient(curUsername) {
        var jsonUsers = [];
        for (var username in allUsers) {
            if (username === curUsername) {
                continue;
            }
            jsonUsers.push({username: username, isOnline: allUsers[username].isOnline});
        }
        return jsonUsers;
    }

    function processConnectedUser() {
        socket.emit('user list', generateUsersListToClient(username));
        if (!allUsers[username]) {
            //new register user
            allUsers[username] = {isOnline: true, sockets: [socket]};
            socket.broadcast.emit('new user', {username: username, isOnline: true});
        } else {
            allUsers[username].sockets.push(socket);
            if (allUsers[username].isOnline) {
                //user open chat twice
            } else {
                allUsers[username].isOnline = true;
                socket.broadcast.emit('update user status', {username: username, isOnline: true});
            }
        }
    }

    function processUnreadMessages() {
        PrivateMessageModel.find().where({recepient: username, isRead: false})
            .sort({'date': 'ascending'})
            .exec(function (err, messages) {
                if (messages.length > 0) {
                    socket.emit('unread messages', messages);
                }
            });
    }

    processConnectedUser();
    processUnreadMessages();
}

var managePublicChatEvents = function (io, socket) {
    function processChatMessageEvent(message) {
        var date = new Date();
        message.date = date;
        var publicMessage = new PublicMessageModel();
        publicMessage.sender = message.sender;
        publicMessage.text = message.text;
        publicMessage.date = message.date
        publicMessage.save(function (err) {
            if (err) {
                throw err;
            }
        });
        io.sockets.emit('chat message', message);
    }

    socket.on('chat message', processChatMessageEvent);
}

var managePrivateChatEvents = function (io, socket) {
    function processReadMessageEvent(message) {
        PrivateMessageModel.update({
                sender: message.sender,
                recepient: message.recepient,
                isRead: false
            }, {isRead: true}, {multi: true},
            function (err, res) {
                if (err) {
                    throw err;
                }
            });
    }

    function processPrivateMessageEvent(message) {
        var date = new Date();
        message.date = date;
        var privateMessage = new PrivateMessageModel();
        privateMessage.sender = message.sender;
        privateMessage.text = message.text;
        privateMessage.date = message.date;
        privateMessage.recepient = message.recepient;
        allUsers[message.sender].sockets.forEach(function (privateChatSocket) {
            privateChatSocket.emit('private message', message);
        });
        privateMessage.isRead = false;
        allUsers[message.recepient].sockets.forEach(function (privateChatSocket) {
            privateChatSocket.emit('private message', message);
        });
        privateMessage.save(function (err) {
            if (err) {
                throw err;
            }
        });
    }

    function processPrivateHistoryEvent(message) {
        PrivateMessageModel.find()
            .or([
                {$and: [{sender: message.sender}, {recepient: message.recepient}]},
                {$and: [{sender: message.recepient}, {recepient: message.sender}]}
            ])
            .sort({'date': 'descending'})
            .exec(function (err, messages) {
                if (err) {
                    throw err;
                }
                socket.emit('private history', {
                    messages: messages,
                    sender: message.sender,
                    recepient: message.recepient
                });
            });
    }

    socket.on('read message', processReadMessageEvent);
    socket.on('private message', processPrivateMessageEvent);
    socket.on('private history', processPrivateHistoryEvent);
}

var manageDisconnectEvent = function (io, socket) {
    function processDisconnectEvent() {
        var username = socket.request.user.username;
        if (username) {
            var index = allUsers[username].sockets.indexOf(socket);
            allUsers[username].sockets.splice(index, 1);
            if (allUsers[username].sockets.length === 0) {
                allUsers[username].isOnline = false;
                socket.broadcast.emit('update user status', {username: username, isOnline: false});
            }
        }
    }

    socket.on('disconnect', processDisconnectEvent);
}

var initUserList = function () {
    UserModel.find({}, function (err, users) {
        users.forEach(function (user) {
            allUsers[user.username] = {isOnline: false, sockets: []};
        });
    });
}

initUserList();

module.exports = function (io) {

    io.use(passportSocketIo.authorize({
        cookieParser: cookieParser,
        key: sessionConfig.sessionName,
        secret: sessionConfig.secret,
        store: sessionConfig.sessionStore,
        success: function (data, accept) {
            accept();
        },
        fail: function (data, message, error, accept) {
            accept(null, false);
            if (error) {
                accept(new Error(message));
            }
        }
    }));

    io.on('connection', function (socket) {
        manageConnection(io, socket);
        managePublicChatEvents(io, socket);
        managePrivateChatEvents(io, socket);
        manageDisconnectEvent(io, socket);
    });
}