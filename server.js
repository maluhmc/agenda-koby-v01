const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

const DB_AGENDAMENTOS = './agendamentos.json';
const DB_CERTIFICADOS = './certificados.json';

// Servir arquivos da pasta frontend
app.use(express.static(path.join(__dirname, 'frontend')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.use(cors({ origin: '*' }));
app.use(bodyParser.json());

function lerArquivo(caminho) {
  if (!fs.existsSync(caminho)) return [];
  return JSON.parse(fs.readFileSync(caminho));
}

function salvarArquivo(caminho, dados) {
  fs.writeFileSync(caminho, JSON.stringify(dados, null, 2));
}

app.get('/agendamentos', (req, res) => {
  const dados = lerArquivo(DB_AGENDAMENTOS);
  res.json(dados);
});

app.post('/agendar', (req, res) => {
  const novo = req.body;
  const agendamentos = lerArquivo(DB_AGENDAMENTOS);
  const existe = agendamentos.find(a => a.data === novo.data && a.hora === novo.hora && a.analista === novo.analista);
  if (existe) return res.status(400).json({ mensagem: "Já existe um agendamento nesse horário para esse analista." });
  agendamentos.push(novo);
  salvarArquivo(DB_AGENDAMENTOS, agendamentos);
  res.json({ mensagem: "Agendado com sucesso" });
});

app.delete('/agendamentos', (req, res) => {
  const { data, hora, analista } = req.body;
  let agendamentos = lerArquivo(DB_AGENDAMENTOS);
  agendamentos = agendamentos.filter(a => !(a.data === data && a.hora === hora && a.analista === analista));
  salvarArquivo(DB_AGENDAMENTOS, agendamentos);
  res.json({ mensagem: "Cancelado com sucesso" });
});

// Rota para certificados
app.post('/certificados', (req, res) => {
  const cert = req.body;
  const certificados = lerArquivo(DB_CERTIFICADOS);
  certificados.push(cert);
  salvarArquivo(DB_CERTIFICADOS, certificados);

  let agendamentos = lerArquivo(DB_AGENDAMENTOS);
  agendamentos = agendamentos.filter(a => !(a.data === cert.data && a.hora === cert.hora && a.analista === cert.analista));
  salvarArquivo(DB_AGENDAMENTOS, agendamentos);

  res.json({ mensagem: "Certificado emitido com sucesso" });
});

app.get('/certificados', (req, res) => {
  const certs = lerArquivo(DB_CERTIFICADOS);
  certs.sort((a, b) => new Date(b.dataEmissao.split(" ")[0].split("/").reverse().join("-")) - new Date(a.dataEmissao.split(" ")[0].split("/").reverse().join("-")));
  res.json(certs);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});