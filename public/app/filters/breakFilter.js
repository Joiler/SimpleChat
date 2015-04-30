angular.module('simpleChatApp')
    .filter('breakFilter', function () {
        'use strict';

        return function (text) {
            if (text !== undefined) {
                return text.replace(/\n/g, '<br />');
            }
        };
    });