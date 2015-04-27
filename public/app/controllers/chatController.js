angular.module('simpleChatApp')
    .controller('chatController', ['$scope', '$rootScope', '$location', '$modal', 'chatSocketService', 'notificationService',
        function ($scope, $rootScope, $location, $modal, chatSocketService, notificationService) {
            $scope.chatUsers = [];
            $scope.chatMessages = [];
            $scope.currentPublicMessageText = '';

            $scope.sendPublicMessage = function () {
                var message = {
                    sender: $rootScope.userInfo.username,
                    text: $scope.currentPublicMessageText
                }
                chatSocketService.emit('chat message', message);
                $scope.currentPublicMessageText = '';
            }

            $scope.openModalWindow = function (user) {
                var modalInstance = $modal.open({
                    templateUrl: 'app/templates/chatModal.html',
                    controller: 'chatModalController',
                    backdrop: 'static',
                    keyboard: false,
                    resolve: {
                        userRecepient: function () {
                            return user;
                        }
                    }
                });
            }

            $scope.$on('$destroy', function () {
                chatSocketService.removeAllListeners();
            });

            var init = function () {
                chatSocketService.connect();
                addUserEventListners();
                addPublicChatEventListners();
                addPrivateChatEventListners();
                addErrorEventListners();
            }

            var addUserEventListners = function () {
                chatSocketService.addListener('user list', function (users) {
                    for (var i = 0, len = users.length; i < len; i++) {
                        users[i].messages = [];
                        users[i].unreadMessagesCount = 0;
                    }
                    $scope.chatUsers = users;
                });

                chatSocketService.addListener('new user', function (user) {
                    user.messages = [];
                    user.unreadMessagesCount = 0;
                    $scope.chatUsers.push(user);
                });

                chatSocketService.addListener('update user status', function (user) {
                    var updatedUser = getUserByUsername(user.username);
                    updatedUser.isOnline = user.isOnline;
                });
            }

            var addPublicChatEventListners = function () {
                chatSocketService.addListener('chat message', function (message) {
                    message.date = new Date(message.date);
                    message.isOwn = message.sender === $rootScope.userInfo.username;
                    $scope.chatMessages.unshift(message);
                })
            }

            var addPrivateChatEventListners = function () {
                chatSocketService.addListener('private message', function (message) {
                    message.date = new Date(message.date);
                    message.isOwn = message.sender === $rootScope.userInfo.username;
                    var linkedUser;
                    if (message.isOwn) {
                        linkedUser = getUserByUsername(message.recepient);
                    } else {
                        linkedUser = getUserByUsername(message.sender);
                        if (!linkedUser.isOpenModal) {
                            linkedUser.unreadMessagesCount++;
                            notificationService.showNewMessageNotification(message.sender);
                        } else {
                            chatSocketService.emit('read message', {
                                sender: message.sender,
                                recepient: message.recepient
                            });
                        }
                    }
                    linkedUser.messages.unshift(message);
                })

                chatSocketService.addListener('unread messages', function (messages) {
                    var senderUser;
                    for (var i = 0, len = messages.length; i < len; i++) {
                        messages[i].isOwn = false;
                        messages[i].date = new Date(messages[i].date);
                        senderUser = getUserByUsername(messages[i].sender);
                        senderUser.messages.unshift(messages[i]);
                        senderUser.unreadMessagesCount++;
                    }
                })

                chatSocketService.addListener('private history', function (data) {
                    var messages = data.messages;
                    for (var i = 0, len = messages.length; i < len; i++) {
                        messages[i].isOwn = messages[i].sender === $rootScope.userInfo.username;
                        messages[i].date = new Date(messages[i].date);
                    }
                    var linkedUser = getUserByUsername(data.recepient);
                    linkedUser.messages = [];
                    linkedUser.messages = linkedUser.messages.concat(messages);
                })
            }

            var addErrorEventListners = function () {
                chatSocketService.addListener('error', function (user) {
                    $location.path('/login');
                });
            }

            var getUserByUsername = function (username) {
                for (var i = 0, len = $scope.chatUsers.length; i < len; i++) {
                    if ($scope.chatUsers[i].username === username) {
                        return $scope.chatUsers[i];
                    }
                }
            }

            init();
        }
    ]);