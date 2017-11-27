const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TOKEN ? process.env.TOKEN : require('./config/config').token;
const bot = new TelegramBot(token, { polling: true });

const DAY = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

bot.onText(/\/start/, msg => {
    bot.sendMessage(msg.chat.id, "Welcome!");
});

bot.onText(/\/time/, msg => {
    let now = new Date();
    bot.sendMessage(msg.chat.id, `현재 시각은 ${now.getHours()}시 ${now.getMinutes()}분 ${now.getSeconds()}초에요!`);
});

bot.onText(/\/date/, msg => {
    let now = new Date();
    bot.sendMessage(msg.chat.id, `오늘은 ${now.getMonth() + 1}월 ${now.getDate()}일 ${DAY[now.getDay()]}이에요!`);
});

bot.onText(/\/echo (.+)/, (msg, match) => {
    bot.sendMessage(msg.chat.id, match[1]);
});

bot.onText(/\/calc ([0-9-+=*\/()]+)/, (msg, match) => {
    bot.sendMessage(msg.chat.id, eval(match[1]));
});