(() => {
  const STORAGE_KEY = "calculoYermistaPlayerName";
  const defaultName = "Jugador";

  function getSavedName() {
    return (localStorage.getItem(STORAGE_KEY) || "").trim();
  }

  function saveName(name) {
    const finalName = (name || "").trim() || defaultName;
    localStorage.setItem(STORAGE_KEY, finalName);
    return finalName;
  }

  function updateDisplay(name) {
    const nameDisplay = document.getElementById("playerNameDisplay");
    if (nameDisplay) {
      nameDisplay.textContent = `Nombre: ${name}`;
    }
  }

  function initializeRegistration() {
    const playerNameInput = document.getElementById("playerNameInput");
    const registerContinueButton = document.getElementById("registerContinueButton");
    const savedName = getSavedName();

    if (playerNameInput) {
      playerNameInput.value = savedName || "";
    }

    if (registerContinueButton && playerNameInput) {
      registerContinueButton.addEventListener("click", () => {
        const name = saveName(playerNameInput.value);
        updateDisplay(name);

        if (window && typeof window.registerPlayerWithServer === "function") {
          window.registerPlayerWithServer(name);
        }

        if (window && typeof window.enterLobbyAfterRegistration === "function") {
          window.enterLobbyAfterRegistration(name);
        }
      });
    }

    if (playerNameInput) {
      playerNameInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          registerContinueButton?.click();
        }
      });
    }

    updateDisplay(savedName || defaultName);
  }

  window.getPlayerName = getSavedName;
  window.savePlayerName = saveName;
  window.updatePlayerNameDisplay = updateDisplay;
  window.initializePlayerRegistration = initializeRegistration;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeRegistration);
  } else {
    initializeRegistration();
  }
})();
