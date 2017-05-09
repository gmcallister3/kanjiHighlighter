"use strict";

//Credit to looki for the CSS_GLOBAL and WaniKani kanji set
//https://github.com/looki/kanji-highlighter

/**
 * Highlighter service for use by a component in the application.
 * Will parse/highlight the page on load then statistics can be retrieved through service calls
 */
var highlighter = function() {

    var storageKey = "userLevel"
    var userLevels = {
        //Normalized so both should default to 1
        wk: 1,
        genki: 1
    }

    chrome.storage.sync.getBytesInUse(storageKey, function(inUse) {
        if (inUse != 0) {
            chrome.storage.sync.get(storageKey, function(obj) {
                var settings = obj[storageKey]
                highlighter.setUserSettings(settings.wk, settings.genki)
                highlighter.parse()
            });
        }
    });

    function saveSettingsToChrome() {
        var payLoad = {};
        payLoad[storageKey] = userLevels;
        chrome.storage.sync.set(payLoad, function(status) {
            console.log("User Level Data saved to chrome storage.");
        });
    };

    var kanjiRegex = /[\u4e00-\u9faf\u3400-\u4dbf]/;
    var notKanjiRegex = /[^\u4e00-\u9faf^\u3400-\u4dbf]+/g;
    var kanjiText = '';
    var notKanjiText = '';

    function getKanjiOnPage() {
        return kanjiText;
    }

    function getNotKanjiOnPage() {
        return notKanjiText;
    }

    var genkiLib = [
        /*3:*/
        "一二三四五六七八九十百千方円時",
        /*4:*/
        "日本人月火水木金土曜上下中半",
        /*5:*/
        "山川元気天私今田女男見行食飲",
        /*6:*/
        "東西南北口出右左分先生大学外国",
        /*7:*/
        "京子小会社父母高校毎語文帰入",
        /*8:*/
        "員新聞作仕事電車休言読思次何",
        /*9:*/
        "午後前名白雨書友間家話少古知来",
        /*10:*/
        "住正年空買町長道雪立自夜朝持",
        /*11:*/
        "手紙好近明病院映画歌市所勉強有旅",
        /*12:*/
        "昔々神早起牛使働連別度赤青色",
        /*13:*/
        "物鳥料理特安飯肉悪体空港着同海昼",
        /*14:*/
        "彼代留族親切英店去急乗当音楽医者",
        /*15:*/
        "死意味注夏魚寺広転借走建地場足通",
        /*16:*/
        "供世界全部始週以考開屋方運動教室",
        /*17:　*/
        "歳習主結婚集発表品字活写真歩野",
        /*18:*/
        "目的力洋服堂授業試験貸図館終宿題",
        /*19:*/
        "春秋冬花様不姉兄漢卒工研究質問多",
        /*20:　*/
        "皿声茶止枚両無払心笑絶対痛最続",
        /*21:　*/
        "信経台風犬重初若送幸計遅配第妹",
        /*22:*/
        "記銀回夕黒用守末待残番駅説案内忘",
        /*23:　*/
        "顔情怒変相横比化違悲調査果感答"
    ];

    var wkLib = [
        /* 1:*/
        "七二三山女大入九人八上一川力口下十工",
        /* 2:*/
        "千丁才右水火白玉立小手目又四夕日月正子了出六刀天犬王左石五田土円文丸木中本",
        /* 3:*/
        "牛公切少太戸止外矢母万父久広生分友用方北半市台引古今心午毛兄元内冬",
        /* 4:*/
        "花竹他氷皮皿休主糸耳町虫不仕車赤百村見気名写貝礼申去字央男号世年打平代早足先",
        /* 5:*/
        "図肉学交同行西体声走谷雨空金音青林回作近池里社会光売毎何麦角自弟米形来色当多考羽草言",
        /* 6:*/
        "姉有亡化安両血明店知歩死南科茶活海全地羊前長星次京東室国曲食妹夜州後直点思画首向",
        /* 7:*/
        "札未由辺失必家弱末校紙教理魚鳥船雪黄週欠風通黒夏民高付記氏強組時以",
        /* 8:*/
        "対君投役研買馬絵楽話雲数所住電合反間答番決医局身助朝場者道支究森",
        /* 9:*/
        "乗仮負県待重表物新予使勝泳具部持送度談服美和返定界発客事受始実相屋要苦",
        /*10:*/
        "農終鳴親集酒速読業頭院飲顔聞習調最転路運鉄葉漢進横語落算歌配起開線軽病",
        /*11:*/
        "意位神洋成争味伝指初低良好育便放競注拾仲特努共波老労秒追令功働別利命岸昔戦級",
        /*12:*/
        "員階章短都第倍深温庭祭動息根流商島登童悲植期歯勉寒旅消陽暑球着族湯泉悪港野",
        /*13:*/
        "練駅願暗詩銀館士標課然賞鏡謝映問様想橋億熱養緑疑皆像殺料器輪情福題整感選宿",
        /*14:*/
        "例協季固周求技格能私骨卒囲望約基術参的残雰材妥希束折頑念松完芸性",
        /*15:*/
        "寺飯列秋帰岩昼区計建坂司泣猫軍英築信変仏式法毒昨晩夫単晴勇丈紀浅春",
        /*16:*/
        "冒遠保阪真守急箱荷典府喜笑辞取弁留証面係門浴険冗品専危政園曜存書幸関治",
        /*17:*/
        "兵説恋幻鼻席塩結無果干梅非渉是識官因底愛覚警側虚常細敗署栄薬堂察原",
        /*18:*/
        "煙訓報弓汽喫等句験僧胸洗達可脳類種忘禁枚静借禅焼座祈告試許",
        /*19:*/
        "加笛史易連比順減節若財布閥舌宙混暴団履忙得徒困善冊続宇絡歴乱容詞改昆",
        /*20:*/
        "飛震災在産嫌経妻圧夢倒裕穴議被尻害尾論罪難機個厚確防犯妨余臭械率",
        /*21:*/
        "資判権設評任批検際敵企増責挙制務件総岡断認解税義審済委査素省条派",
        /*22:*/
        "応各脱誕提坊置案勢統営値態過援策吸藤領観価宮寝賀副域姿罰費状示",
        /*23:*/
        "裁収贅停準職師革導律鬼看割施崎護規秀宅幹呼張現沢俳城乳優則演備",
        /*24:*/
        "供違質株製額狭届腰肩庁型載触管差視量象境武述環展祝輸燃販担腕層",
        /*25:*/
        "替肥模居含与渡限票況影捕景抜掛逮訟属鮮補慣絞捜隠豊満構効候輩巻訴響",
        /*26:*/
        "接占振討針徴怪獣突再障鉛筆較河菓刺励激故貯往創印造復独汗豚郵従授我",
        /*27:*/
        "貸訪誘退迫途段痛胃眠迷極靴症給健端招就濃織郎昇締惑悩睡屈康暇怒腹",
        /*28:*/
        "浜潔衆巨微婦凍児奇麗移妙逆稚博撃録清修隊券益精程憲並傘絶幼綺攻処庫冷",
        /*29:*/
        "積杯監欧乾雄韓閣僚怖烈猛略娘宗寄江促催宴臣督診詰恐街板添索請緊航壊",
        /*30:*/
        "盗騒懐遊浮系版預適貧翌延越符婚旗押渇魅快照覧更飾漏枕撮詳乏背購",
        /*31:*/
        "救探粉棒融既菜編華普豪鑑除幾尋廊倉孫径泥嘆驚帯散貨陸脈均富徳偵巣掃似離墓",
        /*32:*/
        "興複秘迎志卵眼序衛賛飼密績銭込祖雑党暖厳欲染机恩永液捨訳酸桜汚採傷",
        /*33:*/
        "装異筋皇窓簡誌否垂宝拡灰宣忠納盛砂肺著蔵諸蒸裏賃操敬糖閉漠暮尊熟",
        /*34:*/
        "沿拝粋聖磁射歓劇豆枝爪貴奴隷芋縮紅幕純推承損刻揮誤丼降薦臓縦腐源吐勤",
        /*35:*/
        "汁酢舎銅酔破滞亀彼炎介厄紹講互剣寿杉鍋払湖醤測油恥彫噌為遅熊己獄",
        /*36:*/
        "継牙甘舞般鹿超廃債献療姓貿遺及維縄津伎伸奈幅頼沖摘核踏旧盟将依換諾",
        /*37:*/
        "償募執戻抗湾遣聴臨塁陣旬兆契刑香崩患抵爆弾闘恵跳昭漁跡削掲狙葬抱",
        /*38:*/
        "致齢奏刊伴却慮称賄択描緒緩賂贈需避繰奥懸房盤託妊娠扱逃宜傾還併抑",
        /*39:*/
        "雇岐仙奪拒鋼甲埼群充勧御譲銃項圏免埋祉謙邦渋壁斐棋片躍稲鈴枠隆控阜慎",
        /*40:*/
        "排敷薄雅隣顧頻柱唱吹駆孝褒兼俊巡堀戒携衝敏鋭獲透誉殿剤駐殖茂繁犠",
        /*41:*/
        "蜜徹瀬包措撤至墟蜂蛍虎酎郷艦仁炭拳潜鉱衣偽侵棄拠伺樹遜儀誠畑",
        /*42:*/
        "括荒堅喪綱斎揚到克床哲暫揺握掘弧泊枢析網糾範焦潟滑袋芝肝紛柄軸挑双",
        /*43:*/
        "裂露即垣珍封籍貢朗誰威沈滋摩柔岳刷牧距趣旨撲擦懲炉滅泰琴沼斉慰筒潮襲懇",
        /*44:*/
        "謎芽嵐吉俺朱桃髪梨涙僕丘雷匹斗竜缶笠娯寸姫縁侍忍刃翼塔叫棚粒釣叱砲辛",
        /*45:*/
        "卓磨湿翔塊凶狩鐘肌澄菌硬陰稼溝滝狂賭裸塾眺呪曇井舟矛疲暦嬢也脚魂嫁頃霊",
        /*46:*/
        "鳩棟墨寮魔鈍穏泡碁吾帝幽零寧斬猿歳椅鍵瞳瞬錬癖租黙鍛綿阻菊穂俵庄誇架涼盆孔",
        /*47:*/
        "芯欺巾爽佐瞭粘砕哀尺柳霧詐伊炊憎帽婆如墜塀扉扇憩恨幣崖掌挿畳滴胴箸虹唇粧",
        /*48:*/
        "蛇辱闇悔憶溶輝耐踊賢咲脇遂殴塗班培盾麻脅彩尽蓄騎隙畜飢霜貼鉢帳穫斜灯迅蚊餓",
        /*49:*/
        "陛俗駒桑悟抽拓誓紫剛礎鶴壇珠概征劣淡煮覆勘奨衰隔潤妃謀浸尼唯刈陶拘",
        /*50:*/
        "漂簿墳壮奮仰銘搬把淀伯堤訂巧堰彰廷邪鰐峰亭疫晶洞涯后翻偶軌諮漫蟹鬱唐駄",
        /*51:*/
        "亮偉召喚塚媛慈挟枯沸浦渦濯燥玄瓶耕聡肪肯脂膚苗蓮襟貞軒軟邸郊郡釈隅隻頂",
        /*52:*/
        "乃倫偏呂唆噴孤怠恒惰慢擁殊没牲猟祥秩糧綾膨芳茨覇貫賠輔遇遭鎖陥陳隼須颯",
        /*53:*/
        "丹准剰啓壌寛帥徐惨戴披据搭曙浄瓜稿緋緯繊胞胡舗艇莉葵蒙虐諒諭錦随駿騰鯉",
        /*54:*/
        "且傲冠勲卸叙呆呈哺尚庶悠愚拐杏栞栽欄疎疾痴粛紋茎茜荘謡践逸酬酷鎌阿顕鯨",
        /*55:*/
        "之伏佳傍凝奉尿弥循悼惜愉憂憾抹旦昌朴栃栓瑛癒粗累脊虜該賓赴遼那郭鎮髄龍",
        /*56:*/
        "凛凡匠呉嘉宰寂尉庸弊弦恭悦拍搾摂智柴洪猶碑穀窒窮紳縛縫舶蝶轄遥錯陵靖飽",
        /*57:*/
        "乙伐俸凸凹哉喝坪堕峡弔敢旋楓槽款漬烏瑠盲紺羅胎腸膜萌蒼衡賊遍遮酵醸閲鼓",
        /*58:*/
        "享傑凌剖嘱奔媒帆忌慨憤戯扶暁朽椎殻淑漣濁瑞璃硫窃絹肖菅藩譜赦迭酌錠陪鶏",
        /*59:*/
        "亜侮卑叔吟堪姻屯岬峠崇慶憧拙擬曹梓汰沙浪漆甚睦礁禍篤紡胆蔑詠遷酪鋳閑雌",
        /*60:*/
        "倹劾匿升唄囚坑妄婿寡廉慕拷某桟殉泌渓湧漸煩狐畔痢矯罷藍藻蛮謹逝醜"
    ];

    function convertLib(lib) {
        var mapping = {}
        for (var i = 1; i <= lib.length; i++) {
            var line = lib[i - 1]
            for (var j = 0; j < line.length; j++) {
                var k = line.charAt(j)
                mapping[k] = i
            }
        }
        return mapping
    }

    var maxLevels = {
        //TODO make this dynamic
        wk: 60,
        genki: genkiLib.length
    }

    //Create dicts out of libs (mapping from kanji to level)
    var genkiDict = convertLib(genkiLib)
    var wkDict = convertLib(wkLib)

    function categorizeKanji(char) {
        //If not in either dictionary, never will be learned
        var genkiLevel = 0
        var wkLevel = 0
        var lvlDiff = 0
        if (wkDict[char]) {
            wkLevel = wkDict[char]
        }
        if (genkiDict[char]) {
            genkiLevel = genkiDict[char]
        }
        if (genkiLevel === 0 && wkLevel === 0) {
            return 'neverLearned'
            //If only one dictionary knows the kanji then take the that lvlDiff
        } else if (genkiLevel === 0) {
            lvlDiff = wkLevel - userLevels.wk
        } else if (wkLevel === 0) {
            lvlDiff = genkiLevel - userLevels.genki
        } else {
            //If both known take minimum lvlDiff (dictLvl - userLvl) between both sources
            lvlDiff = Math.min(genkiLevel - userLevels.genki, wkLevel - userLevels.wk)
        }
        //negative for known, so min will be earliest learned
        //positive for unkown, so min will be learned soonest

        //If 0 < lvlDiff < 5 then soonLearned
        if (0 < lvlDiff && lvlDiff < 5) {
            return 'soonLearned'
        }
        //If -59 < lvlDiff <= 0 then known_
        if (-59 < lvlDiff && lvlDiff <= 0) {
            return 'known_' + Math.abs(lvlDiff)
        }
        //If 5 <= lvlDiff <= 59 then unknown_
        if (5 <= lvlDiff && lvlDiff <= 59) {
            return 'unknown_' + lvlDiff
        }
    }

    function getHTMLTag(newClass, char) {
        return "<span class='" + newClass + "'>" + char + "</span>"
    }

    //Color Scheme:
    //Yellow (#ffff00) constant alpha at 0.5 for kanji to be learned in less than 5 levels
    //Grey (#bebebe) alpha at 1 for kanji not going to be learned

    /**
     * Generates a red color string for styling based on the level/chapter it is learned
     * Red (#ff0000) for unknown kanji, alpha at 0.70 for last learned kanji decrease alpha by 0.02 every level below (with 0.10 being the lowest)
     * If kanji is 35+ levels above, all red alphas will be the same
     *
     * @param  lvlDiff determines the alpha value to use, according to rule above
     * @return String to use for styling of parsed html elements
     */
    function getRedColorStr(lvlDiff) {
        if (lvlDiff > 30) {
            lvlDiff = 30
        }
        var alpha = (lvlDiff * 1 + 10) / 100
        return "rgba(255, 0, 0, " + alpha + ")"
    }

    /**
     * Green (#00ff00) for known kanji, decrease the alpha by 0.05 every level past knowing
     *
     * @param lvlDiff defined to be positive when user level is greater than kanji level
     * @return String to use for styling of parsed html elements
     */
    function getGreenColorStr(lvlDiff) {
        if (lvlDiff > 18) {
            lvlDiff = 18
        }
        var alpha = (100 - lvlDiff * 5) / 100
        return "rgba(0, 255, 0, " + alpha + ")"
    }

    return {
        /**
         * Sets the user settings to prepare for parsing text
         * @param wk    The WankiKani level of user
         * @param genki     The genki level of user
         */
        setUserSettings: function(wk, genki) {
            //Don't go over maximum levels
            if (wk > 60) {
                userLevels.wk = 60
            } else {
                userLevels.wk = wk
            }

            if (genki > 22) {
                userLevels.genki = 22
            } else {
                userLevels.genki = genki
            }
            saveSettingsToChrome()
            //only need to update styling when levels change
            var css = highlighter.generateStyling();
            $(css).appendTo('head')
        },

        /**
         * Main function of this service.  Highlights all kanji according to dictionary provided, dictionary hard-coded and user levels
         * Be sure to call setUserSettings() before parsing, otherwise default user levels will be used (both lvl 1)
         * @param wkDict a mapping of kanji to level from the WK library
         * @return the raw text that was processed on the page
         */
        parse: function() {
            var bodyText = '';
            $('body *:not(noscript):not(script):not(style):not(textarea):not(div):not([class^=jasmine]):not([class^=known_]):not([class^=unknown_]):not([class^=soonLearned]):not([class^=neverLearned])').each(function(text) {
                var element = $(this)
                //May want to check for children so no duplicates
                var newHtml = ''
                var html = element.html()
                var i = html.length - 1
                while (i >= 0) {
                    //Edits strings from back to front because we are extending length with new tags
                    var e = html.charAt(i)
                    if (kanjiRegex.test(e)) {
                        kanjiText += e
                        var kanjiClass = categorizeKanji(e)
                        var tag = getHTMLTag(kanjiClass, e)
                        html = html.slice(0, i) + tag + html.slice(i + 1)
                    } else {
                        notKanjiText += e
                    }
                    i--
                }


                //For testing/debugging, in production need to keep old html
                // var elementText = element.text();
                // bodyText += elementText;
                // for (var i = 0; i < elementText.length; i++) {
                //     var e = elementText.charAt(i)
                //     if (kanjiRegex.test(e)) {
                //         kanjiText += e
                //         var kanjiClass = categorizeKanji(e)
                //         newHtml += getHTMLTag(kanjiClass, e)
                //     } else {
                //         notKanjiText += e
                //         newHtml += e
                //     }
                // }
                element.html(html)
            });
            return bodyText;
        },

        generateStyling: function() {
            var str = '<style>'
            var CSS_GLOBAL = "display:inline!important;margin:0!important;padding:0!important;border:0!important;" +
                "outline:0!important;font-size:100%!important;vertical-align:baseline!important;";
            str += '.neverLearned { ' + CSS_GLOBAL + ' background-color: rgba(190, 190, 190, 0.6) !important; /*color: black !important;*/} '
            str += '.soonLearned { ' + CSS_GLOBAL + ' background-color: rgba(255, 255, 0, 0.4) !important; /*color: black !important;*/}'
            //find max possible lvl difference between the two learning sources for red styling
            var maxDiff = 0;
            if (userLevels.wk === 0) {
                maxDiff = maxLevels.genki - userLevels.genki
            } else if (userLevels.genki === 0) {
                maxDiff = maxLevels.wk - userLevels.wk
            } else {
                maxDiff = Math.max(maxLevels.genki - userLevels.genki, maxLevels.wk - userLevels.wk)
            }
            for (var i = 5; i <= maxDiff; i++) {
                //.unknown_5 is 5 levels above knowing
                str += '.unknown_' + i + ' { ' + CSS_GLOBAL + ' background-color: ' + getRedColorStr(i) + ' !important; /*color: black !important;*/}'
            }
            //Need max user lvl between both sources to know what maxDiff could be for green styling
            maxDiff = Math.max(userLevels.wk, userLevels.genki)
            for (var i = 0; i <= maxDiff; i++) {
                //.known_0 is known at current level
                str += '.known_' + i + ' { ' + CSS_GLOBAL + ' background-color: ' + getGreenColorStr(i) + ' !important; /*color: black !important;*/ }'
            }
            str += '</style>'
            return str
        }
    }
}()

//Re-highlight when user settings updated
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log(sender.id)
    if (request.text === 'parse') {
        highlighter.setUserSettings(request.userSettings.wk, request.userSettings.wk)
        highlighter.parse()
    }
    return true
})
