var session = require('express-session');
var mongoStore = require('connect-mongo')(session);
var UserModel = require('../DAL/chatDAL').UserModel;

var mStore = new mongoStore({
    mongooseConnection: UserModel.db,
    collection: 'session'
});

module.exports = {
    sessionStore: mStore,
    sessionName: 'chat_sess',
    secret: 'ChatSessionPassword',
    sessionDuration: 10800000
} ;