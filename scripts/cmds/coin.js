const fs = require("fs");
const path = require("path");

let getMoney, increaseMoney, decreaseMoney;

// ===== Economy system detect =====
try {
  const currency = require("../../utils/currency");
  getMoney = currency.getMoney;
  increaseMoney = currency.increaseMoney;
  decreaseMoney = currency.decreaseMoney;
} catch (e) {
  // fallback balance.json
  const balanceFile = path.join(__dirname, "balance.json");
  function loadBalance() {
    if (!fs.existsSync(balanceFile)) return {};
    return JSON.parse(fs.readFileSync(balanceFile));
  }
  function saveBalance(data) {
    fs.writeFileSync(balanceFile, JSON.stringify(data, null, 2));
  }
  getMoney = async (uid) => {
    const bal = loadBalance();
    return bal[uid]?.money || 0;
  };
  increaseMoney = async (uid, amt) => {
    const bal = loadBalance();
    if (!bal[uid]) bal[uid] = { money: 0 };
    bal[uid].money += amt;
    saveBalance(bal);
  };
  decreaseMoney = async (uid, amt) => {
    const bal = loadBalance();
    if (!bal[uid]) bal[uid] = { money: 0 };
    bal[uid].money = Math.max(0, bal[uid].money - amt);
    saveBalance(bal);
  };
}

module.exports = {
  config: {
    name: "coin",
    author: "Custom by GPT",
    category: "casino",
    description: "🎲 Coin Toss Game (Head/Tail) + Balance + Leaderboard",
  },

  onStart: async function ({ api, event, args }) {
    try {
      const userID = event.senderID;

      // New player bonus
      let balance = await getMoney(userID);
      if (balance <= 0) {
        await increaseMoney(userID, 1000);
        balance = 1000;
        api.sendMessage("🎁 Welcome Bonus: +1000 coins", event.threadID);
      }

      const cmd = args[0]?.toLowerCase();

      // ✅ /coin balance
      if (cmd === "balance") {
        return api.sendMessage(
          `💳 𝗖𝗼𝗶𝗻 𝗕𝗮𝗹𝗮𝗻𝗰𝗲\n👤 User: ${userID}\n🏦 Coins: ${balance}`,
          event.threadID,
          event.messageID
        );
      }

      // ✅ /coin leaderboard
      if (cmd === "leaderboard") {
        const balFile = path.join(__dirname, "balance.json");
        let balData = {};
        if (fs.existsSync(balFile)) {
          balData = JSON.parse(fs.readFileSync(balFile));
        }
        let leaderboard = Object.entries(balData)
          .sort((a, b) => b[1].money - a[1].money)
          .slice(0, 10);

        if (leaderboard.length === 0) {
          return api.sendMessage("📊 Leaderboard is empty!", event.threadID, event.messageID);
        }

        let msg = "🏆 𝗧𝗼𝗽 𝗖𝗼𝗶𝗻 𝗟𝗲𝗮𝗱𝗲𝗿𝗯𝗼𝗮𝗿𝗱 🏆\n\n";
        leaderboard.forEach(([id, userData], index) => {
          msg += `${index + 1}. 👤 ${id} → ${userData.money} coins\n`;
        });

        return api.sendMessage(msg, event.threadID, event.messageID);
      }

      // ✅ /coin head <bet> OR /coin tail <bet>
      if (!cmd || !["head", "tail"].includes(cmd)) {
        return api.sendMessage(
          "⚠️ Usage:\n/coin head <bet>\n/coin tail <bet>\n/coin balance\n/coin leaderboard",
          event.threadID,
          event.messageID
        );
      }

      const bet = parseInt(args[1]);
      if (!bet || bet <= 0) {
        return api.sendMessage("⚠️ Please enter a valid bet amount!\nExample: /coin head 100", event.threadID, event.messageID);
      }

      balance = await getMoney(userID);
      if (balance < bet) {
        return api.sendMessage("💰 You don’t have enough coins!", event.threadID, event.messageID);
      }

      const outcomes = ["head", "tail"];
      const result = outcomes[Math.floor(Math.random() * outcomes.length)];

      // Images
      const imageMap = {
        head: "https://files.catbox.moe/p4d58u.jpg",
        tail: "https://files.catbox.moe/8p20oz.jpg"
      };

      let message = "";
      let attachment = await global.utils.getStreamFromURL(imageMap[result]);

      if (cmd === result) {
        const reward = bet * 2; // win = bet ×2
        await increaseMoney(userID, reward);
        message =
`╔══════════════════╗
   🌿✨ 𝗬𝗢𝗨 𝗪𝗢𝗡 ✨🌿
╚══════════════════╝

🎯 Your Choice: ${cmd.toUpperCase()}
✅ Toss Result: ${result.toUpperCase()}

🏆 Reward: +${reward} Coins
💳 Balance: ${await getMoney(userID)}
═════════════════════`;
      } else {
        await decreaseMoney(userID, bet); // lose = cut bet
        message =
`╔══════════════════╗
   🔥💔 𝗬𝗢𝗨 𝗟𝗢𝗦𝗧 💔🔥
╚══════════════════╝

🎯 Your Choice: ${cmd.toUpperCase()}
❌ Toss Result: ${result.toUpperCase()}

➖ Lost: -${bet} Coins
💳 Balance: ${await getMoney(userID)}
═════════════════════`;
      }

      return api.sendMessage({ body: message, attachment }, event.threadID, event.messageID);

    } catch (error) {
      api.sendMessage("❌ Error: " + error.message, event.threadID, event.messageID);
    }
  }
};