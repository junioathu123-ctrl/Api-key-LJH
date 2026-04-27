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
  active: { type: Boolean, default: true },
  expireAt: Number // 🔥 necessário
});

const Key = mongoose.model("Key", KeySchema);

// ================= TIME =================
function parseTime(str) {
  const match = str.match(/(\d+)([smhd])/);
  if (!match) return null;

  const value = parseInt(match[1]);
  const unit = match[2];

  if (unit === "s") return value * 1000;
  if (unit === "m") return value * 60 * 1000;
  if (unit === "h") return value * 60 * 60 * 1000;
  if (unit === "d") return value * 24 * 60 * 60 * 1000;
}

// ================= API =================
app.get("/", (req, res) => {
  res.send("API ONLINE");
});

app.post("/verify", async (req, res) => {
  console.log("🔥 REQUEST:", req.body);

  const { key, hwid } = req.body;

  const k = await Key.findOne({ key });

  if (!k) return res.json({ status: "invalid" });
  if (!k.active) return res.json({ status: "invalid" });

  // expiração
  if (k.expireAt && Date.now() > k.expireAt) {
    k.active = false;
    await k.save();
    return res.json({ status: "invalid" });
  }

  if (k.hwid && k.hwid !== hwid) {
    return res.json({ status: "hwid_mismatch" });
  }

  if (!k.hwid) {
    k.hwid = hwid;
    await k.save();
  }

  res.json({ status: "ok" });
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

// ================= COMANDOS =================
client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  const admins = getAdmins();

  // GERAR KEY
  if (msg.content.startsWith("!gerar")) {

    if (!admins.includes(msg.author.id)) {
      return msg.reply("<:pode_no_man:1495446894732640346> Sem permissão");
    }

    const args = msg.content.split(" ");
    const time = args[1];

    let expireAt = null;

    if (time) {
      const duration = parseTime(time);

      if (!duration) {
        return msg.reply("Use: !gerar ou !gerar 1m / 1h / 1d");
      }

      expireAt = Date.now() + duration;
    }

    const key = gerarKey();

    await Key.create({
      key,
      created: Date.now(),
      hwid: null,
      active: true,
      expireAt: expireAt
    });

    msg.reply(`<a:purple_flame:1495444801536135298> Key: \`${key}\``);
  }

  // RESET (NÃO MEXI)
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
}); NÃO MEXA EM NADA DEIXE COMO ESTÁ SÓ ADICIONE ISSO DE ENTREGAR AÍ QUERO ASSIM:  Obrigado pela preferencia🔥

Script - `loadstring(game:HttpGet("https://pastebin.com/raw/fyjD6v8n"))()`

Key - `(key gerada)`
