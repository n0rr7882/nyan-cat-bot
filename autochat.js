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

    getWhather: async loc => {

        let result = ` * 오늘의 ${loc} 날씨야!\n`;

        try {
            const locInfo = JSON.parse(await rp(`http://maps.google.com/maps/api/geocode/json?address=${urlencode(loc)}`)).results[0].geometry.location;
            const url = `http://www.kma.go.kr/wid/queryDFS.jsp?gridx=${Number(locInfo.lat).toFixed(0)}&gridy=${Number(locInfo.lng).toFixed(0)}`
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
            const junggoHTML = parser.parseFromString(await rp(`http://m.bunjang.co.kr/search/products?q=${urlencode(thing)}`), 'text/html');
            const goodsinfo = junggoHTML.getElementsByClassName('goodsinfo');

            let result = ` * ${thing} 중고 시세야!\n\n`;

            for (let i = 0; i < goodsinfo.length; i++) {
                const name = goodsinfo[i].getElementsByClassName('name')[0].innerHTML;
                const price = goodsinfo[i].getElementsByTagName('em')[0].innerHTML;
                if (name.replace(/\s/g, '').indexOf(thing.replace(/\s/g, '')) > -1) {
                    result += `[${price}] ${(name.length < 15) ? name : name.substring(0, 15) + '...'}\n`;
                }
            }

            return result;

        } catch (err) {
            return `문제 발생! ${err.message}`
        }
    }

};