'use strict';

var session = require('express-session');
var mongoStore = require('connect-mongo')(session);

var mStore = new mongoStore({
    mongooseConnection: require('../DAL/chatModel').mongooseConnection,
    collection: 'session'
});

module.exports = {
    sessionStore: mStore,
    sessionName: 'chat_sess',
    secret: 'ChatSessionPassword',
    sessionDuration: 10800000
} ;