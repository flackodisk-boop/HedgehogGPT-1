const { getStreamsFromAttachment, log } = global.utils;

const playersBlueLock = [
  { name: "Yoichi Isagi", shoot: 70, dribble: 65, pass: 60, ego: 80 },
  { name: "Rin Itoshi", shoot: 85, dribble: 80, pass: 70, ego: 95 },
  { name: "Meguru Bachira", shoot: 75, dribble: 90, pass: 65, ego: 85 },
  { name: "Hyoma Chigiri", shoot: 65, dribble: 80, pass: 60, ego: 75 },
  { name: "Seishiro Nagi", shoot: 80, dribble: 70, pass: 65, ego: 90 },
  { name: "Anri Teieri", shoot: 60, dribble: 55, pass: 75, ego: 70 },
  { name: "Ikki Hiyama", shoot: 68, dribble: 60, pass: 70, ego: 78 },
  { name: "Rensuke Kunigami", shoot: 82, dribble: 65, pass: 68, ego: 88 },
  { name: "Gin Gagamaru", shoot: 77, dribble: 72, pass: 60, ego: 82 },
  { name: "Jingo Raichi", shoot: 70, dribble: 65, pass: 62, ego: 80 },
  // Tu peux ajouter +100 personnages ici
];

const matchState = {};

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getActionResult(player) {
  const action = randomBetween(1, 100);
  if (action <= player.shoot) return "goal";
  if (action <= player.shoot + player.dribble) return "dribble";
  if (action <= player.shoot + player.dribble + player.pass) return "pass";
  return "miss";
}

module.exports = {
  config: {
    name: "blue-lock",
    version: "1.0",
    author: "Camille 💙",
    role: 0,
    category: "game",
    shortDescription: "Jouez un match Blue Lock",
    longDescription: "Simule un match de football 1v1 ou 2v2 façon Blue Lock",
    guide: "{pn} start"
  },

  onStart: async function({ message, event, usersData }) {
    const threadID = event.threadID;
    matchState[threadID] = {
      step: "waiting_players",
      players: {},
      score: [0, 0],
      turn: null
    };
    await message.reply("⚽ BLUE LOCK MATCH\nEnvoyez 'join' pour rejoindre le match !");
  },

  onChat: async function({ event, message, usersData }) {
    const threadID = event.threadID;
    const userID = event.senderID;
    const body = event.body.toLowerCase();

    if (!matchState[threadID]) return;
    const state = matchState[threadID];

    // Rejoindre le match
    if (state.step === "waiting_players" && body === "join") {
      if (!state.players.p1) {
        state.players.p1 = userID;
        return message.reply("Joueur 1 inscrit ! Envoyez 'join' pour Joueur 2.");
      } else if (!state.players.p2 && userID !== state.players.p1) {
        state.players.p2 = userID;
        state.step = "choose_characters";
        state.turn = "p1";

        return message.reply("✅ Joueur 2 inscrit ! Les deux joueurs doivent choisir leur personnage :\n" +
          playersBlueLock.map((p, i) => `${i + 1}. ${p.name}`).join("\n") +
          "\nRépondez avec le numéro du personnage pour sélectionner.");
      }
    }

    // Choisir les personnages
    if (state.step === "choose_characters") {
      const index = parseInt(body) - 1;
      if (isNaN(index) || index < 0 || index >= playersBlueLock.length) {
        return message.reply("❌ Numéro invalide, réessayez.");
      }

      if (!state.players.p1Char && userID === state.players.p1) {
        state.players.p1Char = playersBlueLock[index];
        return message.reply(`✅ Joueur 1 choisi : ${playersBlueLock[index].name}`);
      }
      if (!state.players.p2Char && userID === state.players.p2) {
        state.players.p2Char = playersBlueLock[index];
        state.step = "match";
        return message.reply(`✅ Joueur 2 choisi : ${playersBlueLock[index].name}\n\n🏟️ Le match commence ! Envoyez 'play' pour jouer votre tour !`);
      }
    }

    // Jouer le match
    if (state.step === "match" && (userID === state.players.p1 || userID === state.players.p2)) {
      if (body !== "play") return;

      const currentPlayer = state.turn === "p1" ? state.players.p1Char : state.players.p2Char;
      const result = getActionResult(currentPlayer);

      let msg = `⚡ ${currentPlayer.name} tente une action... `;

      if (result === "goal") {
        if (state.turn === "p1") state.score[0]++;
        else state.score[1]++;
        msg += "⚽ BUT !!!";
      } else if (result === "dribble") {
        msg += "💨 Dribble réussi !";
      } else if (result === "pass") {
        msg += "🔄 Passe réussie !";
      } else {
        msg += "❌ Action échouée.";
      }

      msg += `\n📊 Score : Joueur 1 - ${state.score[0]} | Joueur 2 - ${state.score[1]}`;

      // Tour suivant
      state.turn = state.turn === "p1" ? "p2" : "p1";

      return message.reply(msg);
    }
  }
};
