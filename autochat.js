const rp = require('request-promise');
const moment = require('moment-timezone');
const urlencode = require('urlencode');
const DOMParser = require('dom-parser');
const cool = require('cool-ascii-faces');

const gridxy = require('./tools/gridxy');

const parser = new DOMParser();

const SIMSIM = ['심심하다', '아 심심하네', '심심ㅠ', '뭐하지', '할거추천좀'];

const GREETING_WORDS = {
    'morning': ['안녕!', '좋은아침!', '보이루', 'Good morning!'],
    'afternoon': ['안녕!', '맛있는 점심', '안녕~', '개꿀~'],
    'evening': ['안녕!', '안녕~ 빨리 집가!', '완벽한 하루였다..', 'ㅎㅇㅎㅇ!'],
    'night': ['안녕!', '힉, 이시간까지 뭐하는거야!', '곧 잘시간', '굳이브닝!']
};

const DAY = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];


module.exports = {

    ai: () => {
        return SIMSIM[Math.round(Math.random() * 4)];
    },

    react: payload => {

        if (/^(hi|hello|hey)|(안녕|ㅎㅇ)/gi.exec(payload)) {

            const now = moment(new Date).tz('Asia/Seoul').hour();
            let timeZone = undefined;

            if (now >= 5 && now < 11) timeZone = 'morning';
            if (now >= 11 && now < 17) timeZone = 'afternoon';
            if (now >= 17 && now < 21) timeZone = 'evening';
            if ((now >= 21 && now < 24) || (now >= 0 && now < 5)) timeZone = 'night';

            return `${GREETING_WORDS[timeZone][Math.round(Math.random() * 3)]} ${cool()}`;

        } else if (/(bye|잘가|잘자|굿밤|굳밤|ㅂㅂ|ㅃ)/gi.exec(payload)) {

            return `ㅂㅂ! ${cool()}`;

        } else if (/(지금|현재)?(.\s?)(몇(\s?)(시|분|초)|시(간|각))/g.exec(payload)) {

            const now = moment(new Date).tz('Asia/Seoul');
            return `${Math.floor(now.hour() / 12) ? '오후' : '오전'} ${now.hour() % 12}시 ${now.minute()}분 ${now.second()}초야!`;

        } else if (/오늘((이|은|의?)\s)(며칠|몇일|날짜|언제|무슨날)/g.exec(payload)) {

            const now = moment(new Date).tz('Asia/Seoul');
            return `오늘은 ${now.date()}일 ${DAY[now.day()]}이야!`;

        } else if (/내일((이|은|의?)\s)(며칠|몇일|날짜|언제|무슨날)/g.exec(payload)) {

            const now = moment(new Date).tz('Asia/Seoul');
            return `내일은 ${now.date() + 1}일 ${DAY[(now.day() + 1) % 7]}이야!`;

        } else if (/반가워/gi.exec(payload)) {

            return `나도 반가워! ${cool()}`;

        } else if (/(고마워|ㄱㅅ|감사)/gi.exec(payload)) {

            return 'ㅎㅎ';

        } else return undefined;

    },

    getWhather: async area => {

        let result = ` * 오늘의 ${area} 날씨야!\n\n`;

        try {
            const areaData = JSON.parse(await rp(`http://maps.google.com/maps/api/geocode/json?address=${urlencode(area)}`));

            if (areaData.results.length === 0) return `${area} 어딘지 모르겠어`;
            else locInfo = areaData.results[0].geometry.location;

            const gridInfo = gridxy.map(Number(locInfo.lat), Number(locInfo.lng));
            const whatherServer = `http://www.kma.go.kr/wid/queryDFS.jsp?gridx=${gridInfo.x.toFixed(0)}&gridy=${gridInfo.y.toFixed(0)}`;
            const whatherXML = parser.parseFromString(await rp(whatherServer), "text/xml");
            const whatherData = {
                hours: whatherXML.getElementsByTagName('hour'),
                temps: whatherXML.getElementsByTagName('temp'),
                wfKors: whatherXML.getElementsByTagName('wfKor'),
                wss: whatherXML.getElementsByTagName('ws')
            };

            for (let i = 0;
                (i < whatherData.hours.length && i < 8); i++) {
                result += `${whatherData.hours[i].innerHTML}시 : [${whatherData.wfKors[i].innerHTML}] <${whatherData.temps[i].innerHTML}℃> ${Number(whatherData.wss[i].innerHTML).toFixed(1)}m/s\n`;
            }
            return result;

        } catch (err) {
            console.error('getWhather: ' + err.message);
            return `ㅎㄷ 날씨서버가 이상해`;
        }

    },

    getHanRiverTemp: async () => {
        try {
            const tempInfo = await rp(`http://hangang.dkserver.wo.tc`);
            return `지금 한강 수온은 ${JSON.parse(tempInfo).temp}℃야!`;
        } catch (err) {
            console.error('getHanRiverTemp: ' + err.message);
            return `ㅎㄷ 모르겠어`;
        }
    },

    getJunggo: async thing => {

        const junggoServer = `http://m.bunjang.co.kr/search/products?q=${urlencode(thing)}`;

        let result = ` * ${thing} 중고 시세야!\n\n`;

        try {

            const junggoHTML = parser.parseFromString(await rp(junggoServer), 'text/html');
            const goodsinfo = junggoHTML.getElementsByClassName('goodsinfo');

            if (goodsinfo.length === 0) return `${thing}는 안보이는 것 같아!`;

            for (let i = 0; i < goodsinfo.length; i++) {
                const name = goodsinfo[i].getElementsByClassName('name')[0].innerHTML;
                const price = goodsinfo[i].getElementsByTagName('em')[0].innerHTML;
                if (name.replace(/\s/g, '').indexOf(thing.replace(/\s/g, '')) > -1) {
                    result += `[${price}] ${(name.length < 15) ? name : name.substring(0, 15) + '...'}\n`;
                }
            }

            return result;

        } catch (err) {
            console.error('getJunggo: ' + err.message);
            return `ㅎㄷ 서버도 중고로 쓰나봐`;
        }
    },

    getCafeteria: async (schoolCode, date) => {

        const cafeteriaServer = `http://stu.sen.go.kr/sts_sci_md00_001.do?schulCode=${schoolCode}&schulCrseScCode=4&schulKndScCode=04&schMmealScCode=1`;

        let result = `* 오늘의 급식이야!\n\n`;

        try {

            const cafeteriaHTML = parser.parseFromString(await rp(cafeteriaServer), 'text/html');
            const cafeteriaList = cafeteriaHTML.getElementsByTagName('tbody')[0].getElementsByTagName('div');
            for (let i of cafeteriaList) {
                if (i.innerHTML && i.innerHTML.trim().substring(0, 3).match(RegExp(`^${date}<`))) {
                    result += i.innerHTML.replace(/<br\/>/g, '\n');
                }
            }

            return result;

        } catch (err) {
            console.error('getCafeteria: ' + err.message);
            return `읭? 급식 못찾겠어`;
        }
    },

    calculate: equation => {

        try {

            if (/^(?=.*)[0-9()*/+.-\s]+$/.exec(equation)) {

                const result = eval(equation);
                return `계산 결과: ${result}`;

            } else {
                return '숫자만 계산할 수 있어ㅠㅠ';
            }

        } catch (err) {
            console.error('calculate: ' + err.message);
            return '이걸 계산하라고 준거야?';
        }

    }

};
