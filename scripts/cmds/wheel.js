const fs=require("fs"); const path=require("path"); const dataFile=path.join(__dirname,"coinData.json");

function loadData(){ if(!fs.existsSync(dataFile)) return {}; return JSON.parse(fs.readFileSync(dataFile)); }
function saveData(data){ fs.writeFileSync(dataFile,JSON.stringify(data,null,2)); }

module.exports = {
  config:{name:"wheel",author:"GPT VIP",category:"game",description:"Spin the Prize Wheel"},
  onStart: async({api,event,args})=>{
    if(!args[0]) return api.sendMessage("❌ Please select a wheel option: red, blue, green", event.threadID, event.messageID);
    const choice = args[0].toLowerCase();
    if(!["red","blue","green"].includes(choice)) return api.sendMessage("❌ Invalid option! Choose red, blue, or green.", event.threadID, event.messageID);

    let data=loadData();
    if(!data[event.senderID]) data[event.senderID]={coins:0};

    const prizes=["💰 +2 Coins","🎁 Bonus Item","🍀 Lucky","😢 Nothing"];
    const prize=prizes[Math.floor(Math.random()*prizes.length)];

    if(prize.includes("Coins")) data[event.senderID].coins+=2;  // +2 coin
    else if(prize.includes("Nothing")) data[event.senderID].coins=Math.max(0,data[event.senderID].coins-1);
    saveData(data);

    const win=prize.includes("Coins")||prize.includes("Bonus")||prize.includes("Lucky");
    const msg=win? 
`╔════════════╗
🌟 𝗬𝗢𝗨 𝗪𝗢𝗡 🌟
╚════════════╝
🎡 Wheel Spin Result: ${prize}
💳 Balance: ${data[event.senderID].coins}` :
`╔════════════╗
💥 𝗬𝗢𝗨 𝗟𝗢𝗦𝗧 💥
╚════════════╝
🎡 Wheel Spin Result: ${prize}
💳 Balance: ${data[event.senderID].coins}`;

    return api.sendMessage(msg,event.threadID,event.messageID);
  }
};