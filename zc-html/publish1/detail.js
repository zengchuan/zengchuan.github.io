var ZCApp = angular.module('ZCApp', []);

var ZCNewsDetailController = function ($scope, $http, $window, $sce) {
    var BASE_API_URL = 'https://zengchuan.github.io/zc-data/';
    function getQueryString(queryString, name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = queryString.substr(1).match(reg);
        if (r != null) {
            return decodeURI(r[2])
        }
        return null;
    }

    $scope.newsType = getQueryString($window.location.search, "newsType");
    $scope.newsId = getQueryString($window.location.search, "newsId");
    $scope.publishNewsMaster = {};
    $scope.publishNewsDetailList = [];

    $scope.deliberatelyTrustDangerousSnippet = function (html) {
        return $sce.trustAsHtml(html);
    };

    $scope.deliberatelyTrustDangerousSnippetSrc = function (html) {
        return $sce.trustAsResourceUrl(html);
    };

    var getNewsMaster = function(newsType, callback){
        $http.get(BASE_API_URL + newsType + '/publishNewsMaster').success(
            function (data) {
                for(var i = 0; i < data.length; i++){
                    var publishNewsMasterTemp = data[i];
                    if(publishNewsMasterTemp.newsId == $scope.newsId){
                        $scope.publishNewsMaster = publishNewsMasterTemp;
                    }
                }
                callback();
            }
        );
    }

    var getNewsDetail = function(newsType, newsId, callback){
        $http.get(BASE_API_URL + newsType + '/publishNewsDetail/' + newsId).success(
            function (data) {
                $scope.publishNewsDetailList = data;
                callback();
            }
        );
    }

    var getNewsDetailImage = function(index, callback){
        if(index < $scope.publishNewsDetailList.length){
            if($scope.publishNewsDetailList[index].contentFormatId === '2' || $scope.publishNewsDetailList[index].contentFormatId === '3'){
                $http.get(BASE_API_URL + $scope.newsType + '/publishNewsDetailImage/' + $scope.newsId + '/' + $scope.publishNewsDetailList[index].sortNo).success(
                    function (data) {
                        $scope.publishNewsDetailList[index].contentBinary = data.replace('\r\n', '');
                        if (!$scope.$$phase) {
                            $scope.$apply();
                        }
                        getNewsDetailImage(index + 1, callback);
                    }
                );
            } else {
                getNewsDetailImage(index + 1, callback);
            }
        } else {
            callback();
        }


    }

    var getNewsDetailImages = function(callback){
        if($scope.publishNewsDetailList){
            getNewsDetailImage(0, callback);

        }
    }


    getNewsMaster($scope.newsType, function () {
        getNewsDetail($scope.newsType, $scope.newsId, function () {
            getNewsDetailImages(function () {
            })
        })
    });

}

ZCApp.controller('ZCNewsDetailController', ZCNewsDetailController);
ZCApp.filter('trusted', ['$sce', function ($sce) {
    return function(url) {
        return $sce.trustAsResourceUrl(url);
    };}]);

