module.exports = {
  config: {
    name: "notification",
    aliases: ["notify", "noti"],
    version: "2.4",
    author: "Apon",
    countDown: 5,
    role: 3,
    shortDescription: "Send simple designed notification",
    longDescription: "Send a light designed text notification to all groups",
    category: "owner",
    guide: {
      en: "{pn} <message>"
    }
  },

  onStart: async function ({ api, event, args, threadsData, message }) {
    if (!args[0]) {
      return message.reply("⚠️ | অনুগ্রহ করে notification message লিখুন");
    }

    const text = args.join(" ");

    // 🌸 Light design message
    const notifyMsg =
`╭─❖ 🌸 𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡 🌸 ❖─╮

${text}

╰─❖ ✨ Stay Connected ✨ ❖─╯`;

    const allThreads = (await threadsData.getAll()).filter(
      t =>
        t.isGroup &&
        t.members.find(m => m.userID == api.getCurrentUserID())?.inGroup
    );

    message.reply(`📢 | ${allThreads.length} টি গ্রুপে notification পাঠানো শুরু হচ্ছে...`);

    let success = 0;
    let failed = 0;

    for (const thread of allThreads) {
      try {
        await api.sendMessage(
          { body: notifyMsg },
          thread.threadID
        );
        success++;
        await new Promise(res => setTimeout(res, 300));
      } catch (e) {
        failed++;
      }
    }

    message.reply(
`✅ Done!

✔️ Sent: ${success}
❌ Failed: ${failed}`
    );
  }
};