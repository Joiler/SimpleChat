var LocalStrategy = require('passport-local').Strategy;
var UserModel = require('../DAL/chatDAL').UserModel;

module.exports = function (passport) {
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        UserModel.findById(id, function (err, user) {
            done(err, user);
        });
    });

    passport.use('local-signin', new LocalStrategy({
                usernameField: 'username',
                passwordField: 'password',
                passReqToCallback: true
            },
            function (req, username, password, done) {
                process.nextTick(function () {
                    UserModel.findOne({username: username}, function (err, user) {
                        if (err) {
                            return done(err);
                        }
                        if (user) {
                            if (user.validPassword(password)) {
                                return done(null, user);
                            }
                            else {
                                return done(null, false, req.flash('signupMessage', 'This userName is already taken.'));
                            }
                        } else {
                            var newUser = new UserModel();
                            newUser.username = username;
                            newUser.password = newUser.generateHash(password);
                            newUser.save(function (err) {
                                if (err) {
                                    throw err;
                                }
                                return done(null, newUser);
                            });
                        }
                    });
                });
            })
    );
};