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

mongoose.set("debug", true);

// ================= MODEL =================
const KeySchema = new mongoose.Schema({
  key: String,
  created: Number,
  hwid: String,
  active: { type: Boolean, default: true },
  expireAt: Number
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

// ================= VERIFY =================
app.post("/verify", async (req, res) => {

  try {

    const { key, hwid } = req.body;

    console.log("\n========== VERIFY ==========");
    console.log("KEY:", key);
    console.log("HWID:", hwid);

    const k = await Key.findOne({ key });

    console.log("RESULTADO:", k);

    // KEY NÃO EXISTE
    if (!k) {

      console.log("❌ KEY NÃO EXISTE");

      return res.json({
        success: false
      });
    }

    // KEY INATIVA
    if (!k.active) {

      console.log("❌ KEY INATIVA");

      return res.json({
        success: false
      });
    }

    // KEY EXPIRADA
    if (k.expireAt && Date.now() > k.expireAt) {

      console.log("❌ KEY EXPIRADA");

      k.active = false;

      await k.save();

      return res.json({
        success: false
      });
    }

    // HWID DIFERENTE
    if (k.hwid && k.hwid !== hwid) {

      console.log("❌ HWID DIFERENTE");

      return res.json({
        success: false
      });
    }

    // VINCULAR HWID
    if (!k.hwid) {

      console.log("🔗 VINCULANDO HWID");

      k.hwid = hwid;

      await k.save();
    }

    console.log("✅ KEY VÁLIDA");

    return res.json({
      success: true
    });

  } catch (err) {

    console.log("❌ ERRO VERIFY:", err);

    return res.json({
      success: false
    });
  }
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

  if (!process.env.ADMIN_IDS) return [];

  return process.env.ADMIN_IDS
    .split(",")
    .map(id => id.trim());
};

// ================= GERAR KEY =================
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

  // ================= GERAR =================
  if (msg.content.startsWith("!gerar")) {

    if (!admins.includes(msg.author.id)) {
      return msg.reply("❌ Sem permissão");
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
      expireAt
    });

    msg.reply(`🔑 Key: \`${key}\``);
  }

  // ================= RESET =================
  if (msg.content.startsWith("!reset")) {

    if (!admins.includes(msg.author.id)) {
      return msg.reply("❌ Sem permissão");
    }

    const args = msg.content.split(" ");

    const key = args[1];

    const k = await Key.findOne({ key });

    if (!k) {
      return msg.reply("❌ Key não encontrada");
    }

    k.active = false;
    k.hwid = null;

    await k.save();

    msg.reply("💀 Key resetada");
  }
});

// ================= SERVER =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log("🌐 API rodando na porta " + PORT);
});

// ================= LOGIN =================
client.login(process.env.TOKEN);
