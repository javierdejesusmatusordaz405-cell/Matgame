(() => {
  const GAME_DURATION = 60;
  const BEST_SCORE_KEY = "calculoYermistaBestScore";
  const TOTAL_SCORE_KEY = "calculoYermistaTotalScore";
  const LOADING_DURATION = 600; // ms

  const views = {
    register: document.getElementById("registerView"),
    changeName: document.getElementById("changeNameView"),
    competitionSetup: document.getElementById("competitionSetupView"),
    lobby: document.getElementById("lobbyView"),
    game: document.getElementById("gameView"),
    result: document.getElementById("resultView"),
    confirm: document.getElementById("confirmView"),
    countdown: document.getElementById("countdownView"),
    record: document.getElementById("recordView"),
    challengeView: document.getElementById("challengeView"),
    challengePending: document.getElementById("challengePendingView")
  };

  const lobbyBestScore = document.getElementById("lobbyBestScore");
  const lobbyTotalScore = document.getElementById("lobbyTotalScore");
  const modeName = document.getElementById("modeName");
  const liveScore = document.getElementById("liveScore");
  const operationText = document.getElementById("operationText");
  const standardOperation = document.getElementById("standardOperation");
  const complementOperation = document.getElementById("complementOperation");
  const answerInput = document.getElementById("answerInput");
  const complementPrefix = document.getElementById("complementPrefix");
  const complementSuffix = document.getElementById("complementSuffix");
  const complementInput = document.getElementById("complementInput");
  const timerFill = document.getElementById("timerFill");
  const timeLeftText = document.getElementById("timeLeftText");
  const finalScore = document.getElementById("finalScore");
  const bestScore = document.getElementById("bestScore");
  const totalScore = document.getElementById("totalScore");
  const backToLobbyButton = document.getElementById("backToLobbyButton");
  const modeButtons = document.querySelectorAll(".mode-button");
  const confirmModeName = document.getElementById("confirmModeName");
  const confirmStartButton = document.getElementById("confirmStartButton");
  const confirmBackButton = document.getElementById("confirmBackButton");
  const countdownNumber = document.getElementById("countdownNumber");
  const countdownModeTitle = document.getElementById("countdownModeTitle");
  const explanationTitle = document.getElementById("explanationTitle");
  const explanationText = document.getElementById("explanationText");
  const exampleText = document.getElementById("exampleText");
  const exampleAnswer = document.getElementById("exampleAnswer");
  const recordButton = document.getElementById("recordButton");
  const recordBackButton = document.getElementById("recordBackButton");
  const settingsButton = document.getElementById("settingsButton");
  const competitionButton = document.getElementById("competitionButton");
  const userCatalog = document.getElementById("userCatalog");
  const statsContainer = document.getElementById("statsContainer");
  const confirmInstructions = document.getElementById("confirmInstructions");
  const resultInstructions = document.getElementById("resultInstructions");
  const newPlayerNameInput = document.getElementById("newPlayerNameInput");
  const saveNameButton = document.getElementById("saveNameButton");
  const cancelNameButton = document.getElementById("cancelNameButton");
  const competitionTargetText = document.getElementById("competitionTargetText");
  const moduleOptions = document.getElementById("moduleOptions");
  const competitionTimeInput = document.getElementById("competitionTimeInput");
  const startCompetitionButton = document.getElementById("startCompetitionButton");
  const cancelCompetitionButton = document.getElementById("cancelCompetitionButton");
  const challengeInfoText = document.getElementById("challengeInfoText");
  const challengePendingText = document.getElementById("challengePendingText");
  const acceptChallengeButton = document.getElementById("acceptChallengeButton");
  const declineChallengeButton = document.getElementById("declineChallengeButton");
  const pendingBackToLobbyButton = document.getElementById("pendingBackToLobbyButton");

  const state = {
    mode: null,
    score: 0,
    timeLeft: GAME_DURATION,
    totalTime: GAME_DURATION,
    running: false,
    currentAnswer: null,
    lastTimestamp: 0,
    animationFrame: 0,
    countdownValue: 5,
    socket: null,
    onlineUsers: [],
    competitionOpponentId: null,
    competitionOpponentName: null,
    pendingChallenge: null,
    pendingIncomingChallenge: null,
    challengeMode: false,
    challengeModules: [],
    challengeModuleIndex: 0
  };

  const modeConfig = {
    sum: {
      label: "Sumas 1-10",
      display: "standard",
      explanation: "Suma dos números del 1 al 10. Escribe la respuesta correcta.",
      example: "4 + 5 = 9",
      nextProblem() {
        const a = randomInt(1, 10);
        const b = randomInt(1, 10);
        return { text: `${a} + ${b}`, answer: a + b };
      }
    },
    sum1digit: {
      label: "Sumas 1 dígito",
      display: "standard",
      explanation: "Suma dos números de un dígito.",
      example: "3 + 7 = 10",
      nextProblem() {
        const a = randomInt(1, 9);
        const b = randomInt(1, 9);
        return { text: `${a} + ${b}`, answer: a + b };
      }
    },
    sum2digits: {
      label: "Sumas 2 dígitos",
      display: "standard",
      explanation: "Suma dos números de dos dígitos.",
      example: "24 + 37 = 61",
      nextProblem() {
        const a = randomInt(10, 99);
        const b = randomInt(10, 99);
        return { text: `${a} + ${b}`, answer: a + b };
      }
    },
    sum3digits: {
      label: "Sumas 3 dígitos",
      display: "standard",
      explanation: "Suma dos números de tres dígitos.",
      example: "135 + 248 = 383",
      nextProblem() {
        const a = randomInt(100, 999);
        const b = randomInt(100, 999);
        return { text: `${a} + ${b}`, answer: a + b };
      }
    },
    sub: {
      label: "Restas 1-10",
      display: "standard",
      explanation: "Resta dos números del 1 al 10. El segundo siempre es menor o igual que el primero.",
      example: "8 - 3 = 5",
      nextProblem() {
        const a = randomInt(1, 10);
        const b = randomInt(1, a);
        return { text: `${a} - ${b}`, answer: a - b };
      }
    },
    sub1digit: {
      label: "Restas 1 dígito",
      display: "standard",
      explanation: "Resta dos números de un dígito.",
      example: "9 - 4 = 5",
      nextProblem() {
        const a = randomInt(1, 9);
        const b = randomInt(1, a);
        return { text: `${a} - ${b}`, answer: a - b };
      }
    },
    sub2digits: {
      label: "Restas 2 dígitos",
      display: "standard",
      explanation: "Resta dos números de dos dígitos.",
      example: "65 - 28 = 37",
      nextProblem() {
        const a = randomInt(10, 99);
        const b = randomInt(10, a);
        return { text: `${a} - ${b}`, answer: a - b };
      }
    },
    sub3digits: {
      label: "Restas 3 dígitos",
      display: "standard",
      explanation: "Resta dos números de tres dígitos.",
      example: "742 - 319 = 423",
      nextProblem() {
        const a = randomInt(100, 999);
        const b = randomInt(100, a);
        return { text: `${a} - ${b}`, answer: a - b };
      }
    },
    mul: {
      label: "Multiplicaciones 1-10",
      display: "standard",
      explanation: "Multiplica dos números del 1 al 10. Calcula el producto correctamente.",
      example: "6 x 7 = 42",
      nextProblem() {
        const a = randomInt(1, 10);
        const b = randomInt(1, 10);
        return { text: `${a} x ${b}`, answer: a * b };
      }
    },
    mul1digit: {
      label: "Multiplicaciones 1 dígito",
      display: "standard",
      explanation: "Multiplica dos números de un dígito.",
      example: "7 x 8 = 56",
      nextProblem() {
        const a = randomInt(1, 9);
        const b = randomInt(1, 9);
        return { text: `${a} x ${b}`, answer: a * b };
      }
    },
    mul2digits: {
      label: "Multiplicaciones 2 dígitos",
      display: "standard",
      explanation: "Multiplica un número de dos dígitos por uno de un dígito.",
      example: "14 x 6 = 84",
      nextProblem() {
        const a = randomInt(10, 99);
        const b = randomInt(1, 9);
        return { text: `${a} x ${b}`, answer: a * b };
      }
    },
    mulDouble2digits: {
      label: "Doblar 2 dígitos",
      display: "standard",
      explanation: "Dobla un número de dos dígitos multiplicándolo por 2.",
      example: "33 x 2 = 66",
      nextProblem() {
        const a = randomInt(10, 99);
        return { text: `${a} x 2`, answer: a * 2 };
      }
    },
    mul3digits: {
      label: "Multiplicaciones 3 dígitos",
      display: "standard",
      explanation: "Multiplica un número de tres dígitos por uno de un dígito.",
      example: "123 x 7 = 861",
      nextProblem() {
        const a = randomInt(100, 999);
        const b = randomInt(1, 9);
        return { text: `${a} x ${b}`, answer: a * b };
      }
    },
    div: {
      label: "Divisiones 1-10",
      display: "standard",
      explanation: "Divide dos números del 1 al 10. El resultado siempre es exacto (sin decimales).",
      example: "20 / 4 = 5",
      nextProblem() {
        const divisor = randomInt(1, 10);
        const quotient = randomInt(1, 10);
        const dividend = divisor * quotient;
        return { text: `${dividend} / ${divisor}`, answer: quotient };
      }
    },
    div1digit: {
      label: "Divisiones 1 dígito",
      display: "standard",
      explanation: "Divide números de un dígito con resultado exacto.",
      example: "8 / 4 = 2",
      nextProblem() {
        const divisor = randomInt(1, 9);
        const quotient = randomInt(1, 9);
        const dividend = divisor * quotient;
        return { text: `${dividend} / ${divisor}`, answer: quotient };
      }
    },
    div2digits: {
      label: "Divisiones 2 dígitos",
      display: "standard",
      explanation: "Divide un número de dos dígitos entre uno de un dígito.",
      example: "56 / 8 = 7",
      nextProblem() {
        const divisor = randomInt(1, 9);
        const quotient = randomInt(2, 12);
        const dividend = divisor * quotient;
        return { text: `${dividend} / ${divisor}`, answer: quotient };
      }
    },
    div3digits: {
      label: "Divisiones 3 dígitos",
      display: "standard",
      explanation: "Divide un número de tres dígitos entre uno de un dígito.",
      example: "175 / 5 = 35",
      nextProblem() {
        const divisor = randomInt(1, 9);
        const quotient = randomInt(12, 99);
        const dividend = divisor * quotient;
        return { text: `${dividend} / ${divisor}`, answer: quotient };
      }
    },
    mul67: {
      label: "Multiplicaciones por 67",
      display: "standard",
      explanation: "Multiplica 67 por un número del 1 al 10.",
      example: "67 x 4 = 268",
      nextProblem() {
        const factor = randomInt(1, 10);
        return { text: `67 x ${factor}`, answer: 67 * factor };
      }
    },
    comp10: {
      label: "Complemento a 10",
      display: "complement",
      explanation: "Encuentra qué número necesitas sumar para llegar a 10.",
      example: "7 + ? = 10, la respuesta es 3",
      nextProblem() {
        const fixedNumber = randomInt(1, 9);
        return {
          prefix: `${fixedNumber} +`,
          suffix: "= 10",
          answer: 10 - fixedNumber
        };
      }
    },
    comp100: {
      label: "Complemento a 100",
      display: "complement",
      explanation: "Encuentra qué número necesitas sumar para llegar a 100.",
      example: "75 + ? = 100, la respuesta es 25",
      nextProblem() {
        const fixedNumber = randomInt(1, 99);
        return {
          prefix: `${fixedNumber} +`,
          suffix: "= 100",
          answer: 100 - fixedNumber
        };
      }
    },
    comp1: {
      label: "Complemento a 1",
      display: "complement",
      explanation: "Encuentra qué número necesitas sumar para llegar a 1.",
      example: "0.78 + ? = 1, la respuesta es 0.22",
      nextProblem() {
        const fixedNumber = randomInt(1, 99) / 100;
        const formatted = fixedNumber.toFixed(2).replace(/\.0+$/, "");
        return {
          prefix: `${formatted} +`,
          suffix: "= 1",
          answer: Number((1 - fixedNumber).toFixed(2))
        };
      }
    },
    mul05: {
      label: "Multiplicaciones 0-5",
      display: "standard",
      explanation: "Multiplica dos números del 0 al 5. Calcula el producto con rapidez.",
      example: "3 x 4 = 12",
      nextProblem() {
        const a = randomInt(0, 5);
        const b = randomInt(0, 5);
        return { text: `${a} x ${b}`, answer: a * b };
      }
    },
    div05: {
      label: "Divisiones 0-5",
      display: "standard",
      explanation: "Divide dos números del 0 al 5. El resultado siempre es exacto y sin decimales.",
      example: "20 / 4 = 5",
      nextProblem() {
        const divisor = randomInt(1, 5);
        const quotient = randomInt(0, 5);
        const dividend = divisor * quotient;
        return { text: `${dividend} / ${divisor}`, answer: quotient };
      }
    },
    divHalf: {
      label: "Divisiones 0.5",
      display: "standard",
      explanation: "Divide números del 20 al 50 por 0.5.",
      example: "20 / 0.5 = 40",
      nextProblem() {
        const dividend = randomInt(20, 50);
        const divisor = 0.5;
        const quotient = dividend / divisor;
        return {
          text: `${dividend} / 0.5`,
          answer: quotient
        };
      }
    },
    mul06: {
      label: "Multiplicaciones 0-6",
      display: "standard",
      explanation: "Multiplica dos números del 0 al 6. Calcula el producto correctamente.",
      example: "4 x 5 = 20",
      nextProblem() {
        const a = randomInt(0, 6);
        const b = randomInt(0, 6);
        return { text: `${a} x ${b}`, answer: a * b };
      }
    },
    div06: {
      label: "Divisiones 0-6",
      display: "standard",
      explanation: "Divide dos números del 0 al 6. El resultado siempre es exacto (sin decimales).",
      example: "18 / 3 = 6",
      nextProblem() {
        const divisor = randomInt(1, 6);
        const quotient = randomInt(0, 6);
        const dividend = divisor * quotient;
        return { text: `${dividend} / ${divisor}`, answer: quotient };
      }
    },
    mul05_120: {
      label: "Multiplicaciones 0-5 (120 seg)",
      display: "standard",
      explanation: "Multiplica dos números del 0 al 5. Calcula el producto con rapidez en 120 segundos.",
      example: "3 x 4 = 12",
      duration: 120,
      nextProblem() {
        const a = randomInt(0, 5);
        const b = randomInt(0, 5);
        return { text: `${a} x ${b}`, answer: a * b };
      }
    }
  };

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randomHalf(min, max) {
    const value = randomInt(min * 2, max * 2) / 2;
    return Number(value.toFixed(1));
  }

  function formatHalf(value) {
    return Number(value).toFixed(1).replace(/\.0$/, "");
  }

  function getBestScore() {
    return Number(localStorage.getItem(BEST_SCORE_KEY) || 0);
  }

  function getTotalScore() {
    return Number(localStorage.getItem(TOTAL_SCORE_KEY) || 0);
  }

  function setBestScore(score) {
    localStorage.setItem(BEST_SCORE_KEY, String(score));
  }

  function setTotalScore(score) {
    localStorage.setItem(TOTAL_SCORE_KEY, String(score));
  }

  function getModuleStats(mode) {
    const stats = JSON.parse(localStorage.getItem("moduleStats") || "{}");
    return stats[mode] || { times: 0, points: 0 };
  }

  function saveModuleStats(mode, times, points) {
    const stats = JSON.parse(localStorage.getItem("moduleStats") || "{}");
    stats[mode] = { times, points };
    localStorage.setItem("moduleStats", JSON.stringify(stats));
  }

  function updateModuleStats(mode, points) {
    const current = getModuleStats(mode);
    saveModuleStats(mode, current.times + 1, current.points + points);
  }

  function updateScoreDisplays() {
    const storedBest = getBestScore();
    const storedTotal = getTotalScore();
    lobbyBestScore.textContent = storedBest;
    bestScore.textContent = storedBest;
    lobbyTotalScore.textContent = storedTotal;
    totalScore.textContent = storedTotal;
  }

  function getChallengeRanking() {
    try {
      return JSON.parse(localStorage.getItem("calculoYermistaChallengeRanking") || "[]");
    } catch (error) {
      return [];
    }
  }

  function saveChallengeRankingEntry(name, score) {
    const history = getChallengeRanking();
    const safeName = String(name || "Jugador").trim() || "Jugador";
    history.push({ name: safeName, score: Number(score) || 0, timestamp: Date.now() });
    localStorage.setItem("calculoYermistaChallengeRanking", JSON.stringify(history.slice(-10)));
  }

  function renderChallengeRanking() {
    const ranking = getChallengeRanking();
    const rankingSummary = document.getElementById("rankingSummary");

    if (!rankingSummary) {
      return;
    }

    if (!ranking.length) {
      rankingSummary.innerHTML = '<p class="competition-subtitle">Aún no hay resultados de retos registrados.</p>';
      return;
    }

    const bestEntry = [...ranking].sort((a, b) => b.score - a.score)[0];
    const worstEntry = [...ranking].sort((a, b) => a.score - b.score)[0];

    rankingSummary.innerHTML = `
      <div class="ranking-card">
        <h3 class="competition-title">Ranking del reto</h3>
        <p class="competition-subtitle">Mejor puntaje: <strong>${bestEntry.score}</strong> — ${bestEntry.name}</p>
        <p class="competition-subtitle">Peor puntaje: <strong>${worstEntry.score}</strong> — ${worstEntry.name}</p>
      </div>
    `;
  }

  function getRegisteredUsers() {
    const storedUsers = localStorage.getItem("calculoYermistaRegisteredUsers") || "";
    const users = storedUsers
      .split("|")
      .map((name) => name.trim())
      .filter(Boolean);

    const currentName = window.getPlayerName ? window.getPlayerName() : "";
    if (currentName) {
      const list = users.filter((name) => name !== currentName);
      list.unshift(currentName);
      return list;
    }

    return users;
  }

  function saveRegisteredUsers(users) {
    const uniqueUsers = [...new Set(users.map((name) => name.trim()).filter(Boolean))];
    localStorage.setItem("calculoYermistaRegisteredUsers", uniqueUsers.join("|"));
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function connectSocket() {
    if (state.socket) {
      return state.socket;
    }

    if (!window.io) {
      return null;
    }

    const socket = window.io({
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 500
    });

    socket.on("connect", () => {
      const name = window.getPlayerName ? window.getPlayerName() : "";
      if (name) {
        socket.emit("player:register", { name });
      }
      renderUserCatalog();
    });

    socket.on("players:update", (players) => {
      state.onlineUsers = Array.isArray(players) ? players : [];
      renderUserCatalog();
    });

    socket.on("challenge:incoming", (payload) => {
      state.pendingIncomingChallenge = payload;
      const challengerName = payload?.challengerName || "Un jugador";
      if (challengeInfoText) {
        challengeInfoText.textContent = `${challengerName} te ha retado a una competencia de ${payload?.modules?.length || 0} módulo(s) durante ${payload?.time || 60} segundos.`;
      }
      showView("challengeView");
    });

    socket.on("challenge:start", (payload) => {
      startChallenge(payload);
    });

    socket.on("disconnect", () => {
      state.onlineUsers = [];
      renderUserCatalog();
    });

    state.socket = socket;
    return socket;
  }

  function registerPlayerWithServer(name) {
    const socket = connectSocket();
    if (!socket) {
      return;
    }

    if (socket.connected) {
      socket.emit("player:register", { name });
      return;
    }

    socket.once("connect", () => {
      socket.emit("player:register", { name });
    });
  }

  function startChallenge(payload) {
    const modules = Array.isArray(payload?.modules) && payload.modules.length ? payload.modules : ["sum1digit"];
    const time = Math.max(60, Math.min(200, Number(payload?.time) || 60));

    state.competitionModules = modules;
    state.competitionTime = time;
    state.mode = modules[0];
    state.challengeMode = true;
    state.challengeModules = modules;
    state.challengeModuleIndex = 0;
    state.score = 0;
    state.totalTime = time;
    state.timeLeft = time;
    state.running = false;
    state.lastTimestamp = 0;

    if (modeName) {
      modeName.textContent = modeConfig[state.mode].label;
    }

    startCountdown();
  }

  function renderUserCatalog() {
    if (!userCatalog) {
      return;
    }

    const currentName = window.getPlayerName ? window.getPlayerName() : "";
    const onlineUsers = (state.onlineUsers || [])
      .filter((player) => player && player.name)
      .filter((player) => player.name !== currentName)
      .map((player) => ({ id: player.id, name: player.name }));

    if (!onlineUsers.length) {
      userCatalog.innerHTML = '<p class="competition-subtitle">No hay jugadores conectados en esta red todavía.</p>';
      return;
    }

    userCatalog.innerHTML = onlineUsers
      .map((player) => `
        <div class="user-item">
          <span class="user-name">${escapeHtml(player.name)}</span>
          <button class="user-action secondary-action" data-user-id="${escapeHtml(player.id)}" data-user-name="${escapeHtml(player.name)}">Desafiar</button>
        </div>
      `)
      .join("");
  }

  function updatePlayerNameDisplay(name) {
    const safeName = name || "Jugador";
    const playerNameDisplay = document.getElementById("playerNameDisplay");
    if (playerNameDisplay) {
      playerNameDisplay.textContent = `Nombre: ${safeName}`;
    }
  }

  function getCompetitionModules() {
    return Object.entries(modeConfig)
      .filter(([, config]) => config.label)
      .map(([key, config]) => ({ key, label: config.label }));
  }

  function renderModuleOptions() {
    if (!moduleOptions) {
      return;
    }

    const modules = getCompetitionModules();
    moduleOptions.innerHTML = modules
      .map((module) => {
        const isSelected = ["comp10", "comp100"].includes(module.key);
        return `
          <div class="module-option">
            <label for="module-${module.key}">${module.label}</label>
            <input id="module-${module.key}" type="checkbox" value="${module.key}" ${isSelected ? "checked" : ""}>
          </div>
        `;
      })
      .join("");
  }

  function openCompetitionSetup(opponentName, opponentId) {
    state.competitionOpponentId = opponentId || null;
    state.competitionOpponentName = opponentName || null;

    if (competitionTargetText) {
      competitionTargetText.textContent = `Vas a competir contra ${opponentName || "un rival"}. Elige los módulos y el tiempo.`;
    }
    if (competitionTimeInput) {
      competitionTimeInput.value = "60";
    }
    renderModuleOptions();
    showView("competitionSetup");
  }

  function showRegisterView() {
    const playerNameInput = document.getElementById("playerNameInput");
    const storedName = window.getPlayerName ? window.getPlayerName() : "";
    if (playerNameInput) {
      playerNameInput.value = storedName || "";
      requestAnimationFrame(() => playerNameInput.focus());
    }
    updatePlayerNameDisplay(storedName || "Jugador");
    showView("register");
  }

  window.enterLobbyAfterRegistration = function (name) {
    const finalName = window.savePlayerName ? window.savePlayerName(name) : name;
    updatePlayerNameDisplay(finalName);
    updateScoreDisplays();
    connectSocket();
    showView("lobby");
    window.history.replaceState({ view: "lobby" }, "", "#lobby");
  };

  window.registerPlayerWithServer = function (name) {
    registerPlayerWithServer(name);
  };

  function showView(name) {
    Object.entries(views).forEach(([key, element]) => {
      element.classList.toggle("active", key === name);
    });

    confirmInstructions.style.display = name === "confirm" ? "block" : "none";
    resultInstructions.style.display = name === "result" ? "block" : "none";
  }

  function showViewWithLoading(name) {
    const loadingView = document.getElementById("loadingView");
    loadingView.style.display = "flex";
    
    setTimeout(() => {
      showView(name);
      loadingView.style.display = "none";
      window.history.pushState({ view: name }, "", `#${name}`);
    }, LOADING_DURATION);
  }

  function handleHistoryChange(event) {
    const state = event.state;
    if (state && state.view) {
      showView(state.view);
    }
  }

  window.addEventListener("popstate", handleHistoryChange);

  function getActiveInput() {
    return modeConfig[state.mode] && modeConfig[state.mode].display === "complement"
      ? complementInput
      : answerInput;
  }

  function getActiveTextElements() {
    if (modeConfig[state.mode] && modeConfig[state.mode].display === "complement") {
      return [complementPrefix, complementSuffix];
    }
    return [operationText];
  }

  function clearFeedback() {
    answerInput.classList.remove("correct", "wrong");
    complementInput.classList.remove("correct", "wrong");
    getActiveTextElements().forEach((element) => {
      element.classList.remove("correct", "wrong");
    });
  }

  function triggerFeedback(isCorrect) {
    clearFeedback();
    const className = isCorrect ? "correct" : "wrong";
    getActiveInput().classList.add(className);
    getActiveTextElements().forEach((element) => {
      element.classList.add(className);
    });
  }

  function setDisplayMode(mode) {
    const isComplement = modeConfig[mode].display === "complement";
    standardOperation.classList.toggle("active", !isComplement);
    complementOperation.classList.toggle("active", isComplement);
    answerInput.value = "";
    complementInput.value = "";
    clearFeedback();
  }

  function nextProblem() {
    const challengeModes = state.challengeMode && state.challengeModules.length > 0
      ? state.challengeModules
      : [state.mode];

    const activeMode = challengeModes[state.challengeModuleIndex % challengeModes.length];
    state.mode = activeMode;
    state.challengeModuleIndex = (state.challengeModuleIndex + 1) % challengeModes.length;

    const problem = modeConfig[activeMode].nextProblem();
    state.currentAnswer = problem.answer;

    if (modeName) {
      modeName.textContent = modeConfig[activeMode].label;
    }

    if (modeConfig[activeMode].display === "complement") {
      complementPrefix.textContent = problem.prefix;
      complementSuffix.textContent = problem.suffix;
      complementInput.value = "";
    } else {
      operationText.textContent = problem.text;
      answerInput.value = "";
    }

    setDisplayMode(activeMode);
  }

  function refreshScore() {
    liveScore.textContent = state.score;
  }

  function updateTimerVisual() {
    const ratio = Math.max(0, state.timeLeft / state.totalTime);
    timerFill.style.width = `${ratio * 100}%`;
    timerFill.classList.toggle("low", ratio < 0.25);
    timeLeftText.textContent = state.timeLeft.toFixed(1);
  }

  function endGame() {
    state.running = false;
    cancelAnimationFrame(state.animationFrame);
    getActiveInput().blur();

    if (state.score > getBestScore()) {
      setBestScore(state.score);
    }

    updateModuleStats(state.mode, state.score);
    const playerName = window.getPlayerName ? window.getPlayerName() : "Jugador";
    saveChallengeRankingEntry(playerName, state.score);
    finalScore.textContent = state.score;
    updateScoreDisplays();
    renderChallengeRanking();
    showView("result");
  }

  function showRecordView() {
    const allModes = ["sum", "sum1digit", "sum2digits", "sum3digits", "comp10", "comp100", "comp1", "sub", "sub1digit", "sub2digits", "sub3digits", "mul", "mul1digit", "mul2digits", "mulDouble2digits", "mul3digits", "mul67", "mul05", "mul06", "mul05_120", "div", "div1digit", "div2digits", "div3digits", "div05", "divHalf", "div06"];
    let totalPoints = 0;
    
    let html = '<div class="stats-grid">';
    
    allModes.forEach(mode => {
      const stats = getModuleStats(mode);
      const label = modeConfig[mode].label;
      totalPoints += stats.points;
      
      html += `
        <div class="stat-card">
          <h3 class="stat-title">${label}</h3>
          <div class="stat-row">
            <span class="stat-label">Sesiones:</span>
            <span class="stat-value">${stats.times}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Puntos acumulados:</span>
            <span class="stat-value">${stats.points}</span>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    html += `<div class="total-stats"><strong>Total de puntos acumulados: ${totalPoints}</strong></div>`;
    
    statsContainer.innerHTML = html;
  }

  function startCountdown() {
    state.countdownValue = 5;
    countdownModeTitle.textContent = modeConfig[state.mode].label;
    explanationText.textContent = modeConfig[state.mode].explanation;
    exampleText.textContent = modeConfig[state.mode].example;
    
    showView("countdown");
    updateCountdownDisplay();
  }

  function updateCountdownDisplay() {
    if (state.countdownValue > 0) {
      countdownNumber.textContent = state.countdownValue;
      state.countdownValue--;
      state.animationFrame = setTimeout(updateCountdownDisplay, 1000);
    } else {
      cancelAnimationFrame(state.animationFrame);
      startGame(state.mode);
    }
  }

  function tick(timestamp) {
    if (!state.running) {
      return;
    }

    if (!state.lastTimestamp) {
      state.lastTimestamp = timestamp;
    }

    const elapsed = (timestamp - state.lastTimestamp) / 1000;
    state.lastTimestamp = timestamp;
    state.timeLeft = Math.max(0, state.timeLeft - elapsed);
    updateTimerVisual();

    if (state.timeLeft <= 0) {
      endGame();
      return;
    }

    state.animationFrame = requestAnimationFrame(tick);
  }

  function startGame(mode) {
    state.mode = mode;
    state.score = 0;
    state.totalTime = modeConfig[mode].duration || GAME_DURATION;
    state.timeLeft = state.totalTime;
    state.running = true;
    state.lastTimestamp = 0;

    if (!state.challengeMode) {
      state.challengeModules = [];
      state.challengeModuleIndex = 0;
    }

    const activeMode = state.challengeMode && state.challengeModules.length > 0
      ? state.challengeModules[0]
      : mode;

    state.mode = activeMode;
    modeName.textContent = modeConfig[activeMode].label;
    setDisplayMode(activeMode);
    refreshScore();
    updateTimerVisual();
    nextProblem();
    showView("game");

    requestAnimationFrame(() => {
      const input = getActiveInput();
      input.focus();
      input.select();
    });

    cancelAnimationFrame(state.animationFrame);
    state.animationFrame = requestAnimationFrame(tick);
  }

  function handleSubmit() {
    if (!state.running) {
      return;
    }

    const input = getActiveInput();
    const value = input.value.trim();

    if (value === "" || value === "-" || value === "+") {
      return;
    }

    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
      return;
    }

    const isCorrect = numericValue === state.currentAnswer;

    if (isCorrect) {
      state.score += 1;
      setTotalScore(getTotalScore() + 1);
      refreshScore();
      updateScoreDisplays();
    }

    triggerFeedback(isCorrect);
    nextProblem();

    requestAnimationFrame(() => {
      triggerFeedback(isCorrect);
      const nextInput = getActiveInput();
      nextInput.focus();
      nextInput.select();
    });
  }

  function bindEnterSubmit(input) {
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleSubmit();
      }
    });
  }

  modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const mode = button.dataset.mode;
      state.mode = mode;
      confirmModeName.textContent = modeConfig[mode].label;
      showViewWithLoading("confirm");
    });
  });

  confirmStartButton.addEventListener("click", () => {
    if (state.mode) {
      confirmInstructions.style.display = "none";
      startCountdown();
    }
  });

  confirmBackButton.addEventListener("click", () => {
    state.mode = null;
    updateScoreDisplays();
    window.history.back();
  });

  recordButton.addEventListener("click", () => {
    showRecordView();
    showViewWithLoading("record");
  });

  settingsButton.addEventListener("click", () => {
    const storedName = window.getPlayerName ? window.getPlayerName() : "";
    if (newPlayerNameInput) {
      newPlayerNameInput.value = storedName || "";
      requestAnimationFrame(() => newPlayerNameInput.focus());
    }
    showView("changeName");
  });

  saveNameButton.addEventListener("click", () => {
    const newName = window.savePlayerName ? window.savePlayerName(newPlayerNameInput.value) : newPlayerNameInput.value;
    const currentName = window.getPlayerName ? window.getPlayerName() : "";
    const existingUsers = getRegisteredUsers().filter((name) => name !== currentName);
    saveRegisteredUsers([newName, ...existingUsers]);
    updatePlayerNameDisplay(newName);
    registerPlayerWithServer(newName);
    renderUserCatalog();
    updateScoreDisplays();
    showView("lobby");
  });

  cancelNameButton.addEventListener("click", () => {
    showView("lobby");
  });

  competitionButton.addEventListener("click", () => {
    renderUserCatalog();
    if (userCatalog) {
      userCatalog.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  });

  userCatalog.addEventListener("click", (event) => {
    const target = event.target.closest("[data-user-id]");
    if (!target) {
      return;
    }

    const opponentId = target.dataset.userId;
    const opponentName = target.dataset.userName;
    openCompetitionSetup(opponentName, opponentId);
  });

  startCompetitionButton.addEventListener("click", () => {
    const selectedModules = Array.from(moduleOptions.querySelectorAll('input[type="checkbox"]:checked'))
      .map((input) => input.value);
    const timeSeconds = Number(competitionTimeInput.value) || 60;

    if (!selectedModules.length) {
      alert("Selecciona al menos un módulo para la competencia.");
      return;
    }

    if (!state.competitionOpponentId) {
      alert("Selecciona un rival antes de iniciar la competencia.");
      return;
    }

    const socket = connectSocket();
    if (!socket) {
      alert("No hay conexión con el servidor de LAN.");
      return;
    }

    state.competitionModules = selectedModules;
    state.competitionTime = Math.min(200, Math.max(60, timeSeconds));
    state.pendingChallenge = {
      opponentId: state.competitionOpponentId,
      opponentName: state.competitionOpponentName,
      modules: selectedModules,
      time: state.competitionTime
    };

    if (challengeInfoText) {
      challengeInfoText.textContent = `Esperando a ${state.competitionOpponentName || "el rival"}...`;
    }
    if (challengePendingText) {
      challengePendingText.textContent = `Tu invitación para ${state.competitionOpponentName || "el rival"} está en camino. Cuando acepte, comenzará una pantalla nueva de reto.`;
    }

    socket.emit("challenge:create", {
      opponentId: state.competitionOpponentId,
      challengerName: window.getPlayerName ? window.getPlayerName() : "Jugador",
      opponentName: state.competitionOpponentName,
      modules: selectedModules,
      time: state.competitionTime
    });

    showView("challengePending");
  });

  cancelCompetitionButton.addEventListener("click", () => {
    state.competitionOpponentId = null;
    state.competitionOpponentName = null;
    showView("lobby");
  });

  acceptChallengeButton.addEventListener("click", () => {
    const socket = connectSocket();
    const payload = state.pendingIncomingChallenge;

    if (!socket || !payload) {
      showView("lobby");
      return;
    }

    socket.emit("challenge:accept", {
      challengerId: payload.challengerId,
      challengerName: payload.challengerName,
      opponentName: window.getPlayerName ? window.getPlayerName() : "Jugador",
      modules: payload.modules,
      time: payload.time
    });

    startChallenge(payload);
  });

  declineChallengeButton.addEventListener("click", () => {
    state.pendingIncomingChallenge = null;
    showView("lobby");
  });

  pendingBackToLobbyButton.addEventListener("click", () => {
    state.pendingIncomingChallenge = null;
    state.competitionOpponentId = null;
    state.competitionOpponentName = null;
    showView("lobby");
  });

  recordBackButton.addEventListener("click", () => {
    updateScoreDisplays();
    window.history.back();
  });

  bindEnterSubmit(answerInput);
  bindEnterSubmit(complementInput);

  backToLobbyButton.addEventListener("click", () => {
    state.running = false;
    cancelAnimationFrame(state.animationFrame);
    state.animationFrame = 0;
    state.lastTimestamp = 0;
    state.currentAnswer = null;
    resultInstructions.style.display = "none";
    updateScoreDisplays();
    showView("lobby");
    window.history.replaceState({ view: "lobby" }, "", "#lobby");
  });

  // Inicializar el primer estado del historial
  window.history.replaceState({ view: "register" }, "", "#register");
  showRegisterView();
  renderUserCatalog();
  updateScoreDisplays();
})();