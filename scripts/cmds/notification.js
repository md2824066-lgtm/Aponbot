const fs = require("fs");
const axios = require("axios");

module.exports = {
  config: {
    name: "notification",
    aliases: ["notify", "noti"],
    version: "2.3",
    author: "Apon",
    countDown: 5,
    role: 3,
    description: {
      vi: "Gửi thông báo từ admin đến all box",
      en: "Send notification from admin to all groups"
    },
    category: "owner",
    guide: {
      en: "{pn} <message>"
    },
    envConfig: {
      delayPerGroup: 250
    }
  },

  langs: {
    vi: {
      missingMessage: "Vui lòng nhập tin nhắn bạn muốn gửi đến tất cả các nhóm",
      sendingNotification: "Bắt đầu gửi thông báo từ admin bot đến %1 nhóm chat",
      sentNotification: "✅ Đã gửi thông báo đến %1 nhóm thành công",
      errorSendingNotification: "Có lỗi xảy ra khi gửi đến %1 nhóm:\n%2"
    },
    en: {
      missingMessage: "Please enter the message you want to send to all groups",
      sendingNotification: "Start sending notification from admin bot to %1 chat groups",
      sentNotification: "✅ Sent notification to %1 groups successfully",
      errorSendingNotification: "An error occurred while sending to %1 groups:\n%2"
    }
  },

  onStart: async function ({ message, api, event, args, commandName, envCommands, threadsData, getLang }) {
    const { delayPerGroup } = envCommands[commandName];

    if (!args[0]) return message.reply(getLang("missingMessage"));

    const senderName = (await api.getUserInfo(event.senderID))[event.senderID].name;

    // Notification text without "video below" line
    const notificationText = [
      "╔═══════════════════════╗",
      "       📢 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍",
      "╚═══════════════════════╝",
      `👤 𝐒𝐞𝐧𝐝𝐞𝐫: ${senderName}`,
      "─────────────────────────────",
      `💬 ${args.join(" ")}`,
      "─────────────────────────────"
    ].join("\n");

    // Download fixed video to temporary file
    const tmpVideoPath = `/tmp/notification_video.mp4`;
    const videoUrl = "https://files.catbox.moe/zmra16.mp4";

    try {
      const response = await axios.get(videoUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(tmpVideoPath, response.data);
    } catch (err) {
      console.error("Failed to download fixed video:", err);
    }

    // Get all groups
    const allThreadID = (await threadsData.getAll()).filter(
      t => t.isGroup && t.members.find(m => m.userID == api.getCurrentUserID())?.inGroup
    );

    message.reply(getLang("sendingNotification", allThreadID.length));

    let sendSuccess = 0;
    const sendError = [];

    for (const thread of allThreadID) {
      try {
        await api.sendMessage(
          { body: notificationText, attachment: fs.createReadStream(tmpVideoPath) },
          thread.threadID
        );
        sendSuccess++;
        await new Promise(resolve => setTimeout(resolve, delayPerGroup));
      } catch (err) {
        sendError.push(thread.threadID);
      }
    }

    // Delete temporary video file
    fs.unlinkSync(tmpVideoPath);

    // Final report
    let report = "";
    if (sendSuccess > 0) report += getLang("sentNotification", sendSuccess) + "\n";
    if (sendError.length > 0)
      report += getLang("errorSendingNotification", sendError.length, sendError.join("\n"));
    message.reply(report);
  }
};