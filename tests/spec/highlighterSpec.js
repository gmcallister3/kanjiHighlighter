describe("highlighter", function() {

    var kanjiSentence; //"お酒を飲みたいんですが宿題をしなくちゃいけない"
    var noKanjiSentence; //"しつれいします   !!I'm Graham"
    var kanjiNotKnownByWKorGenki; //"棠淵"
    var kanjiKnownByWKnotGenki; //"森娘"
    var kanjiKnownByGenkiNotWK = "";
    var textArea; //"危ない"
    var wkDict = {
        "曜": 16,
        "女": 1,
        "友": 3,
        "里": 5,
        "子": 2,
        "歌": 10,
        "包": 41,
        "踊": 48,
        "畑": 41,
        "食": 6
    }
    var genkiDict = {
        "曜": 2,
        "女": 3,
        "友": 7,
        "子": 5,
        "歌": 9,
        "食": 3　　　
    }
    var kanjiRegex = /[\u4e00-\u9faf\u3400-\u4dbf]+/g;
    var notKanjiRegex = /[^\u4e00-\u9faf^\u3400-\u4dbf]+/g;
    var sut;

    function getRGBaString(r, g, b, a) {
        return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")"
    }

    beforeEach(function() {
        module('KanjiApp');
        inject(function(_highlighter_) {
            sut = _highlighter_;
        });
        //Must put selectors here because html must load
        kanjiSentence = $('#kanjiSentence').text();
        nonKanjiSentence = $('#nonKanjiSentence').text();
        textArea = $('textarea').text();
        kanjiNotKnownByWKorGenki = $('#kanjiNotKnownByWKorGenki').text();
        kanjiKnownByWKnotGenki = $('#kanjiKnownByWKnotGenki').text();
    });

    describe("is initialized properly", function() {

        it("is defined", function() {
            expect(document).toBeDefined();
            expect($).toBeDefined();
            expect(sut).toBeDefined();
            expect(textArea).toEqual("危ない");
        });

        it("starts with the default coloring scheme", function() {
            //TODO
        });

        describe("parses html body text", function() {

            var parsedText;
            var kanjiText;
            var notKanjiText;
            var bodyText;
            beforeEach(function() {
                parsedText = sut.parse();
                //Manually parse all text in test HTML
                //No <div> tags because it will cause redundancies
                //Reset parsed text
                bodyText = '';
                kanjiText = '';
                notKanjiText = '';
                //Get all non-highlighted for body text
                $('body *:not(noscript):not(script):not(style):not(textarea):not(div):not([class^=jasmine]):not([class^=known_]):not([class^=unknown_]):not([class^=soonLearned]):not([class^=neverLearned])').each(function(text) {
                    var elt = $(this)
                    var elementText = $(this).text();
                    bodyText += elementText;
                    var kanji = kanjiRegex[Symbol.match](elementText);
                    var notKanji = notKanjiRegex[Symbol.match](elementText);
                    if (kanji) {
                        kanjiText += kanji.join('');
                    }
                    if (notKanji) {
                        notKanjiText += notKanji.join('');
                    }
                });
            });

            it("and gets all text excluding textareas", function() {
                expect(parsedText.length).toEqual(bodyText.length);
                expect(parsedText.includes("危ない")).toEqual(false);
            });

            it("with a correct kanjiRegex", function() {
                if (kanjiText) {
                    expect(sut.getKanjiOnPage()).toEqual(kanjiText);
                } else {
                    expect(sut.getKanjiOnPage()).toEqual('');
                }
            });

            it("with a correct notKanjiRegex", function() {
                if (notKanjiText) {
                    expect(sut.getNotKanjiOnPage()).toEqual(notKanjiText);
                } else {
                    expect(sut.getNotKanjiOnPage()).toEqual('');
                }
            });
        });
    });

    it("Only highlights the kanji, no hiragana/katakana", function() {

    });

    //Assuming color scheme can't be changed
    describe("properly highlights user-known kanji", function() {

        it("when a kanji is learned first in Genki the highlighting is green with correct alpha (user - wk: 17, genki: 19)", function() {
            //kanji: 曜
            //wk = 16
            //genki = 2
            //lvlDiff = 17
            sut.setUserSettings(17, 19)
            //Cannot put this in a beforeEach because each test case uses different userSettings
            sut.parse()
            var elt = $('#kanjiLearnedFirstByGenki > span')
            expect(elt.hasClass('known_17')).toEqual(true)
            expect(elt.css('background-color')).toEqual("rgba(0, 255, 0, 0.15)")
        });

        it("when a kanji is learned first in WK the highlighting is green with correct alpha (user - wk: 3, genki: 3)", function() {
            //kanji: 女
            //wk = 1
            //genki = 3
            //lvlDiff = 2
            sut.setUserSettings(3, 3)
            sut.parse()
            var elt = $('#kanjiLearnedFirstByWK > span')
            expect(elt.hasClass('known_2')).toEqual(true)
            expect(elt.css('background-color')).toEqual("rgba(0, 255, 0, 0.9)")
        });

        it("when a kanji is only learned by Genki so far the highlighting is green with correct alpha (user - wk: 1, genki: 9)", function() {
            //kanji: 友
            //wk = 3
            //genki = 7
            //lvlDiff = 2
            sut.setUserSettings(1, 9)
            sut.parse()
            var elt = $('#kanjiOnlyLearnedByGenki > span')
            expect(elt.hasClass('known_2')).toEqual(true)
            expect(elt.css('background-color')).toEqual("rgba(0, 255, 0, 0.9)")
        });

        it("when a kanji is only learned by WK so far the highlighting is green with correct alpha (user - wk: 9, genki: 1)", function() {
            //kanji: 里
            //wk = 5
            //genki = NA
            //lvlDiff = 4
            sut.setUserSettings(9, 1)
            sut.parse()
            var elt = $('#kanjiOnlyLearnedByWK > span')
            expect(elt.hasClass('known_4')).toEqual(true)
            expect(elt.css('background-color')).toEqual("rgba(0, 255, 0, 0.8)")
        });

        it("when a kanji is only learned long ago the highlighting is green with correct alpha (user - wk: 40, genki: 5)", function() {
            //kanji: 子
            //wk = 2
            //genki = 5
            //lvlDiff = 38
            sut.setUserSettings(40, 5)
            sut.parse()
            var elt = $('#kanjiLearnedEarly > span')
            expect(elt.hasClass('known_38')).toEqual(true)
            expect(elt.css('background-color')).toEqual("rgba(0, 255, 0, 0.1)")
        });
    });

    describe("properly highlights user-unknown kanji", function() {

        it("when a kanji is learned by first source in 5 or more levels the highlighting is red with correct alpha (user - wk: 3, genki: 4)", function() {
            //kanji: 歌
            //wk = 10
            //genki = 9
            //lvlDiff = 5
            sut.setUserSettings(3, 4)
            sut.parse()
            var elt = $('#kanjiNotLearned > span')
            expect(elt.hasClass('unknown_5')).toEqual(true)
            expect(elt.css('background-color')).toEqual("rgba(255, 0, 0, 0.2)")
        });

        it("when a kanji won't be learned for 35+ levels kanji from 36 diff and 40 diff will have same alpha (user - wk: 5, genki: 3)", function() {
            //kanji: 包 (wk= 41, genki = NA)
            //kanji: 踊　(wk= 48, genki = NA)
            //lvlDiff = 36
            //lvlDiff = 43
            sut.setUserSettings(5, 3)
            sut.parse()
            var elt = $('#kanjiLearned36 > span')
            var elt2 = $('#kanjiLearned43 > span')
            expect(elt.hasClass('unknown_36')).toEqual(true)
            expect(elt2.hasClass('unknown_43')).toEqual(true)
            expect(elt.css('background-color')).toEqual("rgba(255, 0, 0, 0.7)")
            expect(elt2.css('background-color')).toEqual("rgba(255, 0, 0, 0.7)")
        });

        it("when a kanji will not be learned by either the highlighting is grey (user - wk: 49, genki: 19)", function() {
            //kanji: 棠淵
            //wk = NA
            //genki = NA
            //lvlDiff = NA
            sut.setUserSettings(49, 19)
            sut.parse()
            var elt = $('#kanjiNotKnownByWKorGenki > span')
            expect(elt.hasClass('neverLearned')).toEqual(true)
            expect(elt.css('background-color')).toEqual('rgba(190, 190, 190, 0.6)')
        });

        it("highlights kanji to be learned by WK in less than 5 levels yellow (user - wk: 40, genki: 4)", function() {
            //kanji: 畑
            //wk = 41
            //genki = NA
            //lvlDiff = 1
            sut.setUserSettings(40, 4)
            sut.parse()
            var elt = $('#kanjiYellowWK > span')
            expect(elt.hasClass('soonLearned')).toEqual(true)
            expect(elt.css('background-color')).toEqual("rgba(255, 255, 0, 0.4)")
        });

        it("highlights kanji to be learned by Genki in less than 5 levels yellow (user - wk: 1, genki: 1)", function() {
            //kanji: 食
            //wk = 6
            //genki = 3
            //lvlDiff = 2
            sut.setUserSettings(1, 1)
            sut.parse()
            var elt = $('#kanjiYellowGenki > span')
            expect(elt.hasClass('soonLearned')).toEqual(true)
            expect(elt.css('background-color')).toEqual("rgba(255, 255, 0, 0.4)")
        });

    });


    //For later - will change alot of these highlighting tests
    it("allows user to change highlighting colors", function() {

    });
});
