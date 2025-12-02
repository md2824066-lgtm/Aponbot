const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

// Command category emoji mapping
const categoryEmojis = {
  fun: "🎉",
  ai: "🤖",
  game: "🎮",
  music: "🎵",
  media: "🎬",
  utility: "🛠️",
  economy: "💰",
  group: "👥",
  owner: "👑",
  info: "📖",
  Uncategorized: "✨"
};

module.exports = {
  config: {
    name: "help",
    version: "3.3",
    author: "APON x ChatGPT",
    countDown: 5,
    role: 0,
    shortDescription: { en: "View command usage with contextual emoji" },
    longDescription: { en: "APON GOAT BOT HELP MENU with VIP style" },
    category: "info",
    guide: { en: "{pn} /help cmdName" },
    priority: 1
  },

  onStart: async function({ message, args, event, threadsData, role }) {
    const { threadID } = event;
    const prefix = getPrefix(threadID);

    if (!args.length) {
      const categories = {};
      let msg = "✨━━━━━━━━━━━━━━✨\n";
      msg += "      💎 LISA HELP MENU 💎\n";
      msg += "✨━━━━━━━━━━━━━━✨\n\n";

      // Organize commands by category
      for (const [name, value] of commands) {
        if (!value?.config || typeof value.onStart !== "function") continue;
        if (value.config.role > 1 && role < value.config.role) continue;

        const category = value.config.category || "Uncategorized";
        categories[category] = categories[category] || { commands: [] };
        categories[category].commands.push(name);
      }

      // Display commands with boxed bold categories
      for (const category of Object.keys(categories).sort()) {
        if (!categories[category].commands.length) continue;
        const emoji = categoryEmojis[category.toLowerCase()] || "⚡";
        msg += `┏━【 ${emoji} ${category.toUpperCase()} ${emoji} 】\n`;

        const sortedCmds = categories[category].commands.sort();
        for (const cmd of sortedCmds) {
          const cmdEmoji = categoryEmojis[(commands.get(cmd)?.config?.category || "Uncategorized").toLowerCase()] || "✨";
          msg += `┃ ${cmdEmoji} ${cmd}\n`;
        }
        msg += "┗━━━━━━━━━━━━━━━━━━━\n\n";
      }

      // Footer
      msg += "━━━━━━━━━━━━━━━\n";
      msg += `⚙ Prefix: ${prefix}\n`;
      msg += `📦 Total Commands: ${commands.size}\n`;
      msg += `👑 Owner: APON DICAPRIO\n`;
      msg += "━━━━━━━━━━━━━━━";

      // Single background image
      const bgImg = "https://files.catbox.moe/zyll9s.mp4";

      await message.reply({
        body: msg,
        attachment: await global.utils.getStreamFromURL(bgImg)
      });

    } else {
      // Detailed command help
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));

      if (!command || !command?.config) {
        await message.reply(`❌ Command "${commandName}" পাওয়া যায়নি!`);
        return;
      }

      const config = command.config;
      const catEmoji = categoryEmojis[(config.category || "Uncategorized").toLowerCase()] || "✨";

      const roleText = roleTextToString(config.role);
      const author = config.author || "Unknown";
      const description = config.longDescription?.en || "No description";
      const usage = (config.guide?.en || "No guide").replace(/{p}/g, prefix).replace(/{n}/g, config.name);

      const response = `
╭───${catEmoji} 𝘾𝙈𝘿 𝙄𝙉𝙁𝙊 ${catEmoji}
│ 📌 Name: ${stylizeCaps(config.name)}
│ 📝 Desc: ${description}
│ 👑 Author: ${author}
│ ⚙ Guide: ${usage}
│ 🔖 Version: ${config.version || "1.0"}
│ 🎭 Role: ${roleText}
╰━━━━━━━━━━━━━━━`;

      await message.reply(response);
    }
  }
};

// Small caps styling
function stylizeCaps(text) {
  const map = {
    a:'ᴀ', b:'ʙ', c:'ᴄ', d:'ᴅ', e:'ᴇ', f:'ꜰ', g:'ɢ', h:'ʜ', i:'ɪ',
    j:'ᴊ', k:'ᴋ', l:'ʟ', m:'ᴍ', n:'ɴ', o:'ᴏ', p:'ᴘ', q:'ǫ', r:'ʀ',
    s:'ꜱ', t:'ᴛ', u:'ᴜ', v:'ᴠ', w:'ᴡ', x:'x', y:'ʏ', z:'ᴢ'
  };
  return text.split('').map(c => map[c] || c).join('');
}

// Role text
function roleTextToString(role) {
  switch (role) {
    case 0: return "0 (All users)";
    case 1: return "1 (Group admins)";
    case 2: return "2 (Bot admins)";
    default: return "Unknown";
  }
}