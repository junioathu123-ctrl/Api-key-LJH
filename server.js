import express from "express";
import fs from "fs-extra";

const app = express();
app.use(express.json());

const getKeys = () => fs.readJsonSync("./keys.json");
const saveKeys = (data) => fs.writeJsonSync("./keys.json", data, { spaces: 2 });

// 🔑 VALIDAR KEY
app.post("/verify", (req, res) => {
  const { key, user } = req.body;

  const keys = getKeys();

  if (!keys[key]) {
    return res.json({ status: "invalid" });
  }

  const data = keys[key];

  // ⏳ verifica expiração (só se tiver tempo)
  if (data.expiresAt && Date.now() > data.expiresAt) {
    delete keys[key];
    saveKeys(keys);
    return res.json({ status: "expired" });
  }

  // primeira vez
  if (!data.used) {
    data.used = true;
    data.user = user;
    saveKeys(keys);

    return res.json({ status: "success" });
  }

  // mesmo usuário
  if (data.user === user) {
    return res.json({ status: "success" });
  }

  return res.json({ status: "invalid" });
});

app.listen(3000, () => {
  console.log("API rodando 🔥");
});
