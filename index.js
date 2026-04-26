// ENTREGAR KEY + SCRIPT
if (msg.content.startsWith("!entregar")) {

  if (!admins.includes(msg.author.id)) {
    return msg.reply("<:pode_no_man:1495446894732640346> Sem permissão");
  }

  const args = msg.content.split(" ");
  const time = args[1];

  let expireAt = null;

  if (time) {
    const duration = parseTime(time);

    if (!duration) {
      return msg.reply("Use: !entregar ou !entregar 1m / 1h / 1d");
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

  msg.reply(`Obrigado pela preferencia 🔥

Script - \`loadstring(game:HttpGet("https://pastebin.com/raw/fyjD6v8n"))()\`

Key - \`${key}\``);
}
