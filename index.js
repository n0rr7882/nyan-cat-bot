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

bot.on('*', msg => {
    console.log(msg);
    bot.sendMessage(msg.chat.id, 'Hello!');
});

let autochatThread = undefined;
bot.on(/\/ai (on|off)/, (msg, props) => {
    if (props.match[1] === 'on') {
        if (!autochatThread) autochatThread = setInterval(() => {
            if (Math.random() <= 0.05) bot.sendMessage(msg.chat.id, autochat.ai());
        }, 1000);
    } else {
        if (autochatThread) clearInterval(autochatThread);
        autochatThread = undefined;
    }
});

bot.start();

// bot.onText(/(안녕|ㅎㅇ|하이|hi|hello)/, msg => {
//     let now = moment(new Date).tz('Asia/Seoul').hour();
//     let timeZone = undefined;

//     if (now >= 5 && now < 11) timeZone = 'morning';
//     if (now >= 11 && now < 17) timeZone = 'afternoon';
//     if (now >= 17 && now < 21) timeZone = 'evening';
//     if ((now >= 21 && now < 24) || (now >= 0 && now < 5)) timeZone = 'night';

//     bot.sendMessage(msg.chat.id, `${GREETING_WORDS[timeZone][Math.round(Math.random() * 3)]} ${cool()}`);
// })

// bot.onText(/\/start/, msg => {
//     bot.sendMessage(msg.chat.id, "Welcome!");
// });

// bot.onText(/\/time/, msg => {
//     let now = new Date();
//     bot.sendMessage(msg.chat.id, `현재 시각은 ${now.getHours()}시 ${now.getMinutes()}분 ${now.getSeconds()}초야!`);
// });

// bot.onText(/\/date/, msg => {
//     let now = new Date();
//     bot.sendMessage(msg.chat.id, `오늘은 ${now.getMonth() + 1}월 ${now.getDate()}일 ${DAY[now.getDay()]}이야!`);
// });

// bot.onText(/\/echo (.+)/, (msg, match) => {
//     bot.sendMessage(msg.chat.id, match[1]);
// });

// bot.onText(/\/calc ([0-9-+=*\/()]+)/, (msg, match) => {
//     bot.sendMessage(msg.chat.id, eval(match[1]));
// });