const SIMSIM = ['심심하다', '아 심심하네', '심심ㅠ', '뭐하지', '할거추천좀'];

module.exports = {

    ai: () => {
        return SIMSIM[Math.round(Math.random() * 4)];
    },

    reaction: () => {

    }

};