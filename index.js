angular.module('KanjiApp', ['ngMaterial', 'ngMessages'])
    .config(function($mdThemingProvider) {
        $mdThemingProvider.theme('jpn')
            .primaryPalette('red')
            .accentPalette('red');
    })


//Limitation notes: doesn't work on google maps

//Bugs: weird nesting html spans (check erin.ne.jp)


//TODO:
//      Redo unit tests to get all passing
//      Add a thumbnail
//      Upload to github
//      Package in chrome store
//      Add readme
