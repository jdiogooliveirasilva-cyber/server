const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Banco de dados em memória (reseta se o servidor reiniciar)
let jogadores = {};
let placar = [];
let chat = [];

// === 0. ROTA PRINCIPAL (Evita o erro "Cannot GET /") ===
app.get('/', (req, res) => {
  res.send('Servidor do Pocket Code está funcionando perfeitamente! 🚀');
});

// === 1. POSIÇÃO DE JOGADORES (Multiplayer) ===
// Salvar / Atualizar posição
app.get('/mover', (req, res) => {
  const { id, x, y } = req.query;
  if (!id) return res.status(400).send('ID faltando');

  jogadores[id] = {
    x: parseFloat(x) || 0,
    y: parseFloat(y) || 0,
    ultimaAtualizacao: Date.now()
  };

  res.json({ status: 'sucesso' });
});

// Ler posição de todos os jogadores
app.get('/jogadores', (req, res) => {
  // Limpa jogadores inativos há mais de 10 segundos
  const agora = Date.now();
  for (let id in jogadores) {
    if (agora - jogadores[id].ultimaAtualizacao > 10000) {
      delete jogadores[id];
    }
  }
  res.json(jogadores);
});

// === 2. PLACAR DE LÍDERES (Leaderboard) ===
// Salvar Pontuação
app.get('/placar/add', (req, res) => {
  const { nome, pontos } = req.query;
  if (!nome || !pontos) return res.status(400).send('Dados incompletos');

  placar.push({ nome, pontos: parseInt(pontos) });
  // Ordena do maior para o menor e pega os top 10
  placar.sort((a, b) => b.pontos - a.pontos);
  placar = placar.slice(0, 10);

  res.json({ status: 'sucesso', placar });
});

// Ler Placar
app.get('/placar', (req, res) => {
  res.json(placar);
});

// === 3. CHAT ONLINE ===
// Enviar Mensagem
app.get('/chat/enviar', (req, res) => {
  const { autor, msg } = req.query;
  if (!autor || !msg) return res.status(400).send('Dados incompletos');

  chat.push({ autor, msg, hora: new Date().toLocaleTimeString() });
  if (chat.length > 20) chat.shift(); // Mantém só as últimas 20 mensagens

  res.json({ status: 'enviado' });
});

// Ler Mensagens
app.get('/chat', (req, res) => {
  res.json(chat);
});

// Inicialização do Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor Pocket Code rodando na porta ${PORT}`);
});
