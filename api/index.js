import express from "express";
import cors from "cors";
import admin from "firebase-admin";

const app = express();
app.use(cors());
app.use(express.json());

const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

app.get("/agendamentos", async (req, res) => {
  const snapshot = await db.collection("agendamentos").get();
  const agendamentos = snapshot.docs.map(doc => doc.data());
  res.json(agendamentos);
});

app.post("/agendar", async (req, res) => {
  const dados = req.body;
  try {
    await db.collection("agendamentos").add(dados);
    res.json({ mensagem: "Agendamento salvo com sucesso!" });
  } catch (e) {
    res.status(500).json({ mensagem: "Erro ao salvar agendamento." });
  }
});

app.delete("/agendamentos", async (req, res) => {
  const { data, hora } = req.body;
  try {
    const snapshot = await db.collection("agendamentos")
      .where("data", "==", data)
      .where("hora", "==", hora)
      .get();
    snapshot.forEach(doc => doc.ref.delete());
    res.json({ mensagem: "Agendamento cancelado." });
  } catch (e) {
    res.status(500).json({ mensagem: "Erro ao cancelar agendamento." });
  }
});

app.get("/horarios", async (req, res) => {
  const horarios = [];
  for (let h = 9; h <= 17; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hora = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      horarios.push({ hora });
    }
  }
  res.json(horarios);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor rodando na porta", PORT));