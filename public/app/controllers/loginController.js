angular.module('simpleChatApp')
    .controller('loginController', ['$scope', '$rootScope', '$location', 'authentificationService',
        function ($scope, $rootScope, $location, authentificationService) {
            $scope.userCridentials = {};
            $scope.isAutoruzedFail = false;

            $scope.signIn = function (form) {
                if (form.$valid) {
                    $scope.isAutoruzedFail = false;
                    authentificationService.login($scope.userCridentials.username, $scope.userCridentials.password).then(function (data) {
                        if (data.success === true) {
                            $rootScope.userInfo = {username: $scope.userCridentials.username};
                            $location.path('/chat');
                        }
                        else {
                            $scope.isAutoruzedFail = true;
                        }
                    })
                } else {
                    return false;
                }
            };

            $scope.$watch(function () {
                return $scope.userCridentials;
            }, function () {
                $scope.isAutoruzedFail = false;
            }, true)
        }
    ]);