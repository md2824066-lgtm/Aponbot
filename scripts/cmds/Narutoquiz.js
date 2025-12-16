const axios = require("axios");

let fontMap = {};

// Load font map once from remote JSON
async function loadFontMap() {
  if (Object.keys(fontMap).length) return fontMap;
  const fontUrl = "https://raw.githubusercontent.com/Saim12678/Sakura/78615c97c5e5f4a01aa2d7e0f109ee268f388b5b/Naruto/font.json";
  const res = await axios.get(fontUrl);
  fontMap = res.data;
  return fontMap;
}

// Convert normal text to fullwidth using font map
async function toFullWidth(str) {
  const map = await loadFontMap();
  return str.split('').map(c => map[c] || c).join('');
}

module.exports = {
  config: {
    name: "narutoquiz",
    aliases: ["naruto", "naruquiz", "naruqz"],
    version: "1.0",
    author: "Ew'r Saim",
    countDown: 10,
    role: 0,
    category: "game",
    guide: {
      en: "{pn} — Naruto character guessing quiz"
    }
  },

  onStart: async function ({ api, event }) {
    try {
      const jsonUrl = "https://raw.githubusercontent.com/Saim12678/Sakura/78615c97c5e5f4a01aa2d7e0f109ee268f388b5b/Naruto/narutoquiz.json";
      const response = await axios.get(jsonUrl);
      const data = response.data;

      const randomChar = data[Math.floor(Math.random() * data.length)];

      const imageStream = await axios({
        method: "GET",
        url: randomChar.image,
        responseType: "stream"
      });

      const body = await toFullWidth(`🌀 Naruto Quiz 🌀
━━━━━━━━━━━━━━
📸 Guess The Character Name!
🔎 Traits: ${randomChar.traits}
🏷️ Tags: ${randomChar.tags}`);

      api.sendMessage({
        body,
        attachment: imageStream.data
      }, event.threadID, async (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          type: "reply",
          messageID: info.messageID,
          author: event.senderID,
          correctAnswers: randomChar.answer
        });

        setTimeout(() => {
          api.unsendMessage(info.messageID);
        }, 45000); // 45 seconds
      }, event.messageID);

    } catch (err) {
      console.error(err);
      const failMsg = await toFullWidth("❌ Failed to fetch Naruto data.");
      api.sendMessage(failMsg, event.threadID, event.messageID);
    }
  },

  onReply: async function ({ api, event, Reply, usersData }) {
    const { author, correctAnswers, messageID } = Reply;
    const reply = event.body?.toLowerCase().trim();

    if (event.senderID !== author) {
      const msg = await toFullWidth("⚠️ This is not your quiz!");
      return api.sendMessage(msg, event.threadID, event.messageID);
    }

    await api.unsendMessage(messageID);

    if (!reply) {
      const msg = await toFullWidth("❌ Please type your answer.");
      return api.sendMessage(msg, event.threadID, event.messageID);
    }

    const isCorrect = correctAnswers.some(ans => ans.toLowerCase() === reply);

    if (isCorrect) {
      const rewardCoin = 300;
      const rewardExp = 100;
      const userData = await usersData.get(event.senderID);
      userData.money += rewardCoin;
      userData.exp += rewardExp;
      await usersData.set(event.senderID, userData);

      const correctMessage = await toFullWidth(`🎉 Congratulations!

✅ You answered correctly!
💰 You earned ${rewardCoin} Coins
🌟 You gained ${rewardExp} EXP

Keep it up, ninja! 🌀`);

      return api.sendMessage(correctMessage, event.threadID, event.messageID);
    } else {
      const wrongMessage = await toFullWidth(`🥺 Wrong answer!
✅ The correct answer was: ${correctAnswers[0]}`);
      return api.sendMessage(wrongMessage, event.threadID, event.messageID);
    }
  }
};