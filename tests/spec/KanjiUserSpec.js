describe("kanjiUser", function() {

    var kanjiUser, wkService, $q;
    var defaultUserSettings = {
        apiKey: '',
        genkiChapter: 1,
        enableGenki: false
    };
    var testUserSettings = {
        apiKey: 'ABCDEFGHABCDEFGHABCDEFGHABCDEFGH',
        genkiChapter: 17,
        enableGenki: true
    };
    var validResponse = {
        'user_information': {
            'username': 'gmcallister',
            'level': 7
        },
        'requested_information': [{
                'character': '田',
                'level': 2
            },
            {
                'character': '四',
                'level': 4
            }
        ]
    };

    beforeEach(function(done) {
        module('KanjiApp');
        inject(function(_$componentController_, WKService, $rootScope, _$q_) {
            wkService = WKService;
            $componentController = _$componentController_;
            kanjiUser = $componentController('kanjiUser', {}, {});
            $q = _$q_;
            $scope = $rootScope.$new();
        });
        chrome.storage.local.remove(kanjiUser.chromeStorageKey, function(status) {
            // console.log("testing, removed data at key: " + kanjiUser.chromeStorageKey);
            done();
        });
    });

    afterEach(function(done) {
        chrome.storage.local.remove(kanjiUser.chromeStorageKey, function(status) {
            // console.log("done testing, cleared chrome storage.");
            done();
        });
    })

    it("should have been initialized properly", function() {
        expect(kanjiUser).toBeDefined();
        expect(kanjiUser.chromeStorageKey).toBeDefined();
    });

    describe("when local data doesn't exist", function() {
        var bytes;
        beforeEach(function(done) {
            chrome.storage.local.getBytesInUse(kanjiUser.chromeStorageKey, function(status) {
                bytes = status;
                done();
            });
        });

        it("should have default user data for apiKeyConfirmed and userSettings", function() {
            expect(kanjiUser.userSettings).toEqual(defaultUserSettings);
            expect(kanjiUser.apiKeyConfirmed).toBe(false);
        });

        it("should have empty local storage", function() {
            expect(bytes).toEqual(0);
        });

        describe("and user inputs an API key", function() {

            it("a key not equal to 32 characters in length is not saved to chrome storage and a UI error is displayed", function(done) {
                kanjiUser.userSettings.apiKey = 'INVALID';
                kanjiUser.saveUserSettings();
                chrome.storage.local.getBytesInUse(kanjiUser.chromeStorageKey, function(bytesInUse) {
                    expect(bytesInUse).toEqual(0);
                    done();
                });
                expect(kanjiUser.apiKeyConfirmed).toBe(false);
                //TODO UI test
            });

            // it("jasmine's beforeEach applies to each it declaration regardless of describe block", function() {
            //     expect(kanjiUser.userSettings).toEqual(defaultUserSettings);
            // });

            // it("a key equal to 32 characters in length is saved to chrome storage", function() {
            //     kanjiUser.userSettings = testUserSettings;
            //     kanjiUser.saveUserSettings();
            //     chrome.storage.local.getBytesInUse(kanjiUser.chromeStorageKey, function(bytesInUse) {
            //         expect(bytesInUse).not.toEqual(0);
            //     });
            // });
        });

        describe("and user enters API key of valid length", function() {

            beforeEach(function() {
                kanjiUser.userSettings.apiKey = testUserSettings.apiKey;
            });

            it("the user recieves data, confirms apiKey, and saves userSettings when the APIKey exists", function(done) {
                spyOn(wkService, 'getWKData').and.returnValue($q(function(resolve, reject) {
                    resolve(validResponse);
                }));
                expect(Object.getOwnPropertyNames(kanjiUser.wkData).length).toEqual(0);
                kanjiUser.saveUserSettings();
                $scope.$digest();
                expect(kanjiUser.apiKeyConfirmed).toBe(true);
                expect(Object.getOwnPropertyNames(kanjiUser.wkData).length).not.toEqual(0);
                //TODO Test UI sends valid toast
                chrome.storage.local.getBytesInUse(kanjiUser.chromeStorageKey, function(bytesInUse) {
                    expect(bytesInUse).not.toEqual(0);
                    done();
                });
            });

            it("the API input field shows an error and apiKey is left unconfirmed when the APIKey doesn't exist", function(done) {
                spyOn(wkService, 'getWKData').and.returnValue($q(function(resolve, reject) {
                    resolve({
                        'error': {
                            'code': 'user_not_found',
                            'message': 'User does not exist'
                        }
                    });
                }));
                kanjiUser.saveUserSettings();
                $scope.$digest();
                expect(kanjiUser.apiKeyConfirmed).toBe(false);
                expect(Object.getOwnPropertyNames(kanjiUser.wkData).length).toEqual(0);
                //TODO test for UI error display
                chrome.storage.local.getBytesInUse(kanjiUser.chromeStorageKey, function(bytesInUse) {
                    expect(bytesInUse).toEqual(0);
                    done();
                });
            });
        });

        describe("and user enables Genki and inputs a Chapter", function() {

            beforeEach(function() {
                kanjiUser.userSettings.enableGenki = true;
                kanjiUser.userSettings.genkiChapter = 17;
                //This method should be triggered on slider action
                kanjiUser.updateGenkiUser();
            });

            it("the genki level is saved to chrome storage", function(done) {
                chrome.storage.local.get(kanjiUser.chromeStorageKey, function(storedObj) {
                    var genkiChap = storedObj[kanjiUser.chromeStorageKey].genkiChapter;
                    expect(genkiChap).toBeDefined();
                    expect(genkiChap).not.toEqual(0);
                    done();
                });
            });
        });
    });

    describe("when local data does exist", function() {

        var bytes;
        beforeEach(function(done) {
            kanjiUser.userSettings = testUserSettings;
            spyOn(wkService, 'getWKData').and.returnValue($q(function(resolve, reject) {
                resolve(validResponse);
            }));
            kanjiUser.saveUserSettings();
            $scope.$digest();
            chrome.storage.local.getBytesInUse(kanjiUser.chromeStorageKey, function(status) {
                bytes = status;
                done();
            });

        });

        it("the user settings are saved to chrome storage", function() {
            expect(bytes).not.toEqual(0);
        });

        it("kanjiUser refreshes kanjiDictionary associated with APIkey", function() {
            expect(kanjiUser.apiKeyConfirmed).toBe(true);
            expect(Object.getOwnPropertyNames(kanjiUser.wkData).length).toEqual(2);
        });

        it("updates chrome storage when Genki becomes disabled", function(done) {
            kanjiUser.userSettings.enableGenki = false;
            kanjiUser.updateGenkiUser();
            chrome.storage.local.get(kanjiUser.chromeStorageKey, function(storedObj) {
                var genkiStatus = storedObj[kanjiUser.chromeStorageKey].enableGenki;
                var genkiChap = storedObj[kanjiUser.chromeStorageKey].genkiChapter;
                expect(genkiChap).toEqual(testUserSettings.genkiChapter);
                expect(genkiStatus).toEqual(false);
                done();
            });
        });
    });
});
