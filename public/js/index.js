var app = angular.module('dwz', []);

app.controller('HeaderController', function($rootScope, $scope, $http) {
    $rootScope.closeModal = function() {
        $rootScope.showModalBg = false;
        $scope.showLogin = false;
        $scope.showList = false;
        $scope.showEdit = false;
    }
    $scope.closeLogin = function() {
        $rootScope.showModalBg = false;
        $scope.showLogin = false;
    }
    $scope.closeList = function() {
        $rootScope.showModalBg = false;
        $scope.showList = false;
    }
    $scope.closeEdit = function() {
        $scope.showEdit = false;
        $scope.showList = true;
    }
    $scope.getLinks = function() {
        $http({
            method: 'GET',
            url: '/api/links',
        }).success(function(data, status, headers, cfg) {
            $scope.links = data.links;
            $scope.showList = true;
            $rootScope.showModalBg = true;
        }).error(function(data, status, headers, cfg) {
            if (status == 401) {
                $rootScope.showModalBg = true;
                $scope.showLogin = true;
            } else {


            }
        })

    }

    $scope.Login = function() {
        $http({
            method: 'POST',
            url: '/api/login',
            data: JSON.stringify($scope.login)
        }).success(function(data, status, headers, cfg) {
            $scope.closeLogin();
            $scope.getLinks();
        }).error(function() {
            swal("Login Failed", "THe username/password is not correct", "error");
        });
    }

    $scope.delLink = function(index) {
        var link = $scope.links[index];
        $http({
                method: 'DELETE',
                url: '/api/delete/' + link._id
            })
            .success(function() {
                $scope.links.splice(index, 1);
            })
    }

    $scope.updateLink = function(index) {
        $scope.showList = false;
        $scope.showEdit = true;
        var link = $scope.links[index];
        $scope.edit = link;

    }
    $scope.update = function() {
        $http({
                method: 'PUT',
                url: '/api/update/' + $scope.edit._id,
                data: JSON.stringify($scope.edit)
            })
            .success(function() {
                $scope.showEdit = false;
                $scope.getLinks();
            })
    }
});

app.controller('ContentController', function($scope, $http) {
    $('.error').removeClass("hideError");
    $scope.shortenurlForm = function() {
        $http({
            method: 'POST',
            url: '/api/add',
            data: JSON.stringify($scope.shortenurl)
        }).success(function(data, status, headers, cfg) {
            var finalUrl = this.location.href + $scope.shortenurl.tinyurl;
            swal({
                    title: "TinyUrl",
                    text: finalUrl,
                    type: "success",
                    showCancelButton: true,
                    cancelButtonText: "Close",
                    confirmButtonColor: "#698693",
                    confirmButtonText: " Copy ",
                    closeOnConfirm: false,
                    closeOnCancel: false
                },
                function(isConfirm) {
                    if (isConfirm) {
                        var clipboard = new Clipboard('button.confirm', {
                            text: function() {
                                return finalUrl;
                            }
                        });
                        clipboard.on('success', function(e) {
                            swal({
                                    title: "Copied!",
                                    text: "The url has been copied.",
                                    type: "success",
                                    closeOnConfirm: false
                                },
                                function() {
                                    location.reload();
                                });
                        });
                        clipboard.on('error', function(e) {
                            swal({
                                    title: "Failed!",
                                    text: "The url can't be copied.",
                                    type: "error",
                                    closeOnConfirm: false
                                },
                                function() {
                                    location.reload();
                                });
                        });
                    } else {
                        location.reload();
                    }


                });
        }).error(function(data, status, headers, cfg) {
            swal("Failed!", "Please try again!", "error");
        })
    };
});
app.controller('FooterController', function($scope) {
    $scope.today = new Date();
});

app.directive('ensureUnique', ['$http', function($http) {
    return {
        require: 'ngModel',
        link: function(scope, ele, attrs, c) {
            scope.$watch(attrs.ngModel, function() {
                $http({
                    method: 'POST',
                    url: '/api/check',
                    data: { 'tinyurl': ele.val() }
                }).success(function(data, status, headers, cfg) {
                    c.$setValidity('unique', data.unique);
                }).error(function(data, status, headers, cfg) {
                    c.$setValidity('unique', false);
                });
            });
        }
    };
}]);