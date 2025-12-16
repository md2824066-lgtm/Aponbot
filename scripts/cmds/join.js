const axios = require("axios");
const fs = require("fs-extra");
const request = require("request");

module.exports = {
        config: {
                name: "join",
                version: "3.0",
                author: "Apon",
                countDown: 5,
                role: 0,
                shortDescription: "Join the group that bot is in",
                longDescription: "",
                category: "owner",
                guide: {
                        en: "{p}{n}",
                },
        },

        onStart: async function ({ api, event }) {
                try {
                        // Get last 51 inbox threads (increase if needed)
                        const groupList = await api.getThreadList(51, null, ['INBOX']);

                        // Filter only groups (ignore user inbox)
                        const onlyGroups = groupList.filter(g => g.isGroup);

                        if (onlyGroups.length === 0) {
                                return api.sendMessage('No group chats found.', event.threadID);
                        }

                        // Fetch names properly
                        const finalList = [];
                        for (const group of onlyGroups) {
                                let name = group.threadName;
                                // if name not available, fetch using getThreadInfo
                                if (!name) {
                                        try {
                                                const info = await api.getThreadInfo(group.threadID);
                                                name = info.threadName || "Unnamed Group";
                                        } catch (err) {
                                                name = "Unnamed Group";
                                        }
                                }
                                finalList.push({
                                        threadID: group.threadID,
                                        threadName: name,
                                        memberCount: group.participantIDs.length
                                });
                        }

                        // Format output
                        const formattedList = finalList.map((g, index) =>
                                `│${index + 1}. ${g.threadName}\n│𝐓𝐈𝐃: ${g.threadID}\n│𝐓𝐨𝐭𝐚𝐥 𝐌𝐞𝐦𝐛𝐞𝐫𝐬: ${g.memberCount}\n│`
                        );

                        const message = `╭─╮\n│𝐋𝐢𝐬𝐭 𝐨𝐟 𝐆𝐫𝐨𝐮𝐩 𝐂𝐡𝐚𝐭𝐬:\n${formattedList.join("\n")}\n╰───────────ꔪ\n𝐌𝐚𝐱 𝐌𝐞𝐦𝐛𝐞𝐫𝐬 = 250\n\nReply with the number of the group you want to join...`;

                        const sentMessage = await api.sendMessage(message, event.threadID);
                        global.GoatBot.onReply.set(sentMessage.messageID, {
                                commandName: 'join',
                                messageID: sentMessage.messageID,
                                author: event.senderID,
                                groupData: finalList
                        });
                } catch (error) {
                        console.error("Error listing group chats", error);
                        api.sendMessage("❌ Error while fetching group list.", event.threadID);
                }
        },

        onReply: async function ({ api, event, Reply, args }) {
                const { author, groupData } = Reply;

                if (event.senderID !== author) return;

                const groupIndex = parseInt(args[0], 10);

                if (isNaN(groupIndex) || groupIndex <= 0) {
                        return api.sendMessage('Invalid input.\nPlease provide a valid number.', event.threadID, event.messageID);
                }

                if (groupIndex > groupData.length) {
                        return api.sendMessage('Invalid group number.\nPlease choose a number within the range.', event.threadID, event.messageID);
                }

                try {
                        const selectedGroup = groupData[groupIndex - 1];
                        const groupID = selectedGroup.threadID;

                        const memberList = await api.getThreadInfo(groupID);
                        if (memberList.participantIDs.includes(event.senderID)) {
                                return api.sendMessage(`⚠️ You are already in the group: \n${selectedGroup.threadName}`, event.threadID, event.messageID);
                        }

                        if (memberList.participantIDs.length >= 250) {
                                return api.sendMessage(`⚠️ Can't add, the group is full: \n${selectedGroup.threadName}`, event.threadID, event.messageID);
                        }

                        await api.addUserToGroup(event.senderID, groupID);
                        api.sendMessage(`✅ You have joined: ${selectedGroup.threadName}`, event.threadID, event.messageID);
                } catch (error) {
                        console.error("Error joining group chat", error);
                        api.sendMessage('❌ An error occurred while joining the group.', event.threadID, event.messageID);
                } finally {
                        global.GoatBot.onReply.delete(event.messageID);
                }
        },
};