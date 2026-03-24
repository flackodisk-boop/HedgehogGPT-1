function sleep(time) {
	return new Promise(resolve => setTimeout(resolve, time));
}

module.exports = {
	config: {
		name: "filteruser",
		version: "2.0",
		author: "Camille 🩵",
		countDown: 5,
		role: 1,
		description: {
			fr: "⚡ Filtre les joueurs faibles du terrain (peu de messages ou compte bloqué)",
			en: "⚡ Filter weak players from the group (few messages or blocked account)"
		},
		category: "blue lock",
		guide: {
			fr: "{pn} [<nombre de messages> | die]",
			en: "{pn} [<number of messages> | die]"
		}
	},

	langs: {
		fr: {
			needAdmin: "⚠️ [ERREUR DE SCOUTING]\n\n👁️ Ego exige les droits admin pour agir…",
			confirm: "⚠️ [CHALLENGE ACCEPTÉ]\n\n👁️ Tu veux éliminer tous les joueurs avec moins de %1 messages ?\n💬 Réagis pour confirmer, sinon ils survivent… pour l’instant 😏",
			kickByBlock: "💀 [ELIMINATION AUTOMATIQUE]\n\n👁️ %1 joueur(s) bloqués expulsés du terrain !",
			kickByMsg: "🔥 [TROUSSE DE SURVIE]\n\n👁️ %1 joueur(s) faibles avec moins de %2 messages viennent d’être éliminés !",
			kickError: "⚠️ [BUG DU SYSTÈME]\n\n👁️ Impossible d’éliminer %1 joueur(s) :\n%2",
			noBlock: "✅ [TERRAIN PROPRE]\n\n👁️ Aucun joueur bloqué à éliminer…",
			noMsg: "✅ [TERRAIN PROPRE]\n\n👁️ Aucun joueur avec moins de %1 messages… ces faibles respirent encore 😈"
		},
		en: {
			needAdmin: "⚠️ [SCOUTING ERROR]\n\n👁️ Ego demands admin rights to act…",
			confirm: "⚠️ [CHALLENGE ACCEPTED]\n\n👁️ Do you want to remove all players with less than %1 messages?\n💬 React to confirm, or they survive… for now 😏",
			kickByBlock: "💀 [AUTO-ELIMINATION]\n\n👁️ %1 blocked player(s) removed from the field!",
			kickByMsg: "🔥 [SURVIVAL CHECK]\n\n👁️ %1 weak player(s) with less than %2 messages eliminated!",
			kickError: "⚠️ [SYSTEM ERROR]\n\n👁️ Could not remove %1 player(s):\n%2",
			noBlock: "✅ [CLEAN FIELD]\n\n👁️ No blocked players to remove…",
			noMsg: "✅ [CLEAN FIELD]\n\n👁️ No players with less than %1 messages… these weaklings survive 😈"
		}
	},

	onStart: async function({ api, args, threadsData, message, event, commandName, getLang }) {
		const threadData = await threadsData.get(event.threadID);
		if (!threadData.adminIDs.includes(api.getCurrentUserID()))
			return message.reply(getLang("needAdmin"));

		if (!isNaN(args[0])) {
			message.reply(getLang("confirm", args[0]), (err, info) => {
				global.GoatBot.onReaction.set(info.messageID, {
					author: event.senderID,
					messageID: info.messageID,
					minimum: Number(args[0]),
					commandName
				});
			});
		} else if (args[0] == "die") {
			const threadData = await api.getThreadInfo(event.threadID);
			const membersBlocked = threadData.userInfo.filter(user => user.type !== "User");
			const errors = [];
			const success = [];
			for (const user of membersBlocked) {
				if (user.type !== "User" && !threadData.adminIDs.some(id => id == user.id)) {
					try {
						await api.removeUserFromGroup(user.id, event.threadID);
						success.push(user.id);
					} catch (e) {
						errors.push(user.name);
					}
					await sleep(700);
				}
			}

			let msg = "";
			if (success.length) msg += `${getLang("kickByBlock", success.length)}\n`;
			if (errors.length) msg += `${getLang("kickError", errors.length, errors.join("\n"))}\n`;
			if (!msg) msg += getLang("noBlock");
			message.reply(msg);
		} else message.SyntaxError();
	},

	onReaction: async function({ api, Reaction, event, threadsData, message, getLang }) {
		const { minimum = 1, author } = Reaction;
		if (event.userID != author) return;

		const threadData = await threadsData.get(event.threadID);
		const botID = api.getCurrentUserID();
		const membersCountLess = threadData.members.filter(member =>
			member.count < minimum &&
			member.inGroup &&
			member.userID != botID &&
			!threadData.adminIDs.includes(member.userID)
		);

		const errors = [];
		const success = [];
		for (const member of membersCountLess) {
			try {
				await api.removeUserFromGroup(member.userID, event.threadID);
				success.push(member.userID);
			} catch (e) {
				errors.push(member.name);
			}
			await sleep(700);
		}

		let msg = "";
		if (success.length) msg += `${getLang("kickByMsg", success.length, minimum)}\n`;
		if (errors.length) msg += `${getLang("kickError", errors.length, errors.join("\n"))}\n`;
		if (!msg) msg += getLang("noMsg", minimum);
		message.reply(msg);
	}
};
