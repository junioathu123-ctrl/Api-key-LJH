require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ================= ADMINS =================
const getAdmins = () => {
  if (!process.env.ADMIN_IDS) return [];
  return process.env.ADMIN_IDS.split(",").map(id => id.trim());
};

// ================= GERAR KEY =================
function gerarKey() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let key = "LJH-";
  for (let i = 0; i < 8; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

// ================= BOT ONLINE =================
client.once("ready", () => {
  console.log(`✅ Logado como ${client.user.tag}`);
});

// ================= COMANDO =================
client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  if (msg.content.startsWith("!gerar")) {

    const admins = getAdmins();

    console.log("ENV:", process.env.ADMIN_IDS);
    console.log("ADMINS:", admins);
    console.log("SEU ID:", msg.author.id);

    if (!admins.includes(String(msg.author.id))) {
      return msg.reply(`Sem permissão ❌\nSeu ID: ${msg.author.id}`);
    }

    const key = gerarKey();

    msg.reply(`🔑 Key gerada:\n\`${key}\``);
  }
});

// ================= LOGIN =================
client.login(process.env.TOKEN);
