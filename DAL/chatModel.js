'use strict';

var mongoose = require('mongoose');
var databaseConfig = require('../configs/database');
var bcrypt = require('bcrypt-nodejs');

mongoose.connect(databaseConfig.url, function(err, res) {
    if (err) {
        console.log('Connection to Mongodb failed. Connection status:' + err.message);
    }

});

var userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

var publicMessageSchema = new mongoose.Schema({
    sender: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    date: {
        type: Date
    }
});

var privateMessageSchema = new mongoose.Schema({
    sender: {
        type: String,
        required: true
    },
    recepient: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    date: {
        type: Date
    },
    isRead: {
        type: Boolean
    }
});

var userModel = mongoose.model('User', userSchema);
var publicMessageModel = mongoose.model('PublicMessage', publicMessageSchema);
var privateMessageModel = mongoose.model('PrivateMessage', privateMessageSchema);

module.exports = {
    userModel: userModel,
    publicMessageModel: publicMessageModel,
    privateMessageModel: privateMessageModel,
    mongooseConnection: userModel.db
};