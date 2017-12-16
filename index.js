const TeleBot = require('telebot');
const moment = require('moment-timezone');

const autochat = require('./autochat');

const TOKEN = process.env.TOKEN ? process.env.TOKEN : require('./config/config').token;
const bot = new TeleBot(TOKEN);

bot.on([/\/start/, /\/nyan/], msg => {
    bot.sendSticker(msg.chat.id, 'https://upload.wikimedia.org/wikipedia/commons/9/99/Flying_cat_of_dath.gif');
});

bot.on('text', msg => {
    const reaction = autochat.react(msg.text);
    if (reaction) msg.reply.text(reaction);
});

bot.on(/(날씨|whather) (.+)/i, async (msg, props) => {
    const whather = await autochat.getWhather(props.match[2]);
    msg.reply.text(whather);
});

bot.on(/(한강|퐁당)/, async msg => {
    const tempInfo = await autochat.getHanRiverTemp();
    msg.reply.text(tempInfo);
});

bot.on(/(중고|알아봐|알아봐줘) (.+)/, async (msg, props) => {
    const junggoInfo = await autochat.getJunggo(props.match[2]);
    msg.reply.text(junggoInfo);
});

bot.on(/(오늘|내일|모레)?의?\s?(급식|점심(밥?))/, async (msg, props) => {
    let now = moment(new Date).tz('Asia/Seoul').date();
    if (props.match[1] === '내일') now += 1;
    else if (props.match[1] === '모레') now += 2;
    const cafeteriaInfo = await autochat.getCafeteria('B100000662', now);
    msg.reply.text(cafeteriaInfo);
});

bot.on(/(계산(해(줘?봐?)?)?|풀어(줘?봐?))\s(.+)/, (msg, props) => {
    const result = autochat.calculate(props.match[5]);
    msg.reply.text(result);
});

bot.on(/(.+)(이|가)\s?어디(지|더라)/, async (msg, props) => {
    const location = await autochat.getLocation(props.match[1]);
    if (location) bot.sendLocation(msg.chat.id, location, { replyToMessage: `여기가 ${props.match[1]}야!` });
    else msg.reply.text('어딘지 잘 모르겠어...');
});

/**
 * auto chat (ai)
 */

let autochatThreads = {};

bot.on(/\/ai (on|off)/, (msg, props) => {
    if (props.match[1] === 'on') {
        if (!autochatThreads[msg.chat.id]) autochatThreads[msg.chat.id] = setInterval(() => {
            if (Math.random() > 0.9995) bot.sendMessage(msg.chat.id, autochat.ai());
        }, 1000);
    } else if (props.match[1] === 'off') {
        if (autochatThreads[msg.chat.id]) clearInterval(autochatThreads[msg.chat.id]);
        autochatThreads[msg.chat.id] = undefined;
    }
});

bot.start();
