const axios = require("axios");
const { GoatWrapper } = require("fca-liane-utils");

const mahmud = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json"
  );
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "4k",
    version: "1.9",
    author: "MahMUD",
    countDown: 10,
    role: 0,
    category: "image",
    description: "Enhance or restore image quality using 4k AI.",
    guide: {
      en: "{pn} [url] or reply with image"
    }
  },

  onStart: async function ({ message, event, args }) {

    const startTime = Date.now();
    let imgUrl;

    if (event.messageReply?.attachments?.[0]?.type === "photo") {
      imgUrl = event.messageReply.attachments[0].url;
    } else if (args[0]) {
      imgUrl = args.join(" ");
    }

    if (!imgUrl) return message.reply("🥹 Please reply to an image or provide an image URL.");

    const waitMsg = await message.reply("𝐋𝐨𝐚𝐝𝐢𝐧𝐠 𝟒𝐤 𝐢𝐦𝐚𝐠𝐞... <⏳>");
    if (message.reaction) await message.reaction("⏳", event.messageID);

    try {
      const apiUrl = `${await mahmud()}/api/hd?imgUrl=${encodeURIComponent(imgUrl)}`;
      const res = await axios.get(apiUrl, { responseType: "stream" });

      if (waitMsg?.messageID) message.unsend(waitMsg.messageID);
      if (message.reaction) await message.reaction("✅", event.messageID);

      const processTime = ((Date.now() - startTime) / 1000).toFixed(2);

      return message.reply({
        body: `✅ | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝟒𝐤 𝐢𝐦𝐚𝐠𝐞, processed in ${processTime}s\n📝 Author: MahMUD | Edited by: Apon`,
        attachment: res.data
      });

    } catch (error) {
      if (waitMsg?.messageID) message.unsend(waitMsg.messageID);
      if (message.reaction) await message.reaction("❎", event.messageID);
      return message.reply("🥹 Error occurred, contact MahMUD.");
    }
  }
};

// Enable No-Prefix
const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });