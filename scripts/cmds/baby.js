const axios = require("axios");

const xalman = [
  "baby",
  "bby",
  "jan",
  "bot",
  "sara",
  "Janu"
];

const baseApiUrl = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/goatbotnx/nx-goat-bot/refs/heads/main/API.json"
  );
  return base.data.jan;
};

module.exports = {
  config: {
    name: "bot",
    version: "1.8",
    author: "modified by xalman",
    role: 0,
    category: "ai",
    guide: { en: "just type jan" },
  },

  onStart: async function () {},

  onReply: async function ({ api, event }) {
    if (event.type === "message_reply") {
      const message = event.body?.toLowerCase() || "lol";

      async function getBotResponse(message) {
        try {
          const base = await baseApiUrl();
          const response = await axios.get(
            `${base}/jan/font2/${encodeURIComponent(message)}`
          );
          return response.data?.message;
        } catch {
          return "error janu🥹";
        }
      }

      const replyMessage = await getBotResponse(message);
      api.sendMessage(replyMessage, event.threadID, (err, info) => {
        if (!err) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: "bot",
            type: "reply",
            messageID: info.messageID,
            author: event.senderID,
            text: replyMessage,
          });
        }
      }, event.messageID);
    }
  },

  onChat: async function ({ api, event }) {
    const responses = [
      "kmn acho bby🥺",
      "assalamualaikum bbz🫠",
      "eto din por mone porlo amake🥺",
      "hea bolo 🥳",
      "kire dakoch kn 😐",
      "kache asho 🙂",
      "umm… ki hoyeche?",
      "hmm bolo?",
      "__kmn acho jan🙂",
      "ami sure Tor keo nai tai amare dakli😌"
    ];

    const message = event.body?.toLowerCase() || "";
    const words = message.split(" ");
    const wordCount = words.length;

    if (event.type !== "message_reply" && xalman.some(word => message.startsWith(word))) {

      api.setMessageReaction("🪶", event.messageID, () => {}, true);
      api.sendTypingIndicator(event.threadID, true);

      async function getBotResponse(text) {
        try {
          const base = await baseApiUrl();
          const response = await axios.get(
            `${base}/jan/font2/${encodeURIComponent(text)}`
          );
          return response.data?.message;
        } catch {
          return "error janu🥹";
        }
      }

      if (wordCount === 1) {
        const randomMsg = responses[Math.floor(Math.random() * responses.length)];
        api.sendMessage(randomMsg, event.threadID, (err, info) => {
          if (!err) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: "bot",
              type: "reply",
              messageID: info.messageID,
              author: event.senderID,
              text: randomMsg,
            });
          }
        }, event.messageID);
      } else {
        const userText = words.slice(1).join(" ");
        const botResponse = await getBotResponse(userText);

        api.sendMessage(botResponse, event.threadID, (err, info) => {
          if (!err) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: "bot",
              type: "reply",
              messageID: info.messageID,
              author: event.senderID,
              text: botResponse,
            });
          }
        }, event.messageID);
      }
    }
  },
};