'use strict';

var PrivateMessageModel = require('./chatModel').privateMessageModel;

var create = function() {
    return new PrivateMessageModel();
}

var save = function(privateMessageModel, callback) {
    return privateMessageModel.save(callback);
}

var findAllUnreadMessagesForUser = function(username, callback) {
    PrivateMessageModel.find().where({recepient: username, isRead: false})
        .sort({'date': 'ascending'})
        .exec(callback);
}

var findAllPrivateMessagesBetweenTwoUsers= function(usernameFirst, usernameSecond, callback) {
    PrivateMessageModel.find()
        .or([
            {$and: [{sender: usernameFirst}, {recepient: usernameSecond}]},
            {$and: [{sender: usernameSecond}, {recepient: usernameFirst}]}
        ])
        .sort({'date': 'descending'})
        .exec(callback);
}

var markMessagesAsRead = function(sender, recepient, callback) {
    PrivateMessageModel.update({
            sender: sender,
            recepient: recepient,
            isRead: false
        }, {isRead: true}, {multi: true},
        callback);
}

module.exports = {
    create: create,
    save: save,
    findAllUnreadMessagesForUser: findAllUnreadMessagesForUser,
    findAllPrivateMessagesBetweenTwoUsers: findAllPrivateMessagesBetweenTwoUsers,
    markMessagesAsRead: markMessagesAsRead
};