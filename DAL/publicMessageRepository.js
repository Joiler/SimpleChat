'use strict';

var PublicMessageModel = require('./chatModel').publicMessageModel;

var create = function() {
    return new PublicMessageModel();
}

var save = function(publicMessageModel, callback) {
    return publicMessageModel.save(callback);
}

module.exports = {
    create: create,
    save: save
};