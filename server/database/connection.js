const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function setSchema() {
    try {
        const client = await pool.connect();
        await client.query(`SET search_path TO ${process.env.SCHEMA}`);
        client.release();
        console.log(`Schema definido para: ${process.env.SCHEMA}`);
    } catch (error) {
        console.error("Erro ao definir o schema:", error);
    }
}

// Definir o schema ao iniciar o servidor
setSchema();

module.exports = pool;
