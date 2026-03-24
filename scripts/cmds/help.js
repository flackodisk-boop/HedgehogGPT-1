const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

function applyFont(text) {
  const map = {
    A: '𝙰', B: '𝙱', C: '𝙲', D: '𝙳', E: '𝙴', F: '𝙵',
    G: '𝙶', H: '𝙷', I: '𝙸', J: '𝙹', K: '𝙺', L: '𝙻',
    M: '𝙼', N: '𝙽', O: '𝙾', P: '𝙿', Q: '𝚀', R: '𝚁',
    S: '𝚂', T: '𝚃', U: '𝚄', V: '𝚅', W: '𝚆', X: '𝚇',
    Y: '𝚈', Z: '𝚉',
    a: '𝚊', b: '𝚋', c: '𝚌', d: '𝚍', e: '𝚎', f: '𝚏',
    g: '𝚐', h: '𝚑', i: '𝚒', j: '𝚓', k: '𝚔', l: '𝚕',
    m: '𝚖', n: '𝚗', o: '𝚘', p: '𝚙', q: '𝚚', r: '𝚛',
    s: '𝚜', t: '𝚝', u: '𝚞', v: '𝚟', w: '𝚠', x: '𝚡',
    y: '𝚢', z: '𝚣'
  };
  return text.split('').map(c => map[c] || c).join('');
}

module.exports = {
  config: {
    name: "help",
    version: "5.0",
    author: "Camille 🩵",
    role: 0,
    category: "blue lock"
  },

  onStart: async ({ message, args, event, role }) => {
    const prefix = await getPrefix(event.threadID);

    const frame = "█";
    const line = `${frame.repeat(16)}`;

    if (!args[0]) {
      let screen = `
${line}
${frame} ⚽📺 𝙱𝙻𝚄𝙴 𝙻𝙾𝙲𝙺 - 𝚅𝙸𝙴𝚆𝙸𝙽𝙶 𝚂𝚈𝚂𝚃𝙴𝙼 ${frame}
${line}

👁️ Transmission en cours…
📡 Chargement des joueurs…

${line}
`;

      const categories = {};

      for (const [name, cmd] of commands) {
        if (cmd.config.role > role) continue;

        const cat = cmd.config.category || "UNKNOWN";
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(name);
      }

      for (const cat of Object.keys(categories).sort()) {
        screen += `
${line}
${frame} ⚡ ${applyFont(cat.toUpperCase())} ⚡ ${frame}
${line}
`;

        categories[cat].sort().forEach(cmd => {
          screen += `📺▶ ${applyFont(cmd)}\n`;
        });

        screen += `${line}\n`;
      }

      screen += `
${line}
📊 COMMANDES : ${commands.size}
⚽ PREFIX : ${prefix}

${line}

👁️ Ego commente :
“Regarde bien…
seuls les systèmes les plus efficaces survivent.”

${line}
`;

      return message.reply(screen);
    }

    // Détail d’une commande
    const name = args[0].toLowerCase();
    const cmd = commands.get(name) || commands.get(aliases.get(name));

    if (!cmd) {
      return message.reply(`
${line}
❌ 📺 SIGNAL INTROUVABLE
${line}

👁️ La transmission a échoué…
${line}
`);
    }

    const cfg = cmd.config;
    const usage = (cfg.guide?.en || "{pn} " + cfg.name).replace("{pn}", prefix);

    const detail = `
${line}
⚽📺 PLAYER FEED
${line}

👁️ NAME : ${applyFont(cfg.name)}
📊 VERSION : ${cfg.version}
👑 ROLE : ${cfg.role}
⏳ COOLDOWN : ${cfg.countDown || 2}s

${line}

🧠 DESCRIPTION :
${cfg.longDescription?.en || "Aucune donnée"}

${line}

📌 USAGE :
${usage}

${line}

👁️ Ego :
“Ce joueur… est encore en train de se révéler.”

${line}
`;

    return message.reply(detail);
  }
};
