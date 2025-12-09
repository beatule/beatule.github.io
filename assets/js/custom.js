(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("#contact-form");
    if (!form) return;

    const output = document.querySelector("#form-output");
    const popup = document.querySelector("#success-popup");
    const popupCloseBtn = popup ? popup.querySelector(".success-popup-close") : null;
    const submitBtn = form.querySelector("button[type='submit']");

    const fields = ["firstName", "lastName", "email", "phone", "address"];


    const sliders = [
      { input: "rating1", value: "rating1-value" },
      { input: "rating2", value: "rating2-value" },
      { input: "rating3", value: "rating3-value" }
    ];

    sliders.forEach(s => {
      const input = document.getElementById(s.input);
      const value = document.getElementById(s.value);
      input.addEventListener("input", () => value.textContent = input.value);
    });

    
    fields.forEach(id => {
      const input = form[id];
      input.addEventListener("input", () => {
        validateField(input);
        updateSubmitState();
      });
    });

    function validateField(input) {
      const value = input.value.trim();
      clearError(input);

      if (value === "") {
        setError(input, "Šis laukelis privalomas");
        return false;
      }

      if (input.id === "email" && !validateEmail(value)) {
        setError(input, "Neteisingas el. pašto formatas");
        return false;
      }

      if (input.id === "phone" && !validatePhone(value)) {
        setError(input, "Neteisingas telefono numeris");
        return false;
      }

      return true;
    }

    function validateAllFields() {
      let ok = true;
      fields.forEach(id => {
        const fieldOk = validateField(form[id]);
        if (!fieldOk) ok = false;
      });

      if (
        form.rating1.value < 1 ||
        form.rating2.value < 1 ||
        form.rating3.value < 1
      ) {
        ok = false;
      }

      return ok;
    }

    function updateSubmitState() {
      submitBtn.disabled = !validateAllFields();

      if (submitBtn.disabled) {
        submitBtn.style.opacity = "0.5";
        submitBtn.style.cursor = "not-allowed";
      } else {
        submitBtn.style.opacity = "1";
        submitBtn.style.cursor = "pointer";
      }
    }

    updateSubmitState();

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!validateAllFields()) {
        showError("Prašome pataisyti klaidas formoje.");
        return;
      }

      const formData = {
        firstName: form.firstName.value.trim(),
        lastName: form.lastName.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        address: form.address.value.trim(),
        rating1: Number(form.rating1.value),
        rating2: Number(form.rating2.value),
        rating3: Number(form.rating3.value)
      };

      const ratings = [formData.rating1, formData.rating2, formData.rating3];
      const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      formData.average = avg.toFixed(1);

      console.log("Kontaktų formos duomenys:", formData);

      output.innerHTML = `
        <h4>Jūsų pateikti duomenys</h4>
        <p><strong>Vardas:</strong> ${formData.firstName}</p>
        <p><strong>Pavardė:</strong> ${formData.lastName}</p>
        <p><strong>El. paštas:</strong> ${formData.email}</p>
        <p><strong>Tel. numeris:</strong> ${formData.phone}</p>
        <p><strong>Adresas:</strong> ${formData.address}</p>
        <p><strong>Įvertinimai:</strong> ${formData.rating1}, ${formData.rating2}, ${formData.rating3}</p>
        <p><strong>Vidurkis:</strong> ${formData.firstName} ${formData.lastName}: ${formData.average}</p>
      `;

      showSuccessPopup("Duomenys pateikti sėkmingai!");

      form.reset();
      sliders.forEach(s => {
        document.getElementById(s.value).textContent = "5";
      });

      updateSubmitState();
    });

    if (popup && popupCloseBtn) {
      popupCloseBtn.addEventListener("click", () => popup.classList.remove("show"));
      popup.addEventListener("click", (e) => {
        if (e.target === popup) popup.classList.remove("show");
      });
    }
  });
})();


function showError(message) {
  const popup = document.querySelector("#success-popup");
  const textEl = popup.querySelector("p");

  textEl.textContent = message;
  popup.classList.add("show");

  popup.querySelector(".success-popup-inner").style.borderColor = "#ff4f4f";
  textEl.style.color = "#ff4f4f";

  setTimeout(() => {
    popup.classList.remove("show");
    popup.querySelector(".success-popup-inner").style.borderColor = "";
    textEl.style.color = "";
  }, 2000);
}

function setError(input, message) {
  let small = input.parentElement.querySelector(".error-msg");

  if (!small) {
    small = document.createElement("small");
    small.classList.add("error-msg");
    input.parentElement.appendChild(small);
  }

  input.classList.add("error");
  small.style.display = "block";
  small.textContent = message;
}

function clearError(input) {
  const small = input.parentElement.querySelector(".error-msg");
  input.classList.remove("error");
  if (small) small.style.display = "none";
}

function validateEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

function validatePhone(phone) {
  return /^(\+?\d{8,14})$/.test(phone);
}


document.addEventListener("DOMContentLoaded", function () {
  const board = document.getElementById("game-board");
  const movesEl = document.getElementById("move-count");
  const matchesEl = document.getElementById("match-count");
  const timeEl = document.getElementById("time-elapsed");
  const messageEl = document.getElementById("game-message");
  const startBtn = document.getElementById("game-start");
  const resetBtn = document.getElementById("game-reset");
  const difficultyInputs = document.querySelectorAll("input[name='game-difficulty']");
  const bestEasyEl = document.getElementById("best-easy");
  const bestHardEl = document.getElementById("best-hard");

  if (!board) return; // jei žaidimo sekcija dar nesukurta

  const ICONS = ["💻","🧠","⚙️","📚","🌐","🎧","🛰️","🔋","📸","🧪","💡","🧾"];

  const DIFFICULTIES = {
    easy: { pairs: 6, cols: 4 },
    hard: { pairs: 12, cols: 6 }
  };

  let currentDifficulty = "easy";
  let totalPairs = DIFFICULTIES[currentDifficulty].pairs;

  let firstCard = null;
  let secondCard = null;
  let isBoardLocked = false;
  let moves = 0;
  let matches = 0;
  let gameStarted = false;

  let elapsedSeconds = 0;
  let timerInterval = null;

  const LS_KEYS = {
    easy: "memoryBestEasy",
    hard: "memoryBestHard"
  };

  function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const mm = minutes < 10 ? "0" + minutes : String(minutes);
    const ss = seconds < 10 ? "0" + seconds : String(seconds);
    return mm + ":" + ss;
  }

  function updateMoves() {
    if (movesEl) movesEl.textContent = String(moves);
  }

  function updateMatches() {
    if (matchesEl) matchesEl.textContent = String(matches) + " / " + String(totalPairs);
  }

  function updateTime() {
    if (timeEl) timeEl.textContent = formatTime(elapsedSeconds);
  }

  function showMessage(text, type) {
    if (!messageEl) return;
    messageEl.textContent = text || "";
    messageEl.classList.remove("game-message-win", "game-message-info");
    if (type === "win") {
      messageEl.classList.add("game-message-win");
    } else if (type === "info") {
      messageEl.classList.add("game-message-info");
    }
  }

  function startTimer() {
    stopTimer();
    elapsedSeconds = 0;
    updateTime();
    timerInterval = setInterval(function () {
      elapsedSeconds += 1;
      updateTime();
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function createDeck(pairsCount) {
    const chosenIcons = ICONS.slice(0, pairsCount);
    const deck = [];
    let idCounter = 0;

    chosenIcons.forEach(function (icon) {
      for (var i = 0; i < 2; i++) {
        deck.push({
          id: idCounter++,
          icon: icon
        });
      }
    });

    // Fisher-Yates maišymas
    for (var j = deck.length - 1; j > 0; j--) {
      var k = Math.floor(Math.random() * (j + 1));
      var tmp = deck[j];
      deck[j] = deck[k];
      deck[k] = tmp;
    }

    return deck;
  }

  function renderBoard(deck, cols) {
    if (!board) return;
    board.innerHTML = "";
    board.style.setProperty("--game-cols", String(cols));

    deck.forEach(function (card) {
      var cardEl = document.createElement("button");
      cardEl.className = "memory-card";
      cardEl.type = "button";
      cardEl.dataset.icon = card.icon;
      cardEl.innerHTML =
        '<div class="card-inner">' +
          '<div class="card-face card-front">?</div>' +
          '<div class="card-face card-back" aria-hidden="true">' + card.icon + "</div>" +
        "</div>";

      cardEl.addEventListener("click", function () {
        handleCardClick(cardEl);
      });

      board.appendChild(cardEl);
    });
  }

  function resetSelection() {
    firstCard = null;
    secondCard = null;
    isBoardLocked = false;
  }

  function handleCardClick(cardEl) {
    if (!gameStarted || isBoardLocked) return;
    if (cardEl.classList.contains("flipped") || cardEl.classList.contains("matched")) return;

    cardEl.classList.add("flipped");

    if (!firstCard) {
      firstCard = cardEl;
      return;
    }

    if (cardEl === firstCard) return;

    secondCard = cardEl;
    isBoardLocked = true;
    moves += 1;
    updateMoves();

    var isMatch = firstCard.dataset.icon === secondCard.dataset.icon;

    if (isMatch) {
      firstCard.classList.add("matched");
      secondCard.classList.add("matched");
      matches += 1;
      updateMatches();
      resetSelection();
      checkForWin();
    } else {
      setTimeout(function () {
        if (firstCard) firstCard.classList.remove("flipped");
        if (secondCard) secondCard.classList.remove("flipped");
        resetSelection();
      }, 900);
    }
  }

  function checkForWin() {
    if (matches >= totalPairs) {
      gameStarted = false;
      stopTimer();
      showMessage(
        "Laimėjote! Žaidimą baigėte per " + moves + " ėjimus per " + formatTime(elapsedSeconds) + ".",
        "win"
      );
      updateBestScore();
    }
  }

  function loadBestScores() {
    try {
      var bestEasy = window.localStorage.getItem(LS_KEYS.easy);
      var bestHard = window.localStorage.getItem(LS_KEYS.hard);

      if (bestEasy && bestEasyEl) {
        var objE = JSON.parse(bestEasy);
        bestEasyEl.textContent = objE.moves + " ėjimai (" + formatTime(objE.time) + ")";
      }
      if (bestHard && bestHardEl) {
        var objH = JSON.parse(bestHard);
        bestHardEl.textContent = objH.moves + " ėjimai (" + formatTime(objH.time) + ")";
      }
    } catch (e) {
      // jei kas nors negerai su localStorage, tyliai ignoruojame
    }
  }

  function updateBestScore() {
    var key = LS_KEYS[currentDifficulty];
    var bestObj = null;

    try {
      var stored = window.localStorage.getItem(key);
      if (stored) {
        bestObj = JSON.parse(stored);
      }
    } catch (e) {
      bestObj = null;
    }

    var isBetter =
      !bestObj ||
      moves < bestObj.moves ||
      (moves === bestObj.moves && elapsedSeconds < bestObj.time);

    if (isBetter) {
      var newBest = {
        moves: moves,
        time: elapsedSeconds
      };
      try {
        window.localStorage.setItem(key, JSON.stringify(newBest));
      } catch (e) {
        // ignore
      }
    }

    // po atnaujinimo perskaitome visus, kad atsinaujintų ekrane
    loadBestScores();
  }

  function resetGameState() {
    firstCard = null;
    secondCard = null;
    isBoardLocked = false;
    moves = 0;
    matches = 0;
    gameStarted = false;
    elapsedSeconds = 0;
    stopTimer();
    updateMoves();
    updateMatches();
    updateTime();
    showMessage("Pasirinkite sudėtingumą ir spauskite „Start“, kad pradėtumėte.", "info");
  }

  function startNewGame() {
    var selected = document.querySelector("input[name='game-difficulty']:checked");
    currentDifficulty = selected ? selected.value : "easy";
    totalPairs = DIFFICULTIES[currentDifficulty].pairs;

    var deck = createDeck(totalPairs);
    var cols = DIFFICULTIES[currentDifficulty].cols;
    resetGameState();
    renderBoard(deck, cols);
  }

  if (difficultyInputs.length) {
    difficultyInputs.forEach(function (input) {
      input.addEventListener("change", function () {
        startNewGame();
      });
    });
  }

  if (startBtn) {
    startBtn.addEventListener("click", function () {
      if (!board.children.length) {
        startNewGame();
      }
      if (!gameStarted) {
        gameStarted = true;
        showMessage("Žaidimas pradėtas! Sėkmės!", "info");
        startTimer();
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      startNewGame();
    });
  }

  // inicializacija numatytam lygiui
  loadBestScores();
  startNewGame();
});
