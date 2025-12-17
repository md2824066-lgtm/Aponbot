const fs = require("fs");
const path = require("path");
const dataFile = path.join(__dirname, "coinData.json");

function loadData() { 
    if (!fs.existsSync(dataFile)) return {}; 
    return JSON.parse(fs.readFileSync(dataFile)); 
}

function saveData(data) { 
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2)); 
}

module.exports = {
  config: { name: "dice", author: "GPT VIP", category: "game", description: "Dice Roll with number selection" },

  onStart: async ({ api, event, args }) => {
    const num = parseInt(args[0]);
    if (!num || num < 1 || num > 6) 
      return api.sendMessage("❌ Please select a number between 1 and 6. Example: /dice 4", event.threadID, event.messageID);

    let data = loadData();
    if (!data[event.senderID]) data[event.senderID] = { coins: 0 };

    const roll = Math.floor(Math.random() * 6) + 1;
    const win = num === roll;

    if (win) data[event.senderID].coins += 2;
    else data[event.senderID].coins = Math.max(0, data[event.senderID].coins - 1);

    saveData(data);

    const msg = win
      ? `╔════════════╗
🌟 𝗬𝗢𝗨 𝗪𝗢𝗡 🌟
╚════════════╝
🎲 Your Number: ${num}
🎲 Dice Roll: ${roll}
🏆 +2 Coins
💳 Balance: ${data[event.senderID].coins} coins`
      : `╔════════════╗
💥 𝗬𝗢𝗨 𝗟𝗢𝗦𝗧 💥
╚════════════╝
🎲 Your Number: ${num}
🎲 Dice Roll: ${roll}
💔 -1 Coin
💳 Balance: ${data[event.senderID].coins} coins`;

    return api.sendMessage(msg, event.threadID, event.messageID);
  }
};