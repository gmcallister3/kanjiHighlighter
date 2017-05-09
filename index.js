angular.module('KanjiApp', ['ngMaterial', 'ngMessages'])
    .config(function($mdThemingProvider) {
        $mdThemingProvider.theme('jpn')
            .primaryPalette('red')
            .accentPalette('red');
    })
