'use strict';

var express = require('express');
var passport = require('passport');

var router = express.Router();

router.post('/logon', function (req, res, next) {
    passport.authenticate('local-signin', function (err, user, info) {
        if (err && err !== null) {
            return next(err);
        }
        if (!user) {
            return res.send({success: false});
        }
        req.logIn(user, function (err) {
            if (err) {
                return next(err);
            }
            return res.send({success: true});
        });
    })(req, res, next);
});

router.get('/isLoggedIn', isLoggedIn, function (req, res, next) {
    res.send({success: true, username: req.user.username});
});

router.get('/logout', function (req, res, next) {
    req.logout();
    res.send({success: true});
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    else {
        res.send({success: false, error: 'Unauthorized'});
    }
}

module.exports = router;
