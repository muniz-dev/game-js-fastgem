const pool = require("../database/connection");

// Salvar o resultado do jogo no banco de dados
const saveScore = async (req, res) => {
    const { playerName, gemsCollected } = req.body;

    if (!playerName || gemsCollected === undefined) {
        return res.status(400).json({ error: "Nome do jogador e gemas coletadas são obrigatórios!" });
    }

    try {
        await pool.query(
            `INSERT INTO infinite_gems.ranking (player_name, gems_collected) VALUES ($1, $2)`,
            [playerName, gemsCollected]
        );
        res.status(201).json({ message: "Pontuação salva com sucesso!" });
    } catch (error) {
        console.error("Erro ao salvar pontuação:", error);
        res.status(500).json({ error: "Erro ao salvar pontuação" });
    }
};

// Obter os 5 melhores jogadores
const getTopScores = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT player_name, gems_collected FROM infinite_gems.ranking ORDER BY gems_collected DESC LIMIT 5`
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Erro ao buscar ranking:", error);
        res.status(500).json({ error: "Erro ao buscar ranking" });
    }
};

module.exports = { saveScore, getTopScores };
