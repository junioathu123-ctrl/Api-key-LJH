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
