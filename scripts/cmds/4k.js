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
    author: "Apon", // Main author
    countDown: 10,
    role: 0,
    category: "image",
    description: "Enhance or restore image quality using 4k AI.",
    guide: {
      en: "{pn} [url] or reply with image"
    },
    aliases: [] // conflict-free
  },

  onStart: async function ({ message, event, args }) {
    const startTime = Date.now();
    let imgUrl;

    if (event.messageReply?.attachments?.[0]?.type === "photo") {
      imgUrl = event.messageReply.attachments[0].url;
    } else if (args[0]) {
      imgUrl = args.join(" ");
    }

    if (!imgUrl) return message.reply("Please reply to an image or provide an image URL.");

    const waitMsg = await message.reply("Processing your image... ⏳");

    try {
      const apiUrl = `${await mahmud()}/api/hd?imgUrl=${encodeURIComponent(imgUrl)}`;
      const res = await axios.get(apiUrl, { responseType: "stream" });

      if (waitMsg?.messageID) message.unsend(waitMsg.messageID);

      const processTime = ((Date.now() - startTime) / 1000).toFixed(2);

      return message.reply({
        body: `✅ | Processed in ${processTime}s\nHere is your 4k image, hope you will like it`,
        attachment: res.data
      });
    } catch (error) {
      if (waitMsg?.messageID) message.unsend(waitMsg.messageID);
      return message.reply("❌ Error occurred, contact Apon.");
    }
  }
};

// Apply No-Prefix safely
const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });