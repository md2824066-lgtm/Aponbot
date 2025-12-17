const fs = require('fs');
const path = require('path');
const DB_FILE = path.join(__dirname, 'usage_db.json');

let db = { users: {}, totalMessages: 0 };

function loadDB() {
  if (fs.existsSync(DB_FILE)) {
    try {
      db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) || { users: {}, totalMessages: 0 };
    } catch {
      db = { users: {}, totalMessages: 0 };
    }
  }
}

function saveDB() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function recordMessage(userId) {
  db.totalMessages++;

  if (!db.users[userId]) {
    db.users[userId] = { messages: 0, firstSeen: Date.now(), lastSeen: Date.now() };
  }

  db.users[userId].messages++;
  db.users[userId].lastSeen = Date.now();

  saveDB();
}

async function getReport(api) {
  const totalUsers = Object.keys(db.users).length;
  const totalMessages = db.totalMessages;

  // Top 5 users
  let usersArray = Object.entries(db.users).map(([uid, u]) => ({
    uid,
    messages: u.messages
  }));

  usersArray.sort((a, b) => b.messages - a.messages);
  const topUsers = usersArray.slice(0, 5);

  // fetch user names
  let nameMap = {};
  try {
    nameMap = await api.getUserInfo(topUsers.map(u => u.uid));
  } catch (e) {}

  let text = "💎━━━━━━━━━━━━━━━━💎\n";
  text += "✨ 『 𝐁𝐎𝐓 𝐔𝐒𝐀𝐆𝐄 𝐒𝐓𝐀𝐓𝐒 』 ✨\n";
  text += "💎━━━━━━━━━━━━━━━━💎\n\n";

  text += `👥 Total Users: ${totalUsers}\n`;
  text += `💬 Total Messages: ${totalMessages}\n\n`;

  text += "🏆 『 𝐓𝐎𝐏 5 𝐔𝐒𝐄𝐑𝐒 』 🏆\n";
  text += "━━━━━━━━━━━━━━━\n";

  topUsers.forEach((u, i) => {
    const crown = i === 0 ? "👑" : (i === 1 ? "🥈" : (i === 2 ? "🥉" : "🔹"));
    const name = nameMap[u.uid]?.name || u.uid;
    text += `${crown} Rank ${i + 1}\n`;
    text += `🙋 Name: ${name}\n`;
    text += `💌 Messages: ${u.messages}\n`;
    text += "━━━━━━━━━━━━━━━\n";
  });

  text += "💎━━━━━━━━━━━━━━━━💎";

  return text;
}

module.exports = {
  config: {
    name: "usage",
    version: "2.0",
    author: "Apon & GPT",
    countDown: 5,
    role: 0,
    shortDescription: "Shows total bot usage stats with top users",
    longDescription: "Tracks total users, total messages, and shows Top 5 active users with VIP format",
    category: "tools",
    guide: "{p}usage"
  },

  onStart: async function({ api, event }) {
    const report = await getReport(api);
    api.sendMessage(report, event.threadID, event.messageID);
  },

  onChat: async function({ event }) {
    recordMessage(event.senderID);
  }
};

loadDB();