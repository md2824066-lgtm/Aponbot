const axios = require("axios");

module.exports = {
  config: {
    name: "font",
    aliases: ["fonts", "style"],
    version: "1.0",
    author: "Saimx69x",
    countDown: 5,
    role: 0,
    category: "tools",
    shortDescription: "Convert text to fancy fonts via API",
    longDescription: "Use /font <id> <text> or /font list",
    guide: "{pn} list | {pn} 16 Saim"
  },

  onStart: async function ({ message, event, api, threadPrefix }) {
    try {
      const prefix = threadPrefix || "/font";
      const body = event.body || "";
      const args = body.split(" ").slice(1);

      if (!args.length) {
        return api.sendMessage(
          `❌ Invalid usage!\nUse ${prefix} list to see available fonts\nor ${prefix} [number] [text] to convert`,
          event.threadID,
          event.messageID
        );
      }

      if (args[0].toLowerCase() === "list") {
        const preview = `✨ 𝐀𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐅𝐨𝐧𝐭 𝐒𝐭𝐲𝐥𝐞𝐬 ✨
━━━━━━━━━━━━━━━━━━━━☆
1 ⟶ 𝖠𝗉𝗈𝗇 𝖣𝗂𝖢𝖺𝗉𝗋𝗂𝗈
2 ⟶ 𝘼𝙋𝙊𝙉 𝘿𝙄𝘾𝘼𝙋𝙍𝙄𝙊
3 ⟶ 𝘈𝘱𝘰𝘯•𝘋𝘪𝘊𝘢𝘱𝘳𝘪𝘰
4 ⟶ 𝘼𝙥𝙤𝙣•𝘿𝙞𝘾𝙖𝙥𝙧𝙞𝙤
5 ⟶ 𝗔𝗣𝗢𝗡 𝗗𝗜𝗖𝗔𝗣𝗥𝗜𝗢
6 ⟶ 𝑨𝑷𝑶𝑵 𝑫𝑰𝑪𝑨𝑷𝑹𝑰𝑶
7 ⟶ 𝒜𝓅𝑜𝓃 𝒟𝒾𝒸𝒶𝓅𝓇𝒾𝑜
8 ⟶ 𝕬𝕻𝕺𝕹 𝕯𝕴𝕮𝕬𝕻𝕽𝕴𝕺
9 ⟶ ᴀᴘᴏɴ ᴅɪᴄᴀᴘʀɪᴏ
10 ⟶ 𝘼𝙥𝙤𝙣 𝘿𝙞𝘾𝙖𝙥𝙧𝙞𝙤
11 ⟶ ＡＰＯＮ ＤＩＣＡＰＲＩＯ
12 ⟶ Aρσɳ DỉCαρɾισ
13 ⟶ ᗩᑭᗝᑎ ᗪᓰᑕᗩᑭᖇᓰᑕ
14 ⟶ 𝓐𝓹𝓸𝓷𓂀𝓓𝓲𝓬𝓪𝓹𝓻𝓲𝓸
15 ⟶ αρσɳ ∂ι¢αρяισ
16 ⟶ ᴀᴘᴏɴ・ᴅɪᴄᴀᴘʀɪᴏ
17 ⟶ Aᴘᴏɴ DɪCᴀᴘʀɪᴏ
18 ⟶ A̴p̴o̴n̴ D̴i̴C̴a̴p̴r̴i̴o̴
19 ⟶ A̾p̾o̾n̾ D̾i̾C̾a̾p̾r̾i̾o̾
20 ⟶ A͎p͎o͎n͎ D͎i͎C͎a͎p͎r͎i͎o͎
21 ⟶ ᏗᎵᎧᏁ ᎴᎨᏣᏗᎵᏒᎥᎧ
22 ⟶ ᗩᑭᓍᑎ ᗪᓰᑕᗩᑭᖇᓵᓿ
23 ⟶ 𝔄𝔭𝔬𝔫 𝔇𝔦𝔠𝔞𝔭𝔯𝔦𝔬
24 ⟶ 𝕬𝖕𝖔𝖓 𝕯𝖎𝕮𝖆𝖕𝖗𝖎𝖔
25 ⟶ 𝔸𝕡𝕠𝕟 𝔻𝕚ℂ𝕒𝕡𝕣𝕚𝕠
26 ⟶ 𝒜𝓅𝑜𝓃 ✦ 𝒟𝒾𝒸𝒶𝓅𝓇𝒾𝑜
27 ⟶ Aᴘᴏɴ ✧ DɪCᴀᴘʀɪᴏ
28 ⟶ Aᴘᴏɴ ★ DɪCᴀᴘʀɪᴏ
29 ⟶ Aᴘᴏɴ ✪ DɪCᴀᴘʀɪᴏ
30 ⟶ Aᴘᴏɴ♡DɪCᴀᴘʀɪᴏ
31 ⟶ 𝘈𝘱𝘰𝘯♡𝘋𝘪𝘊𝘢𝘱𝘳𝘪𝘰
32 ⟶ 𝗔𝗽𝗼𝗻✦𝗗𝗶𝗖𝗮𝗽𝗿𝗶𝗼
33 ⟶ Aₚₒₙ DᵢCₐₚᵣᵢₒ
34 ⟶ Aₚₒₙ DᵢCₐₚᵣᵢₒ
35 ⟶ ∆ρσɳ D¡C∆ρr¡σ
36 ⟶ ΛPӨП DIᑕΛPЯIӨ
37 ⟶ ᎪᏢᎧΝ ᎠᎥᏟᎪᎮᏒᎥᎧ
38 ⟶ Aρσɳ ✰ DιCαρɾισ
39 ⟶ Aᵖᵒⁿ Dⁱᶜᵃᵖʳⁱᵒ
40 ⟶ Ａｐｏｎ♡ＤｉＣａｐｒｉｏ
41 ⟶ 𝘼𝙥𝙤𝙣♡𝘿𝙞𝘾𝙖𝙥𝙧𝙞𝙤
42 ⟶ A͠p͠o͠n͠ D͠i͠C͠a͠p͠r͠i͠o͠
43 ⟶ A͢p͢o͢n͢ D͢i͢C͢a͢p͢r͢i͢o͢
44 ⟶ A̼p̼o̼n̼ D̼i̼C̼a̼p̼r̼i̼o̼
45 ⟶ Aρσɳ ⟆ DιCαρɾισ
46 ⟶ Aρσɳ ⚡ DιCαρɾισ
47 ⟶ Aρσɳ ✞ DιCαρɾισ
48 ⟶ Aρσɳ ✺ DιCαρɾισ
49 ⟶ Aρσɳ ✵ DιCαρɾισ
50 ⟶ Aρσɳ❖DιCαρɾισ
51 ⟶ ⒶⓅⓄⓃ ⒹⒾⒸⒶⓅⓇⒾⓄ
52 ⟶ Aᵖᵒⁿ✦Dⁱᶜᵃᵖʳⁱᵒ
53 ⟶ A𝗉𝗈𝗇 D𝗂C𝖺𝗉𝗋𝗂𝗈
54 ⟶ 𝙰𝚙𝚘𝚗•𝙳𝚒𝙲𝚊𝚙𝚛𝚒𝚘
55 ⟶ 𝘼𝗉𝗈𝗇 𝘿𝗶𝗖𝗮𝗽𝗿𝗶𝗼
56 ⟶ Aρσɳ Ϫ DιCαρɾισ
━━━━━━━━━━━━━━━━━━━━━☆`;
        return api.sendMessage(preview, event.threadID, event.messageID);
      }

      const id = args[0];
      const text = args.slice(1).join(" ");
      if (!text) return api.sendMessage(`❌ Invalid usage! Provide text to convert.`, event.threadID, event.messageID);

      const apiUrl = `https://xsaim8x-xxx-api.onrender.com/api/font?id=${id}&text=${encodeURIComponent(text)}`;
      const response = await axios.get(apiUrl);

      if (response.data.output) {
        return api.sendMessage(response.data.output, event.threadID, event.messageID);
      } else {
        return api.sendMessage(`❌ Font ${id} not found!`, event.threadID, event.messageID);
      }

    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ An error occurred! Please try again later.", event.threadID, event.messageID);
    }
  }
};
