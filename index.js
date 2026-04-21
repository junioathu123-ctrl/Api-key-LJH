require("dotenv").config();

const express = require("express");
const fs = require("fs");
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
app.use(express.json());

const KEYS_FILE = "./keys.json";

// ================= FUNÇÕES =================

function loadKeys() {
  if (!fs.existsSync(KEYS_FILE)) return {};
  return JSON.parse(fs.readFileSync(KEYS_FILE));
}

function saveKeys(data) {
  fs.writeFileSync(KEYS_FILE, JSON.stringify(data, null, 2));
}

function gerarKey() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let key = "LJH-";
  for (let i = 0; i < 8; i++) {
    key += chars[Math.floor(Math.random() * chars.length)];
  }
  return key;
}

// ================= API =================

// teste
app.get("/", (req, res) => {
  res.send("API ONLINE");
});

// verificar key + hwid
app.post("/verify", (req, res) => {
  const { key, hwid } = req.body;

  const keys = loadKeys();
  const data = keys[key];

  if (!data) return res.json({ status: "invalid" });

  if (data.expires && Date.now() > data.expires) {
    return res.json({ status: "expired" });
  }

  // PRIMEIRO USO → salva hwid
  if (!data.hwid) {
    data.hwid = hwid;
    saveKeys(keys);
    return res.json({ status: "ok", first: true });
  }

  // HWID DIFERENTE → bloqueia
  if (data.hwid !== hwid) {
    return res.json({ status: "hwid_mismatch" });
  }

  res.json({ status: "ok" });
});

// porta Railway
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🌐 API rodando na porta " + PORT);
});

// ================= BOT =================

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

client.once("clientReady", () => {
  console.log(`✅ Bot online: ${client.user.tag}`);
});

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  if (msg.content.startsWith("!gerar")) {

    const admins = getAdmins();

    if (!admins.includes(msg.author.id)) {
      return msg.reply("<:pode_no_man:1495446894732640346> Sem permissão!");
    }

    const key = gerarKey();
    const keys = loadKeys();

    keys[key] = {
      created: Date.now(),
      expires: null, // pode colocar tempo depois
      hwid: null
    };

    saveKeys(keys);

    msg.reply(`<a:9504_purple_flame:1458553679547203786> Key gerada: \`${key}\``);
  }
});

client.login(process.env.TOKEN);
