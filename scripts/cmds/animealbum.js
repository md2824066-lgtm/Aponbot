const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "animealbum",
    aliases: ["anialbum"],
    version: "1.0",
    author: "Saimx69x",
    countDown: 2,
    role: 0,
    description: "Reply with a number to get a video, or reply a video with /album add <category>",
    category: "media"
  },

  onStart: async function ({ message, event, args }) {
    try {
      const apiJsonUrl = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";
      const apiRes = await axios.get(apiJsonUrl);
      const baseUrl = apiRes.data.apiv1;

      if (args[0]?.toLowerCase() === "add") {
        const category = args[1]?.toLowerCase();
        if (!category) return message.reply("❌ Please specify a category. Usage: /anialbum add <category>");

        if (!event.messageReply || !event.messageReply.attachments?.length) {
          return message.reply("❌ Please reply to a video to add it to the anialbum.");
        }

        const attachment = event.messageReply.attachments[0];
        if (!attachment.type.includes("video")) return message.reply("❌ The replied attachment is not a video.");

        const videoUrl = attachment.url;
        const videoPath = path.resolve(__dirname, "temp_video.mp4");

        const videoResp = await axios.get(videoUrl, { responseType: "stream" });
        const writer = fs.createWriteStream(videoPath);
        videoResp.data.pipe(writer);
        await new Promise((resolve, reject) => {
          writer.on("finish", resolve);
          writer.on("error", reject);
        });

        const form = new FormData();
        form.append("reqtype", "fileupload");
        form.append("fileToUpload", fs.createReadStream(videoPath));
        const catboxResp = await axios.post("https://catbox.moe/user/api.php", form, { headers: form.getHeaders() });
        const catboxUrl = catboxResp.data.trim();
        fs.unlinkSync(videoPath);

        if (!catboxUrl.startsWith("https://")) return message.reply("Oops something went wrong. Please try again later.");

        const apiURL = `${baseUrl}/api/albumadd?category=${encodeURIComponent(category)}&url=${encodeURIComponent(catboxUrl)}`;
        const apiResp2 = await axios.get(apiURL);
        const data = apiResp2.data;

        if (!data?.message || !data?.url) return message.reply("Oops something went wrong. Please try again later.");

        return message.reply(`${data.message}\n${data.url}`);
      }

      const url = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/anialbumcategory.json";
      const res = await axios.get(url);
      const displayNames = res.data.display;
      const realCategories = res.data.real;

      const itemsPerPage = 10;
      const page = parseInt(args[0]) || 1;
      const totalPages = Math.ceil(displayNames.length / itemsPerPage);
      if (page < 1 || page > totalPages) return message.reply(`❌ Invalid page! Choose 1-${totalPages}.`);

      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const categoriesToShow = displayNames.slice(startIndex, endIndex);

      let text = "📁 𝐀𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐀𝐥𝐛𝐮𝐦 𝐕𝐢𝐝𝐞𝐨 🎬\n╭──────୨ৎ──────╮\n";
      categoriesToShow.forEach((cat, i) => { text += `╎ ${startIndex + i + 1}. ${cat}\n`; });
      text += "╰──────୨ৎ──────╯\n";
      text += `♻ Page [${page}/${totalPages}]\n`;
      if (page < totalPages) text += `ℹ Type /album ${page + 1} to see next page\n`;
      text += "🎬 Reply a number to get the video.";

      const sent = await message.reply(text);

      global.GoatBot.onReply.set(sent.messageID, {
        commandName: module.exports.config.name,
        author: event.senderID,
        startIndex,
        endIndex,
        displayNames,
        realCategories,
        listMsgID: sent.messageID,
        baseUrl
      });

    } catch (e) {
      return message.reply("Oops something went wrong. Please try again later.");
    }
  },

  onReply: async function ({ message, Reply, event }) {
    if (event.senderID !== Reply.author) return;

    const num = parseInt(event.body.trim());
    const index = num - 1;

    if (isNaN(num) || index < Reply.startIndex || index >= Reply.endIndex) {
      return message.reply("❌ Valid number reply dao.");
    }

    try { message.unsend(Reply.listMsgID); } catch (e) {}

    const category = Reply.realCategories[index];

    try {
      const link = `${Reply.baseUrl}/api/album?category=${category}`;
      const res = await axios.get(link);

      if (!res.data || !res.data.url) return message.reply("Oops something went wrong. Please try again later.");

      await message.reply({
        body: `🎬 𝐇𝐞𝐫𝐞'𝐬 𝐘𝐨𝐮𝐫 𝐕𝐢𝐝𝐞𝐨!\n📂 𝐂𝐚𝐭𝐞𝐠𝐨𝐫𝐲: ${Reply.displayNames[index]}`,
        attachment: await global.utils.getStreamFromURL(res.data.url)
      });

    } catch (e) {
      return message.reply("❌️ | Oops something went wrong. Please try again later.");
    }
  }
};