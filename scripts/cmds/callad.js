const { getStreamsFromAttachment, log } = global.utils;
const mediaTypes = ["photo", "png", "animated_image", "video", "audio"];

module.exports = {
	config: {
		name: "callad",
		version: "2.0",
		author: "Camille 🩵",
		role: 0,
		description: {
			fr: "📨 Contacte les admins comme un joueur contacte son coach",
			en: "📨 Contact admins like a player contacts the coach"
		},
		category: "blue lock"
	},

	langs: {
		fr: {
			missingMessage: "⚠️ [MESSAGE VIDE]\n\n👁️ Même Ego ne peut pas lire le néant.",
			noAdmin: "💀 [ISOLATION]\n\n👁️ Aucun admin.\nTu es seul sur le terrain…",
			success: "🔥 [TRANSMISSION RÉUSSIE]\n\n👁️ Message envoyé aux %1 coach(s) du système.\n\n⚽ %2",
			failed: "⚠️ [ERREUR DE PASS]\n\n👁️ Échec d’envoi à %1 coach(s).\n\n%2",
			reply: "📍 [RÉPONSE DU COACH]\n\n👁️ %1 répond :\n─────────────────\n%2",
			replyUserSuccess: "✅ Réponse envoyée au joueur.",
			feedback: "📝 [FEEDBACK]\n\n👁️ Joueur %1 (%2)\n\n─────────────────\n%4\n─────────────────"
		}
	},

	onStart: async function ({ args, message, event, usersData, threadsData, api, getLang }) {
		const { config } = global.GoatBot;

		if (!args[0]) return message.reply(getLang("missingMessage"));
		if (!config.adminBot.length) return message.reply(getLang("noAdmin"));

		const { senderID, threadID, isGroup } = event;
		const senderName = await usersData.getName(senderID);

		const msg = `
█▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀█
⚽📨 [TRANSMISSION]
█▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄█

👤 Joueur : ${senderName}
🆔 ID : ${senderID}

${isGroup ? "🏟️ Terrain : Groupe" : "🌐 Terrain : Privé"}

─────────────────
💬 Message :
${args.join(" ")}

─────────────────
👁️ Ego observe…
`;

		const formMessage = {
			body: msg,
			attachment: await getStreamsFromAttachment(
				[...event.attachments, ...(event.messageReply?.attachments || [])]
					.filter(item => mediaTypes.includes(item.type))
			)
		};

		const successIDs = [];
		const failedIDs = [];

		for (const uid of config.adminBot) {
			try {
				const sent = await api.sendMessage(formMessage, uid);
				successIDs.push(uid);

				global.GoatBot.onReply.set(sent.messageID, {
					type: "userCallAdmin",
					threadID,
					messageIDSender: event.messageID
				});

			} catch (err) {
				failedIDs.push(uid);
			}
		}

		let result = "";

		if (successIDs.length)
			result += getLang("success", successIDs.length, "✔️");

		if (failedIDs.length)
			result += "\n" + getLang("failed", failedIDs.length, "❌");

		return message.reply(result);
	},

	onReply: async ({ args, event, api, message, Reply, usersData, getLang }) => {

		const senderName = await usersData.getName(event.senderID);

		switch (Reply.type) {

			case "userCallAdmin": {
				const replyMsg = `
█▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀█
⚽📍 [RÉPONSE COACH]
█▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄█

👁️ ${senderName} :

─────────────────
${args.join(" ")}
`;

				api.sendMessage({
					body: replyMsg,
					attachment: await getStreamsFromAttachment(
						event.attachments.filter(item => mediaTypes.includes(item.type))
					)
				}, Reply.threadID, (err, info) => {
					if (!err) {
						message.reply("⚽ Réponse envoyée.");
						global.GoatBot.onReply.set(info.messageID, {
							type: "adminReply",
							messageIDSender: event.messageID
						});
					}
				});
				break;
			}

			case "adminReply": {
				const replyMsg = `
█▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀█
🔥 [RÉPONSE ADMIN]
█▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄█

👁️ Admin :

─────────────────
${args.join(" ")}
`;

				api.sendMessage({
					body: replyMsg,
					attachment: await getStreamsFromAttachment(
						event.attachments.filter(item => mediaTypes.includes(item.type))
					)
				}, Reply.threadID, (err, info) => {
					if (!err) {
						message.reply("✅ Transfert terminé.");
						global.GoatBot.onReply.set(info.messageID, {
							type: "userCallAdmin",
							messageIDSender: event.messageID
						});
					}
				});
				break;
			}
		}
	}
};
