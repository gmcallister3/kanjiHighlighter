"use strict";

angular.module('KanjiApp').component('kanjiUser', {
    templateUrl: 'kanjiUser.html',
    controller: ['WKService', KanjiUserController],
    bindings: {}
});

/**
 * Object to represent a User.
 * Persists user settings (WK API Key, Genki enabled, Genki level) to chrome local storage
 * Does not persist WK statistics because they will be retrieved on each program execution
 */
function KanjiUserController(wkService) {

    var ctrl = this;
    ctrl.chromeStorageKey = 'userData';
    ctrl.apiKeyConfirmed = false;
    ctrl.userSettings = {
        apiKey: '',
        //TODO make genkiChapter 0 when disabled
        genkiChapter: 1,
        enableGenki: false
    };
    ctrl.wkData = {};

    chrome.storage.local.getBytesInUse(ctrl.chromeStorageKey, function(inUse) {
        if (inUse != 0) {
            chrome.storage.local.get(ctrl.chromeStorageKey, function(obj) {
                var settings = obj[ctrl.chromeStorageKey]
                ctrl.userSettings.genkiChapter = settings.genkiChapter;
                ctrl.userSettings.enableGenki = settings.enableGenki;
                ctrl.userSettings.apiKey = settings.apiKey;
                getWKUser();
            });
        }
    });

    ctrl.getUserSettings = function() {
        //TODO add logic for checking chrome storage
        return ctrl.userSettings;
    }

    ctrl.saveUserSettings = function() {
        if (ctrl.userSettings.apiKey.length === 32) {
            getWKUser();
        }
    };

    //Probably not necessary
    ctrl.updateGenkiUser = function() {
        saveSettingsToChrome();
    }

    function getWKUser() {
        wkService.getWKData(ctrl.userSettings.apiKey).then(function(data) {
            if (data['user_information']) {
                ctrl.apiKeyConfirmed = true;
                ctrl.wkData.user = data['user_information'];
                saveSettingsToChrome();
                //If user_information field exists, requested_information is guaranteed to exist
                // var kanjiDict = parseKanjiInformation(data['requested_information']);
                // ctrl.wkData.kanjiDict = kanjiDict;
                // highlighter.parse()
                chrome.tabs.query({
                    active: true,
                    currentWindow: true
                }, function(tabs) {
                    var tabId = tabs[0].id
                    chrome.tabs.sendMessage(tabId, {
                        type: "from_extension",
                        text: "parse",
                        userSettings: {
                            wk: ctrl.wkData.user.level,
                            genki: ctrl.userSettings.genkiChapter
                        }
                    })
                })
            } else {
                //TODO - UI error?
            }
        }).catch(function(error) {
            console.log(error);
        });
    };

    function saveSettingsToChrome() {
        var payLoad = {};
        payLoad[ctrl.chromeStorageKey] = ctrl.userSettings;
        chrome.storage.local.set(payLoad, function(status) {
            console.log("Data saved to chrome storage.");
        });
    };

    function parseKanjiInformation(data) {
        var kanjiDict = {};
        data.forEach((kanji) => {
            kanjiDict[kanji.character] = kanji.level;
        });
        return kanjiDict;
    };

    function normalizeGenkiChapter(chapter) {
        //So first chapter (3) corresponds to starting at level 1
        return chapter - 2;
    }
};
