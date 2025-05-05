const API_BASE_URL = "http://localhost:3000/api/ranking";
const FREESOUND_API_KEY = "t0LI3GYHgErZSWeDArx74r4ALEX4be7IXYII3bS8";
const FREESOUND_API_URL = "https://freesound.org/apiv2/search/text/";

var difficultySelect = document.getElementById("difficulty");
var currentDifficulty = "normal";

var pickGem = document.querySelector(".gem");
var showCount = document.querySelector("span");
var getBody = document.querySelector("body");
var startButton = document.querySelector(".start-button");
var gameOverText = document.querySelector(".game-over");

// Temporizador circular
var timerContainer = document.querySelector(".timer-container");
var timerCircle = document.querySelector(".timer-circle");
var timerText = document.querySelector(".timer-text");

// Ranking
var rankingList = document.querySelector(".ranking-list");

var gemCount = 0;
var gameRunning = false;
var timeout;
var remainingTime = 3;
var interval;
var totalTime = 3; // Tempo total do jogo
var pageWidth = window.innerWidth;
var pageHeight = window.innerHeight;

window.onresize = function () {
    pageWidth = window.innerWidth;
    pageHeight = window.innerHeight;
}

async function getGemSoundURL(count) {
    const isSpecial = count % 10 === 0;
    const query = isSpecial ? "powerup" : "coin"; // Simplificado para garantir retorno

    try {
        const response = await fetch(
            `https://freesound.org/apiv2/search/text/?query=${query}&fields=previews&filter=duration:[0.2 TO 2]&page_size=30`,
            {
                headers: {
                    "Authorization": `Token ${FREESOUND_API_KEY}`
                }
            }
        );

        const data = await response.json();
        if (data.results.length === 0) return null;

        // Pega um som aleatório entre os resultados
        const randomIndex = Math.floor(Math.random() * data.results.length);
        const soundURL = data.results[randomIndex].previews["preview-hq-mp3"];
        return soundURL;

    } catch (error) {
        console.error("Erro ao buscar som da gema:", error);
        return null;
    }
}



// Atualiza o ranking exibido no jogo
async function updateRankingFromAPI() {
    try {
        const response = await fetch(`${API_BASE_URL}/top-scores`);
        const ranking = await response.json();

        rankingList.innerHTML = "";
        ranking.forEach((player, index) => {
            var listItem = document.createElement("li");
            listItem.textContent = `${index + 1}. ${player.player_name} - ${player.gems_collected} gems`;
            rankingList.appendChild(listItem);
        });
    } catch (error) {
        console.error("Erro ao buscar ranking:", error);
    }
}

// Salva o ranking no banco de dados via API
async function saveRankingToAPI() {
    const playerName = prompt("Digite seu nome para salvar no ranking:");

    if (!playerName) return;

    const data = {
        playerName,
        gemsCollected: gemCount,
        difficulty: currentDifficulty
    };

    try {
        await fetch(`${API_BASE_URL}/save-score`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        console.log("Pontuação salva no banco de dados.");
    } catch (error) {
        console.error("Erro ao salvar pontuação:", error);
    }
}

// Atualiza o ranking ao iniciar o jogo
updateRankingFromAPI();

// Inicia o jogo
function startGame() {
    currentDifficulty = difficultySelect.value;

    pickGem.classList.remove("easy", "normal", "hard");
    pickGem.classList.add(currentDifficulty);


    gemCount = 0;
    remainingTime = totalTime;
    showCount.innerHTML = gemCount;
    gameRunning = true;
    pickGem.style.display = "block";
    gameOverText.style.display = "none";
    startButton.style.display = "none";
    difficultySelect.style.display = "none";
    updateTimer();
    resetTimer();
    interval = setInterval(decreaseTime, 100);
}


// Encerra o jogo
async function endGame() {
    gameRunning = false;
    pickGem.style.display = "none";
    gameOverText.style.display = "block";
    startButton.style.display = "flex";
    difficultySelect.style.display = "block";

    clearInterval(interval);

    await saveRankingToAPI();
    updateRankingFromAPI();
}

// Atualiza o temporizador circular e texto
function updateTimer() {
    let percentage = (remainingTime / totalTime) * 360;
    timerCircle.style.background = `conic-gradient(
        rgba(255, 255, 255, 0.1) ${percentage}deg, 
        transparent ${percentage}deg
    )`;

    timerText.innerHTML = `${Math.ceil(remainingTime)}s`;
}

// Diminui o tempo restante e verifica se o jogo acaba
function decreaseTime() {
    if (remainingTime > 0) {
        remainingTime -= 0.1;
        updateTimer();
    } else {
        endGame();
    }
}

// Reseta o temporizador a cada coleta de gema
function resetTimer() {
    clearTimeout(timeout);
    remainingTime = totalTime;
    updateTimer();
}

// Coleta a gema ao clicar nela
function collectGem() {
    if (!gameRunning) return;

    var left = Math.round(Math.random() * (pageWidth - 120));
    var top = Math.round(Math.random() * (pageHeight - 100));

    pickGem.style.top = top + "px";
    pickGem.style.left = left + "px";

    gemCount++;
    showCount.innerHTML = gemCount;

    if (gemCount % 5 === 0) {
        var red = Math.round(Math.random() * 100);
        var green = Math.round(Math.random() * 100);
        var blue = Math.round(Math.random() * 100);
        getBody.style.backgroundColor = `rgb(${red}, ${green}, ${blue})`;
    }

    playGemSound(gemCount);
    resetTimer();
}

async function playGemSound(count) {
    const url = await getGemSoundURL(count);
    if (!url) return;

    const audio = new Audio(url);
    audio.volume = 0.5;
    audio.play();
}

// Eventos do jogo
pickGem.addEventListener("click", collectGem);
startButton.addEventListener("click", startGame);
