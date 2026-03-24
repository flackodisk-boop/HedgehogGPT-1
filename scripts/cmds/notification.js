const { getStreamsFromAttachment } = global.utils;

module.exports = {
	config: {
		name: "notification",
		aliases: ["notify", "noti"],
		version: "ANIME X ⚽",
		author: "Camille 💙",
		role: 2,
		category: "owner"
	},

	onStart: async function ({ message, api, event, args, commandName, envCommands, threadsData, getLang }) {
		const { delayPerGroup } = envCommands[commandName];

		if (!args[0])
			return message.reply("❌ Écris le message à transmettre.");

		// 🎬 INTRO ANIME
		const intro = `
━━━━━━━━━━━━━━━━━━━━
⚽ TRANSMISSION GLOBALE ⚽
━━━━━━━━━━━━━━━━━━━━

📺 [ÉCRAN ACTIVÉ...]

💀 Une voix résonne dans toutes les arènes...

🔥 "LES FAIBLES NE SONT PAS AUTORISÉS À REGARDER CE MATCH..."

━━━━━━━━━━━━━━━━━━━━
📢 ANNONCE :
${args.join(" ")}
━━━━━━━━━━━━━━━━━━━━

⚡ "ACTIVE TON EGO… OU DISPARAIS."
`;

		const formSend = {
			body: intro,
			attachment: await getStreamsFromAttachment(
				[
					...event.attachments,
					...(event.messageReply?.attachments || [])
				].filter(item =>
					["photo", "png", "animated_image", "video", "audio"].includes(item.type)
				)
			)
		};

		const allThreadID = (await threadsData.getAll()).filter(
			t => t.isGroup && t.members.find(m => m.userID == api.getCurrentUserID())?.inGroup
		);

		await message.reply("📡 Diffusion en cours... Toutes les équipes reçoivent l’ordre...");

		let success = 0;
		let errors = [];

		for (const thread of allThreadID) {
			try {
				await api.sendMessage(formSend, thread.threadID);
				success++;

				// 🎭 effet anime (pause dramatique)
				await new Promise(r => setTimeout(r, delayPerGroup + 300));

			} catch (e) {
				errors.push(thread.threadID);
			}
		}

		// 🏁 RESULTAT FINAL STYLE ANIME
		let result = `
━━━━━━━━━━━━━━━━━━━━
📺 FIN DE TRANSMISSION
━━━━━━━━━━━━━━━━━━━━

🏆 ÉQUIPES ATTEINTES : ${success}

💀 "Dans ce monde… seuls les plus affamés survivent."

`;

		if (errors.length)
			result += `\n⚠️ ÉCHECS : ${errors.length}\n💀 Certaines équipes ont résisté au signal...`;

		result += `\n━━━━━━━━━━━━━━━━━━━━`;

		return message.reply(result);
	}
};
