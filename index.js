const TeleBot = require('telebot');
const moment = require('moment-timezone');

const autochat = require('./autochat');

const TOKEN = process.env.TOKEN ? process.env.TOKEN : require('./config/config').token;
const bot = new TeleBot(TOKEN);


bot.on('text', msg => {
    const reaction = autochat.react(msg.text);
    if(reaction) msg.reply.text(reaction);
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

bot.on(/(급식|점심(밥?))/, async msg => {
    const now = moment(new Date).tz('Asia/Seoul').date();
    const cafeteriaInfo = await autochat.getCafeteria('B100000662', now);
    msg.reply.text(cafeteriaInfo);
});

bot.on(/(계산(해(줘?봐?)?)?|풀어(줘?봐?))\s(.+)/, (msg, props) => {
    const result = autochat.calculate(props.match[5]);
    msg.reply.text(result);
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
