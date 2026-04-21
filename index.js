require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
app.use(express.json());

// ================= MONGODB =================
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("🟢 MongoDB conectado"))
.catch(err => console.log("❌ Erro Mongo:", err));

// ================= MODEL =================
const KeySchema = new mongoose.Schema({
  key: String,
  created: Number,
  hwid: String,
  active: { type: Boolean, default: true }
});

const Key = mongoose.model("Key", KeySchema);

// ================= API =================
app.get("/", (req, res) => {
  res.send("API ONLINE");
});

app.post("/verify", async (req, res) => {
  const { key, hwid } = req.body;

  const k = await Key.findOne({ key });

  if (!k) return res.json({ status: "invalid" });
  if (!k.active) return res.json({ status: "invalid" });

  if (k.hwid && k.hwid !== hwid) {
    return res.json({ status: "hwid_mismatch" });
  }

  if (!k.hwid) {
    k.hwid = hwid;
    await k.save();
  }

  res.json({ status: "ok" });
});

// ================= PAINEL =================
app.get("/panel", async (req, res) => {
  const keys = await Key.find();

  let html = "<h1>PAINEL DE KEYS</h1>";

  keys.forEach(k => {
    html += `<p>🔑 ${k.key} | ✅ ${k.active} | 🖥️ ${k.hwid || "null"}</p>`;
  });

  res.send(html);
});

// ================= DISCORD =================
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

// GERAR KEY
client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  const admins = getAdmins();

  if (msg.content.startsWith("!gerar")) {

    if (!admins.includes(msg.author.id)) {
      return msg.reply("<:pode_no_man:1495446894732640346> Sem permissão");
    }

    const key = gerarKey();

    await Key.create({
      key,
      created: Date.now(),
      hwid: null,
      active: true
    });

    msg.reply(`<a:purple_flame:1495444801536135298> Key: \`${key}\``);
  }

  // RESET KEY
  if (msg.content.startsWith("!reset")) {

    if (!admins.includes(msg.author.id)) {
      return msg.reply("Sem permissão!");
    }

    const args = msg.content.split(" ");
    const key = args[1];

    const k = await Key.findOne({ key });

    if (!k) return msg.reply("Key não encontrada");

    k.active = false;
    k.hwid = null;
    await k.save();

    msg.reply("💀 Key resetada");
  }
});

client.login(process.env.TOKEN);

// ================= SERVER =================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🌐 API rodando na porta " + PORT);
});
