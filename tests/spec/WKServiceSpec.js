describe("WKService", function() {

    var $httpBackend, wkService;
    var validApiKey = 'ABCDEFGHABCDEFGHABCDEFGHABCDEFGH';
    var invalidApiKey = 'INVALID';
    var testUser = {
        user: 'Tester',
        level: 60
    }
    var error = {
        "error": {
            "code": "user_not_found",
            "message": "User does not exist."
        }
    }

    beforeEach(function() {
        module('KanjiApp');
        inject(function(_$httpBackend_, _WKService_) {
            $httpBackend = _$httpBackend_;
            wkService = _WKService_;
        });
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it("doesn't make an api request when there is no apiKey registered", function() {
        expect(wkService.getWKData()).not.toBeDefined();
    });

    it("returns an error when the apiKey is invalid", function() {
        $httpBackend.when("GET", 'https://www.wanikani.com/api/user/' + invalidApiKey + '/user-information')
            .respond(401, error);
        var dataPromise = wkService.getWKData(invalidApiKey);
        $httpBackend.flush();
        dataPromise.then(function(error) {
            expect(error).toEqual(error);
        })
    })

    it("retrieves user data from WK when a valid apiKey is registered", function() {
        $httpBackend.when("GET", 'https://www.wanikani.com/api/user/' + validApiKey + '/user-information')
            .respond(testUser);
        var dataPromise = wkService.getWKData(validApiKey);
        $httpBackend.flush();
        dataPromise.then(function(value) {
            expect(value).toEqual(testUser);
        });
    });
})
