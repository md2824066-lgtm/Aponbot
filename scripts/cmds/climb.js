const fs = require("fs");
const path = require("path");
const dataFile = path.join(__dirname,"coinData.json");

function loadData(){ if(!fs.existsSync(dataFile)) return {}; return JSON.parse(fs.readFileSync(dataFile)); }
function saveData(data){ fs.writeFileSync(dataFile,JSON.stringify(data,null,2)); }

module.exports = {
  config:{name:"climb",author:"GPT VIP",category:"game",description:"Rock Climbing Game"},
  onStart: async({api,event})=>{
    let data=loadData();
    if(!data[event.senderID]) data[event.senderID]={coins:0};

    const outcome = Math.random()<0.5?"Success":"Fail";
    if(outcome==="Success") data[event.senderID].coins+=2;  // +2 coin for win
    else data[event.senderID].coins = Math.max(0,data[event.senderID].coins-1);
    saveData(data);

    const msg = outcome==="Success"? 
`╔════════════╗
🌟 𝗬𝗢𝗨 𝗪𝗢𝗡 🌟
╚════════════╝
🧗 Rock Climb Success!
🏆 +2 Coins
💳 Balance: ${data[event.senderID].coins}` :
`╔════════════╗
💥 𝗬𝗢𝗨 𝗟𝗢𝗦𝗧 💥
╚════════════╝
🧗 Rock Climb Failed!
💔 -1 Coin
💳 Balance: ${data[event.senderID].coins}`;

    return api.sendMessage(msg,event.threadID,event.messageID);
  }
};