module.exports = {
	config: {
		name: "grouptag",
		aliases: ["grtag"],
		version: "BLUE LOCK ⚽",
		author: "Camille 💙",
		category: "info"
	},

	onStart: async function ({ message, event, args, threadsData, getLang }) {
		const { threadID, mentions } = event;

		const groupTags = await threadsData.get(threadID, "data.groupTags", []);

		// 🌌 INTRO BLUE LOCK
		const intro = `
🔥 MODE BLUE LOCK ACTIVÉ 🔥

💀 "Ici, seul l’égo survit…"

👉 Commandes :
⚽ add
⚽ del
⚽ tag
⚽ list
⚽ info
⚽ rename
`;

		if (!args[0]) return message.reply(intro);

		switch (args[0]) {

			/* ⚽ AJOUT D'ÉQUIPE */
			case "add": {
				const name = args.slice(1).join(" ");
				if (!name) return message.reply("❌ Donne un nom d’équipe Blue Lock ⚽");

				const team = {
					name: name,
					users: mentions
				};

				groupTags.push(team);
				await threadsData.set(threadID, groupTags, "data.groupTags");

				return message.reply(`
⚡ NOUVELLE ÉQUIPE CRÉÉE ⚡

👑 Nom : ${name}
👥 Joueurs :
${Object.values(mentions).join("\n")}

🔥 "Le terrain appartient aux plus forts."
`);
			}

			/* 🧠 LISTE DES ÉQUIPES */
			case "list": {
				if (groupTags.length === 0)
					return message.reply("⚠️ Aucun joueur dans la ligue Blue Lock.");

				let msg = `🏆 LISTE DES ÉQUIPES 🏆\n`;

				groupTags.forEach(g => {
					msg += `\n⚽ ${g.name}\n`;
					msg += Object.values(g.users).map(u => `🧍 ${u}`).join("\n");
				});

				return message.reply(msg);
			}

			/* 📊 INFO D'ÉQUIPE */
			case "info": {
				const name = args.slice(1).join(" ");
				const team = groupTags.find(t => t.name.toLowerCase() === name.toLowerCase());

				if (!team) return message.reply("❌ Équipe introuvable.");

				return message.reply(`
📊 ÉQUIPE : ${team.name}

👥 JOUEURS :
${Object.values(team.users).join("\n")}

💀 "L’égo est la clé de la victoire."
`);
			}

			/* ⚽ TAG */
			case "tag":
			default: {
				const name = args.slice(1).join(" ");
				const team = groupTags.find(t => t.name.toLowerCase() === name.toLowerCase());

				if (!team) return message.reply("❌ Équipe inexistante.");

				const mentionsArr = [];
				Object.keys(team.users).forEach(uid => {
					mentionsArr.push({
						id: uid,
						tag: team.users[uid]
					});
				});

				return message.reply({
					body: `
⚽ MATCH EN COURS ⚽

🔥 ÉQUIPE : ${team.name}

👑 "Montrez votre égo !"

📣 Tous les joueurs sont appelés !
`,
					mentions: mentionsArr
				});
			}
		}
	}
};
