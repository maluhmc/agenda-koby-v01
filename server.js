
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = './agendamentos.json';

app.use(cors());
app.use(bodyParser.json());

function lerAgendamentos() {
  if (!fs.existsSync(DB_PATH)) return [];
  const data = fs.readFileSync(DB_PATH);
  return JSON.parse(data);
}

function salvarAgendamentos(dados) {
  fs.writeFileSync(DB_PATH, JSON.stringify(dados, null, 2));
}

app.get('/agendamentos', (req, res) => {
  const agendamentos = lerAgendamentos();
  res.json(agendamentos);
});

app.post('/agendar', (req, res) => {
  const novo = req.body;
  const agendamentos = lerAgendamentos();

  const existe = agendamentos.find(a => a.data === novo.data && a.hora === novo.hora && a.analista === novo.analista);
  if (existe) {
    return res.status(400).json({ mensagem: "Já existe um agendamento nesse horário para esse analista." });
  }

  agendamentos.push(novo);
  salvarAgendamentos(agendamentos);
  res.json({ mensagem: "Agendamento realizado com sucesso." });
});

app.delete('/agendamentos', (req, res) => {
  const { data, hora, analista } = req.body;
  let agendamentos = lerAgendamentos();
  agendamentos = agendamentos.filter(a => !(a.data === data && a.hora === hora && a.analista === analista));
  salvarAgendamentos(agendamentos);
  res.json({ mensagem: "Agendamento cancelado com sucesso." });
});

app.get('/horarios', (req, res) => {
  const todosHorarios = [
    "09:00", "09:15", "09:30", "09:45", "10:00", "10:15", "10:30", "10:45",
    "11:00", "11:15", "11:30", "11:45", "12:00", "12:15", "12:30", "12:45",
    "13:00", "13:15", "13:30", "13:45", "14:00", "14:15", "14:30", "14:45",
    "15:00", "15:15", "15:30", "15:45", "16:00", "16:15", "16:30", "16:45",
    "17:00", "17:15", "17:30", "17:45"
  ];
  res.json(todosHorarios.map(h => ({ hora: h })));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
