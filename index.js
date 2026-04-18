import {
  Client,
  GatewayIntentBits
} from "discord.js";

import fs from "fs-extra";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const getKeys = () => fs.readJsonSync("./keys.json");
const saveKeys = (data) => fs.writeJsonSync("./keys.json", data, { spaces: 2 });

// 🔑 CONVERTER TEMPO
function parseTime(input) {
  const match = input.match(/^(\d+)(s|m|h|d|me)$/);
  if (!match) return null;

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case "s": return value * 1000;
    case "m": return value * 60 * 1000;
    case "h": return value * 60 * 60 * 1000;
    case "d": return value * 24 * 60 * 60 * 1000;
    case "me": return value * 30 * 24 * 60 * 60 * 1000;
    default: return null;
  }
}

// 🔑 COMANDO GERAR
client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  if (msg.content.startsWith("!gerar")) {

    if (msg.author.id !== process.env.ADMIN_ID) {
      return msg.reply("Sem permissão ❌");
    }

    const args = msg.content.split(" ");
    const tempoInput = args[1];

    let expira = null;

    // se tiver tempo → temporária
    if (tempoInput) {
      const tempoMs = parseTime(tempoInput);

      if (!tempoMs) {
        return msg.reply("Formato inválido ❌\nEx: 5s, 5m, 1h, 1d, 1me");
      }

      expira = Date.now() + tempoMs;
    }

    // 🔥 KEY LJH
    const key = "LJH-" + Math.random().toString(36).substring(2, 10).toUpperCase();

    const keys = getKeys();

    keys[key] = {
      user: null,
      used: false,
      expiresAt: expira
    };

    saveKeys(keys);

    msg.reply(
      `🔑 Key:\n${key}\n` +
      (expira ? `⏳ ${tempoInput}` : `♾️ Permanente`)
    );
  }
});

client.once("ready", () => {
  console.log("LJH Key Bot online 🔥");
});

client.login(process.env.TOKEN);
