const axios = require("axios");
const { GoatWrapper } = require("fca-liane-utils"); // বা GoatWrapper যেটা তোমার bot এ আছে

// Base API URL fetch
const baseApiUrl = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json"
  );
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "pp",
    aliases: ["pfp", "dp", "profile"],
    version: "1.8",
    author: "MahMUD",
    role: 0,
    category: "media",
    shortDescription: "Get profile picture",
    longDescription: "View the profile picture of yourself, reply user, mention, or UID",
  },

  onStart: async function ({ message, event, args }) {
    try {
      // Target ID: mention > reply > args > self
      const target =
        Object.keys(event.mentions || {})[0] ||
        event.messageReply?.senderID ||
        (args[0] && args[0]) ||
        event.senderID;

      // Build API URL
      const apiUrl = `${await baseApiUrl()}/api/pfp?mahmud=${encodeURIComponent(target)}`;

      // Fetch image as stream
      const res = await axios.get(apiUrl, { responseType: "stream" });

      // Send profile picture
      return message.reply({
        body: "🎀 Here's the profile picture",
        attachment: res.data
      });

    } catch (e) {
      console.log(e?.response?.status, e?.message);
      return message.reply("🥹 Error fetching profile picture. Contact MahMUD.");
    }
  }
};

// ✅ Enable No-Prefix
const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true }); // এখন pp/pfp/profile prefix ছাড়া কাজ করবে