const OsangoMessie = require('os');
const moment = require('moment-timezone');

module.exports = {
 config: {
  name: "uptime",
  aliases: ["upt", "up"],
  version: "4.0",
  author: "Camille 🩵",
  role: 0,
  category: "blue lock"
 },

 onStart: async function ({ api, event }) {
  try {
   const uptimeBot = process.uptime();
   const uptimeServer = OsangoMessie.uptime();

   const formatTime = (t) => {
    const d = Math.floor(t / 86400);
    const h = Math.floor((t % 86400) / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = Math.floor(t % 60);
    return `${d}j ${h}h ${m}m ${s}s`;
   };

   const totalMem = OsangoMessie.totalmem() / (1024 ** 3);
   const usedMem = (OsangoMessie.totalmem() - OsangoMessie.freemem()) / (1024 ** 3);
   const cpu = (OsangoMessie.cpus()[0].speed / 1000).toFixed(2);
   const now = moment().tz('Africa/Douala').format('HH:mm:ss');

   // Bloc pour les cadres massifs
   const B = "█";

   const createFrame = (title) => {
    return `${B.repeat(30)}\n█ ${title.padEnd(26)} █\n${B.repeat(30)}`;
   };

   const botFrame = createFrame("👁️ BOT UPTIME") + `\n⏱ ${formatTime(uptimeBot)}\n💥 Progression constante`;
   const serverFrame = createFrame("👁️ SERVEUR UPTIME") + `\n⏱ ${formatTime(uptimeServer)}\n⚡ Stabilité maximale`;
   const resourceFrame = createFrame("📊 RESSOURCES") + `\n🧠 CPU : ${cpu} GHz\n🧱 RAM : ${usedMem.toFixed(2)} / ${totalMem.toFixed(2)} GB`;
   const timeFrame = createFrame("⏱ HEURE") + `\n🕒 ${now}`;

   const progress = (val) => {
    const total = 20;
    const filled = Math.floor(val * total);
    return "█".repeat(filled) + "░".repeat(total - filled);
   };

   const message = `
⚽🔥 [BLUE LOCK SYSTEM REPORT] 🔥⚽
👁️ Ego observe chaque mouvement…

${botFrame}
[${progress(uptimeBot % 86400 / 86400)}]

${serverFrame}
[${progress(uptimeServer % 86400 / 86400)}]

${resourceFrame}

${timeFrame}

━━━━━━━━━━━━━━━━━━━━━━━━━━
💀 Seuls les monstres survivent…
⚡ Domine le terrain, ou disparais.
`;

   api.sendMessage(message, event.threadID);

  } catch (err) {
   console.error(err);
   api.sendMessage(`████████████████████\n⚠️ ERREUR BLUE LOCK\n████████████████████`, event.threadID);
  }
 }
};
