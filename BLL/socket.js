'use strict';

var passportSocketIo = require('passport.socketio');
var cookieParser = require('cookie-parser');
var async = require('async');
var sessionConfig = require('../configs/session');
var validator = require('validator');
var userRepository = require('../DAL/userRepository');
var publicMessageRepository = require('../DAL/publicMessageRepository');
var privateMessageRepository = require('../DAL/privateMessageRepository');

var allUsers = {};

var errorHandler = function (err) {
    if (err) {
        console.log(err.message);
    }
}

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
        socket.emit('user:list', generateUsersListToClient(username));
        if (!allUsers[username]) {
            //new register user
            allUsers[username] = {isOnline: true, sockets: [socket]};
            socket.broadcast.emit('user:new', {username: username, isOnline: true});
        } else {
            allUsers[username].sockets.push(socket);
            if (allUsers[username].isOnline) {
                //user open chat twice
            } else {
                allUsers[username].isOnline = true;
                socket.broadcast.emit('user:update', {username: username, isOnline: true});
            }
        }
    }

    function processUnreadMessages() {
        privateMessageRepository.findAllUnreadMessagesForUser(username, function (err, messages) {
            if (messages.length > 0) {
                socket.emit('privateMessage:unread', messages);
            }
        });
    }

    processConnectedUser();
    processUnreadMessages();
}

var managePublicChatEvents = function (io, socket) {
    function processChatMessageEvent(message) {
        async.waterfall([
            function (callback) {
                var date = new Date();
                message.date = date;
                message.text = validator.escape(message.text).trim();
                message.sender = validator.escape(message.sender).trim();
                var publicMessage = publicMessageRepository.create();
                publicMessage.sender = message.sender;
                publicMessage.text = message.text;
                publicMessage.date = message.date;
                publicMessageRepository.save(publicMessage, callback);
            },
            function (res, callback) {
                //do nothing
            }
        ], errorHandler);
        io.sockets.emit('chatMessage:received', message);
    }

    socket.on('chatMessage:sent', processChatMessageEvent);
}

var managePrivateChatEvents = function (io, socket) {
    function processReadMessageEvent(message) {
        async.waterfall([
            function (callback) {
                message.sender = validator.escape(message.sender).trim();
                message.recepient = validator.escape(message.recepient).trim();
                privateMessageRepository.markMessagesAsRead(message.sender, message.recepient, callback);
            },
            function (res, callback) {
                //do nothing
            }
        ], errorHandler);
    }

    function processPrivateMessageEvent(message) {
        async.waterfall([
            function (callback) {
                var date = new Date();
                message.date = date;
                message.text = validator.escape(message.text).trim();
                message.sender = validator.escape(message.sender).trim();
                message.recepient = validator.escape(message.recepient).trim();
                var privateMessage = privateMessageRepository.create();
                privateMessage.sender = message.sender;
                privateMessage.text = message.text;
                privateMessage.date = message.date;
                privateMessage.recepient = message.recepient;
                allUsers[message.sender].sockets.forEach(function (privateChatSocket) {
                    privateChatSocket.emit('privateMessage:received', message);
                });
                privateMessage.isRead = false;
                allUsers[message.recepient].sockets.forEach(function (privateChatSocket) {
                    privateChatSocket.emit('privateMessage:received', message);
                });
                privateMessageRepository.save(privateMessage, callback);
            },
            function (res, callback) {
                //do nothing
            }
        ], errorHandler);
    }

    function processPrivateHistoryEvent(message) {
        message.sender = validator.escape(message.sender).trim();
        message.recepient = validator.escape(message.recepient).trim();
        async.waterfall([
            function (callback) {
                privateMessageRepository.findAllPrivateMessagesBetweenTwoUsers(message.sender, message.recepient, callback);
            },
            function (messages, callback) {
                socket.emit('privateHistory:received', {
                    messages: messages,
                    sender: message.sender,
                    recepient: message.recepient
                });
            }
        ], errorHandler);
    }

    socket.on('privateMessage:read', processReadMessageEvent);
    socket.on('privateMessage:sent', processPrivateMessageEvent);
    socket.on('privateHistory:sent', processPrivateHistoryEvent);
}

var manageDisconnectEvent = function (io, socket) {
    function processDisconnectEvent() {
        var username = socket.request.user.username;
        if (username) {
            var index = allUsers[username].sockets.indexOf(socket);
            allUsers[username].sockets.splice(index, 1);
            if (allUsers[username].sockets.length === 0) {
                allUsers[username].isOnline = false;
                socket.broadcast.emit('user:update', {username: username, isOnline: false});
            }
        }
    }

    socket.on('disconnect', processDisconnectEvent);
}

var initUserList = function () {
    async.waterfall([
        function (callback) {
            userRepository.findAllUsers(callback);
        },
        function (users, callback) {
            users.forEach(function (user) {
                allUsers[user.username] = {isOnline: false, sockets: []};
            });
        }
    ], errorHandler);
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