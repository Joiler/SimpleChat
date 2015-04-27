angular.module('simpleChatApp')
    .controller('chatModalController', ['$scope', '$rootScope', '$modalInstance', 'chatSocketService', 'userRecepient',
        function ($scope, $rootScope, $modalInstance, chatSocketService, userRecepient) {
            $scope.userRecepient = userRecepient;
            $scope.currentPrivateMessageText = '';

            $scope.sendPrivateMessage = function () {
                var message = {
                    sender: $rootScope.userInfo.username,
                    recepient: $scope.userRecepient.username,
                    text: $scope.currentPrivateMessageText
                }
                chatSocketService.emit('private message', message);
                $scope.currentPrivateMessageText = '';
            }

            $scope.loadHistory = function () {
                chatSocketService.emit('private history',
                    {
                        sender: $rootScope.userInfo.username,
                        recepient: $scope.userRecepient.username
                    }
                );
            }

            $scope.close = function () {
                $scope.userRecepient.isOpenModal = false;
                $modalInstance.close();
            };

            var init = function () {
                if ($scope.userRecepient.unreadMessagesCount > 0) {
                    chatSocketService.emit('read message', {
                        sender: $scope.userRecepient.username,
                        recepient: $rootScope.userInfo.username
                    });
                    $scope.userRecepient.unreadMessagesCount = 0;
                }
                $scope.userRecepient.isOpenModal = true;
            }

            init();

        }
    ]);