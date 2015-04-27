angular.module('simpleChatApp')
    .factory('notificationService',
    ['$timeout',
        function ($timeout) {
            var showNewMessageNotification = function (username) {
                function displayNotification() {
                    var notification = new Notification('New message', {
                        body: 'You have new message from ' + username,
                        icon: '../../../images/messageNotification.png'
                    });
                    $timeout(function () {
                        notification.close();
                    }, 5000)
                }


                if (!Notification) {
                    return;
                }
                if (Notification.permission !== 'granted') {
                    Notification.requestPermission(function(result) {
                        if (result === 'granted') {
                            displayNotification();
                        }
                    });
                } else {
                    displayNotification();
                }

            }

            return {
                showNewMessageNotification: showNewMessageNotification
            };
        }]);