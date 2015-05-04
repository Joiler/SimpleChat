'use strict';

var LocalStrategy = require('passport-local').Strategy;
var userRepository = require('../DAL/userRepository');
var validator = require('validator');
var async = require('async');

module.exports = function (passport) {
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        userRepository.findUserById(id, function (err, user) {
            done(err, user);
        });
    });

    passport.use('local-signin', new LocalStrategy({
                usernameField: 'username',
                passwordField: 'password',
                passReqToCallback: true
            },
            function (req, username, password, done) {
                async.waterfall([
                    function (callback) {
                        username = validator.escape(username).trim();
                        async.nextTick(callback);
                    },
                    function (callback) {
                        userRepository.findUserByUsername(username, callback);
                    },
                    function (user, callback) {
                        if (user) {
                            if (user.validPassword(password)) {
                                return done(null, user);
                            }
                            else {
                                return done(null, false, req.flash('signupMessage', 'This userName is already taken.'));
                            }
                        } else {
                            var newUser = userRepository.create();
                            newUser.username = username;
                            newUser.password = newUser.generateHash(password);
                            userRepository.save(newUser, function (err) {
                                if (err) {
                                    callback(err);
                                }
                                return done(null, newUser);
                            });
                        }
                    }
                ], function (err) {
                    if (err) {
                        return done(err);
                    }
                });
            })
    );
};