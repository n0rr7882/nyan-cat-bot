const TeleBot = require('telebot');
const moment = require('moment-timezone');
const cool = require('cool-ascii-faces');

const autochat = require('./autochat');

const TOKEN = process.env.TOKEN ? process.env.TOKEN : require('./config/config').token;
const bot = new TeleBot(TOKEN);

const GREETING_WORDS = {
    'morning': ['안녕!', '좋은아침!', '보이루', 'Good morning!'],
    'afternoon': ['안녕!', '맛있는 점심', '안녕~', '개꿀~'],
    'evening': ['안녕!', '안녕~ 빨리 집가!', '완벽한 하루였다..', 'ㅎㅇㅎㅇ!'],
    'night': ['안녕!', '힉, 이시간까지 뭐하는거야!', '곧 잘시간', '굳이브닝!']
};

const DAY = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

bot.on(/^(hello|hi|hey|안녕|ㅎㅇ)/gi, msg => {
    let now = moment(new Date).tz('Asia/Seoul').hour();
    let timeZone = undefined;

    if (now >= 5 && now < 11) timeZone = 'morning';
    if (now >= 11 && now < 17) timeZone = 'afternoon';
    if (now >= 17 && now < 21) timeZone = 'evening';
    if ((now >= 21 && now < 24) || (now >= 0 && now < 5)) timeZone = 'night';

    msg.reply.text(`${GREETING_WORDS[timeZone][Math.round(Math.random() * 3)]} ${cool()}`);
});

bot.on(/(bye|잘가|ㅂㅂ|ㅃ)/gi, msg => {
    msg.reply.text(`ㅂㅂ! ${cool()}`);
});

bot.on(/(지금|현재)?(.\s?)(몇(\s?)(시|분|초)|시(간|각))/g, msg => {
    let now = moment(new Date).tz('Asia/Seoul');
    msg.reply.text(`${(now.hour() / 12) ? '오후' : '오전'} ${now.hour() % 12}시 ${now.minute()}분 ${now.second()}초야!`);
});

bot.on(/오늘((이|은|의?)\s)(며칠|몇일|날짜|언제|무슨날)/g, msg => {
    let now = moment(new Date).tz('Asia/Seoul');
    msg.reply.text(`오늘은 ${now.date()}일 ${DAY[now.day()]}이야!`);
});

bot.on(/내일((이|은|의?)\s)(며칠|몇일|날짜|언제|무슨날)/g, msg => {
    let now = moment(new Date).tz('Asia/Seoul');
    msg.reply.text(`내일은 ${now.date()}일 ${DAY[(now.day() + 1) % 7]}이야!`);
});

/**
 * auto chat (ai)
 */

let autochatThreads = {};

bot.on(/\/ai (on|off)/, (msg, props) => {
    if (props.match[1] === 'on') {
        if (!autochatThreads[msg.chat.id]) autochatThreads[msg.chat.id] = setInterval(() => {
            if (Math.random() > 0.999) bot.sendMessage(msg.chat.id, autochat.ai());
        }, 1000);
    } else {
        if (autochatThreads[msg.chat.id]) clearInterval(autochatThreads[msg.chat.id]);
        autochatThreads[msg.chat.id] = undefined;
    }
});

bot.start();
