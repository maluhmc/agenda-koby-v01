const express = require('express');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

const DB_AGENDAMENTOS = './agendamentos.json';
const DB_CERTIFICADOS = './certificados.json';

app.use(cors({ origin: '*' }));
app.use(bodyParser.json());

function lerArquivo(caminho) {
  if (!fs.existsSync(caminho)) return [];
  return JSON.parse(fs.readFileSync(caminho));
}

function salvarArquivo(caminho, dados) {
  fs.writeFileSync(caminho, JSON.stringify(dados, null, 2));
}

app.get('/', (req, res) => res.send('API de agendamento e certificados online 🎯'));

app.get('/agendamentos', (req, res) => {
  const agendamentos = lerArquivo(DB_AGENDAMENTOS);
  agendamentos.sort((a, b) => new Date(a.data + 'T' + a.hora) - new Date(b.data + 'T' + b.hora));
  res.json(agendamentos);
});

app.post('/agendar', (req, res) => {
  const novo = req.body;
  const agendamentos = lerArquivo(DB_AGENDAMENTOS);
  const existe = agendamentos.find(a => a.data === novo.data && a.hora === novo.hora && a.analista === novo.analista);
  if (existe) return res.status(400).json({ mensagem: "Já existe um agendamento nesse horário para esse analista." });
  agendamentos.push(novo);
  salvarArquivo(DB_AGENDAMENTOS, agendamentos);
  res.json({ mensagem: "Agendamento realizado com sucesso." });
});

app.delete('/agendamentos', (req, res) => {
  const { data, hora, analista } = req.body;
  let agendamentos = lerArquivo(DB_AGENDAMENTOS);
  agendamentos = agendamentos.filter(a => !(a.data === data && a.hora === hora && a.analista === analista));
  salvarArquivo(DB_AGENDAMENTOS, agendamentos);
  res.json({ mensagem: "Agendamento cancelado com sucesso." });
});

app.get('/horarios', (req, res) => {
  const todosHorarios = [...Array(36)].map((_, i) => {
    const h = 9 + Math.floor(i / 4);
    const m = (i % 4) * 15;
    return { hora: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}` };
  });
  res.json(todosHorarios);
});

// NOVO: certificados

app.post('/certificados', (req, res) => {
  const cert = req.body;
  const certificados = lerArquivo(DB_CERTIFICADOS);
  certificados.push(cert);
  salvarArquivo(DB_CERTIFICADOS, certificados);

  // Remove da agenda
  let agendamentos = lerArquivo(DB_AGENDAMENTOS);
  agendamentos = agendamentos.filter(a => !(a.data === cert.data && a.hora === cert.hora && a.analista === cert.analista));
  salvarArquivo(DB_AGENDAMENTOS, agendamentos);

  res.json({ mensagem: "Certificado emitido e agendamento removido." });
});

app.get('/certificados', (req, res) => {
  const certificados = lerArquivo(DB_CERTIFICADOS);
  certificados.sort((a, b) => new Date(b.dataEmissao.split(" ")[0].split("/").reverse().join("-")) - new Date(a.dataEmissao.split(" ")[0].split("/").reverse().join("-")));
  res.json(certificados);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});