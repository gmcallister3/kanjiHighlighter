"use strict";

angular.module('KanjiApp').factory('WKService', ['$http', function($http) {

    var ctrl = this;

    ctrl.getWKData = function(apiKey) {
        if (apiKey) {
                return $http.get(
                    'https://www.wanikani.com/api/user/' + apiKey + '/user-information'
                ).then(function(response) {
                    //200 Response may not return data if apiKey is unused
                    return response.data;
                }).catch(function(error) {
                    console.log(error);
                    return error.data;
                });
            } else {
            console.log("Error: Please register an apiKey with this service.");
        }
    }

    return ctrl;
}]);
