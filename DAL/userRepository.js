'use strict';

var UserModel = require('./chatModel').userModel;

var create = function() {
    return new UserModel();
}

var save = function(userModel, callback) {
    return userModel.save(callback);
}

var findUserByUsername = function(username, callback) {
    UserModel.findOne({username: username}, callback);
}

var findUserById = function(id, callback) {
    UserModel.findById(id, callback);
}

var findAllUsers = function(callback) {
    UserModel.find({}, callback);
}

module.exports = {
    create: create,
    save: save,
    findUserById: findUserById,
    findUserByUsername: findUserByUsername,
    findAllUsers: findAllUsers
};