const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const rankingRoutes = require("./routes/route");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos (Jogo)
app.use(express.static(path.join(__dirname, "../source")));

// Rotas da API
app.use("/api/ranking", rankingRoutes);

// Servir o jogo como página inicial
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../source/index.html"));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
