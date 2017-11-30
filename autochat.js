const rp = require('request-promise');
const urlencode = require('urlencode');
const DOMParser = require('dom-parser');
const parser = new DOMParser();

const SIMSIM = ['심심하다', '아 심심하네', '심심ㅠ', '뭐하지', '할거추천좀'];

module.exports = {

    ai: () => {
        return SIMSIM[Math.round(Math.random() * 4)];
    },

    reaction: () => {

    },

    getWhather: async area => {

        let result = ` * 오늘의 ${area} 날씨야!\n\n`;

        try {
            const areaData = JSON.parse(await rp(`http://maps.google.com/maps/api/geocode/json?address=${urlencode(area)}`));

            if (areaData.results.length === 0) return `${area} 어딘지 모르겠어`;
            else locInfo = areaData.results[0].geometry.location;

            const url = `http://www.kma.go.kr/wid/queryDFS.jsp?gridx=${Number(locInfo.lat).toFixed(0)}&gridy=${Number(locInfo.lng).toFixed(0)}`
            const whatherXML = parser.parseFromString(await rp(url), "text/xml");
            const whatherData = {
                hours: whatherXML.getElementsByTagName('hour'),
                temps: whatherXML.getElementsByTagName('temp'),
                wfKors: whatherXML.getElementsByTagName('wfKor'),
                wss: whatherXML.getElementsByTagName('ws')
            };

            for (let i = 0; (i < whatherData.hours.length && i < 8); i++) {
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

        let result = ` * ${thing} 중고 시세야!\n\n`;

        try {

            const junggoHTML = parser.parseFromString(await rp(`http://m.bunjang.co.kr/search/products?q=${urlencode(thing)}`), 'text/html');
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
            return `문제 발생! ${err.message}`;
        }
    },

    getCafeteria: async (schoolCode, date) => {

        const cafeteriaServer = `http://stu.sen.go.kr/sts_sci_md00_001.do?schulCode=${schoolCode}&schulCrseScCode=4&schulKndScCode=04&schMmealScCode=1`;

        let result = `* 오늘의 급식이야!\n\n`;

        try {

            let cafeteriaHTML = parser.parseFromString(await rp(cafeteriaServer), 'text/html');

            for(let i of cafeteriaHTML.getElementsByTagName('tbody')[0].getElementsByTagName('div')) {
                if(i.innerHTML && i.innerHTML.trim().substring(0,3).match(RegExp(`^${date}<`))) {
                    result += i.innerHTML.replace(/<br\/>/g, '\n');
                }
            }

            return result;

        } catch (err) {
            return `문제 발생! ${err.message}`;
        }
    },

    calculate: equation => {

        if(/^(?=.*)[0-9()*/+.-\s]+$/.exec(equation)) {
            try {

                const result = eval(equation);
                return `계산 결과: ${result}`;

            } catch (err) {
                return '이걸 계산하라고 준거야?';
            }
        } else {
            return '숫자만 계산할 수 있어ㅠㅠ';
        }

    }

};
