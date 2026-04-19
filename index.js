require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const getAdmins = () => {
  return process.env.ADMIN_IDS
    ? process.env.ADMIN_IDS.split(",").map(id => id.trim())
    : [];
};

function gerarKey() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let key = "LJH-";
  for (let i = 0; i < 8; i++) {
    key += chars[Math.floor(Math.random() * chars.length)];
  }
  return key;
}

client.once("ready", () => {
  console.log(`✅ Bot online: ${client.user.tag}`);
});

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  if (msg.content.startsWith("!gerar")) {

    const admins = getAdmins();

    // ✅ CORRIGIDO AQUI
    if (!admins.includes(msg.author.id)) {
      return msg.reply("<:pode_no_man:1495446894732640346> Você não tem permissão!");
    }

    const key = gerarKey();

    msg.reply(`<a:purple_flame:1495444801536135298> Key gerada: \`${key}\``);
  }
});

client.login(process.env.TOKEN);
