const express = require("express");
const router = express.Router();
const { saveScore, getTopScores } = require("../controllers/rankingController");

// Rota para salvar a pontuação do jogador
router.post("/save-score", saveScore);

// Rota para obter os 5 melhores jogadores
router.get("/top-scores", getTopScores);

module.exports = router;
