const axios = require("axios");
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "avatar",
    version: "3.0",
    author: "Camille 💙",
    cooldowns: 5,
    role: 0,
    description: "Créer un avatar anime animé (GIF)",
    category: "image",
    guide: "{p}avatar <nom/id> | <texte> | <signature> | <couleur>"
  },

  onStart: async function ({ args, message }) {
    if (!args[0]) return message.SyntaxError();

    const parts = args.join(" ").split("|").map(t => t.trim());
    const [input, bgText, signature, colorBg] = parts;

    message.reply("⚡ Création d’un avatar animé… prépare ton ego 🔥");

    try {
      // 🔥 API AVATAR ANIME (GIF si dispo)
      const endpoint = "https://goatbotserver.onrender.com/taoanhdep/avataranime";

      const params = {
        id: isNaN(input) ? 0 : parseInt(input),
        chu_Nen: bgText || "",
        chu_Ky: signature || "",
        apikey: "ntkhangGoatBot"
      };

      if (colorBg) params.colorBg = colorBg;

      // ⚡ STREAM IMAGE (peut être GIF selon API)
      const stream = await getStreamFromURL(endpoint, "avatar.gif", {
        params
      });

      return message.reply({
        body:
          `🎬 AVATAR ANIMÉ CRÉÉ\n` +
          `━━━━━━━━━━━━━━\n` +
          `⚡ État : ACTIVÉ\n` +
          `🔥 Style : Anime dynamique\n` +
          `🎨 Fond : ${bgText || "aucun"}\n` +
          `✍️ Signature : ${signature || "aucune"}\n` +
          `🌈 Couleur : ${colorBg || "défaut"}\n` +
          `━━━━━━━━━━━━━━\n` +
          `🧠 "Ton ego… s’est éveillé."`,
        attachment: stream
      });

    } catch (err) {
      console.log(err);
      return message.reply("❌ Impossible de générer l’avatar animé.");
    }
  }
};
