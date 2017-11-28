const rp = require('request-promise');
const DOMParser = require('dom-parser');
const parser = new DOMParser();

const SIMSIM = ['심심하다', '아 심심하네', '심심ㅠ', '뭐하지', '할거추천좀'];

const URLS = {
    '광진구': 'http://www.kma.go.kr/wid/queryDFS.jsp?gridx=62&gridy=126',
    '구로구': 'http://www.kma.go.kr/wid/queryDFS.jsp?gridx=58&gridy=125',
    '여의도': 'http://www.kma.go.kr/wid/queryDFS.jsp?gridx=59&gridy=126',
    '마포구': 'http://www.kma.go.kr/wid/queryDFS.jsp?gridx=59&gridy=126',
    '건대': 'http://www.kma.go.kr/wid/queryDFS.jsp?gridx=62&gridy=126',
    '신촌': 'http://www.kma.go.kr/wid/queryDFS.jsp?gridx=59&gridy=126',
    '신림': 'http://www.kma.go.kr/wid/queryDFS.jsp?gridx=59&gridy=125',
    '먹골': 'http://www.kma.go.kr/wid/queryDFS.jsp?gridx=62&gridy=128',
    '공덕': 'http://www.kma.go.kr/wid/queryDFS.jsp?gridx=60&gridy=126',
    '송파구': 'http://www.kma.go.kr/wid/queryDFS.jsp?gridx=62&gridy=125',
    '은평구': 'http://www.kma.go.kr/wid/queryDFS.jsp?gridx=59&gridy=128',
    '종로구': 'http://www.kma.go.kr/wid/queryDFS.jsp?gridx=60&gridy=127',
    '강동구': 'http://www.kma.go.kr/wid/queryDFS.jsp?gridx=63&gridy=127',
    '마포구': 'http://www.kma.go.kr/wid/queryDFS.jsp?gridx=59&gridy=126',
    '강남구': 'http://www.kma.go.kr/wid/queryDFS.jsp?gridx=61&gridy=125',
    '관악구': 'http://www.kma.go.kr/wid/queryDFS.jsp?gridx=60&gridy=125',
    '동대문구': 'http://www.kma.go.kr/wid/queryDFS.jsp?gridx=61&gridy=127',
    '노원구': 'http://www.kma.go.kr/wid/queryDFS.jsp?gridx=61&gridy=128',
    '서대문구': 'http://www.kma.go.kr/wid/queryDFS.jsp?gridx=59&gridy=127',
    '서초구': 'http://www.kma.go.kr/wid/queryDFS.jsp?gridx=61&gridy=124',
    '성북구': 'http://www.kma.go.kr/wid/queryDFS.jsp?gridx=61&gridy=127',
    '중랑구': 'http://www.kma.go.kr/wid/queryDFS.jsp?gridx=62&gridy=127',
    '김포': 'http://www.kma.go.kr/wid/queryDFS.jsp?gridx=56&gridy=127',
    '서울': 'http://www.kma.go.kr/wid/queryDFS.jsp?gridx=61&gridy=125',
    '의정부': 'http://www.kma.go.kr/wid/queryDFS.jsp?gridx=61&gridy=131',
    '양주': 'http://www.kma.go.kr/wid/queryDFS.jsp?gridx=60&gridy=132',
    '남양주': 'http://www.kma.go.kr/wid/queryDFS.jsp?gridx=64&gridy=128',
    '안양': 'http://www.kma.go.kr/wid/queryDFS.jsp?gridx=60&gridy=123',
    '구리': 'http://www.kma.go.kr/wid/queryDFS.jsp?gridx=62&gridy=128',
    '도봉구': 'http://www.kma.go.kr/wid/queryDFS.jsp?gridx=61&gridy=129',
    '부천구': 'http://www.kma.go.kr/wid/queryDFS.jsp?gridx=57&gridy=126',
    '안산': 'http://www.kma.go.kr/wid/queryDFS.jsp?gridx=57&gridy=121',
    '하남구': 'http://www.kma.go.kr/wid/queryDFS.jsp?gridx=63&gridy=126',
    '인천': 'http://www.kma.go.kr/wid/queryDFS.jsp?gridx=51&gridy=131',
    '전주': 'http://www.kma.go.kr/wid/queryDFS.jsp?gridx=63&gridy=89',
    '대구': 'http://www.kma.go.kr/wid/queryDFS.jsp?gridx=89&gridy=90',
    '부산': 'http://www.kma.go.kr/wid/queryDFS.jsp?gridx=97&gridy=74',
    '속초': 'http://www.kma.go.kr/wid/queryDFS.jsp?gridx=87&gridy=141',
    '춘천': 'http://www.kma.go.kr/wid/queryDFS.jsp?gridx=72&gridy=133',
    '화천': 'http://www.kma.go.kr/wid/queryDFS.jsp?gridx=74&gridy=137',
    '서산': 'http://www.kma.go.kr/wid/queryDFS.jsp?gridx=52&gridy=107',
    '수원': 'http://www.kma.go.kr/wid/queryDFS.jsp?gridx=61&gridy=120'
};

module.exports = {

    ai: () => {
        return SIMSIM[Math.round(Math.random() * 4)];
    },

    reaction: () => {

    },

    getWhather: async loc => {

        let areaName = undefined;
        let url = undefined;

        for (let area in URLS) {
            if (area === loc) {
                areaName = area;
                url = URLS[area];
            }
        }

        if (!areaName) {
            areaName = '서울';
            url = URLS[areaName];
        }

        let result = `오늘의 ${areaName} 날씨야!\n`;

        try {
            const locationInfo = await rp(`http://maps.google.com/maps/api/geocode/json?address=${loc}`);
            const whatherXML = parser.parseFromString(await rp(url), "text/xml");
            const whatherData = {
                hours: whatherXML.getElementsByTagName('hour'),
                temps: whatherXML.getElementsByTagName('temp'),
                wfKors: whatherXML.getElementsByTagName('wfKor'),
                wss: whatherXML.getElementsByTagName('ws')
            };

            for (let i in whatherData.hours) {
                result += `${whatherData.hours[i].innerHTML}시 : [${whatherData.wfKors[i].innerHTML}] <${whatherData.temps[i].innerHTML}℃> ${Number(whatherData.wss[i].innerHTML).toFixed(1)}m/s\n`;
            }
            return result;

        } catch (err) {
            return `문제 발생! ${err.message}`;
        }

    },

    getHanReverTemp: async () => {
        try {
            const tempInfo = await rp(`http://hangang.dkserver.wo.tc`);
            return `지금 한강 수온은 ${JSON.parse(tempInfo).temp}℃야!`;
        } catch (err) {
            return `문제 발생! ${err.message}`;
        }
    },

    getJunggo: async thing => {
        try {
            const junggoHTML = parser.parseFromString(await rp(`http://m.bunjang.co.kr/search/products?q=${thing}`), 'text/html');
            console.log(junggoHTML);

        } catch (err) {
            return `문제 발생! ${err.message}`
        }
    }

};