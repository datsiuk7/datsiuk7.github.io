document.addEventListener("DOMContentLoaded", function () {
    var timeEl = document.getElementById("time");
    var scoreEl = document.getElementById("score");
    var livesEl = document.getElementById("lives");
    var stopResumeBtn = document.getElementById("btn-stop-resume");

    var wordEl = document.getElementById("word");
    var btnLeft = document.getElementById("btn-left");
    var btnRight = document.getElementById("btn-right");

    var startScreenEl = document.getElementById("start-screen");
    var startBtn = document.getElementById("start-btn");
    var countdownEl = document.getElementById("countdown");

    var resultEl = document.getElementById("result");
    var correctEl = document.getElementById("correct");
    var totalEl = document.getElementById("total");
    var bestListEl = document.getElementById("best-list");
    var playAgainBtn = document.getElementById("play-again");

    var colors = [
        { name: "Червоний", value: "#ef4444" },
        { name: "Чорний", value: "#111827" },
        { name: "Зелений", value: "#22c55e" },
        { name: "Синій", value: "#3b82f6" },
        { name: "Жовтий", value: "#eab308" },
        { name: "Фіолетовий", value: "#8b5cf6" },
        { name: "Рожевий", value: "#ec4899" },

        // { name: "Помаранчевий", value: "#f59e0b" },
        // { name: "Бірюзовий", value: "#14b8a6" },
        // { name: "Голубий", value: "#06b6d4" },
        // { name: "Лаймовий", value: "#84cc16" },
        // { name: "Індиго", value: "#6366f1" },
        // { name: "Коричневий", value: "#a16207" },
        // { name: "Сірий", value: "#6b7280" },
        // { name: "Білий", value: "#ffffff" },
        // { name: "Бордовий", value: "#991b1b" },
        // { name: "Оливковий", value: "#4d7c0f" },
        // { name: "Пісочний", value: "#d6b56c" },
        // { name: "М'ятний", value: "#34d399" },
        // { name: "Малиновий", value: "#e11d48" }
    ];

    var state = {
        time: 90,
        lives: 5,
        total: 0,
        correct: 0,
        // correct answer is ink color name (what you see)
        answerInkName: "",
        // shown word meaning (distractor)
        wordName: "",
        timerId: null,
        running: false
    };

    var audioContext = null;

    function pickRandom(list) {
        return list[Math.floor(Math.random() * list.length)];
    }

    function initAudio() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioContext.state === "suspended") {
            audioContext.resume();
        }
    }

    function playBeep() {
        if (!audioContext) {
            return;
        }
        var oscillator = audioContext.createOscillator();
        var gainNode = audioContext.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = 880;
        gainNode.gain.value = 0.15;
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.12);
    }

    function updateHeader() {
        timeEl.textContent = state.time;
        scoreEl.textContent = state.correct;
        livesEl.textContent = "❤️".repeat(state.lives);
    }

    function buildRound() {
        var wordColor = pickRandom(colors);
        var inkColor = pickRandom(colors);
        while (inkColor.name === wordColor.name) {
            inkColor = pickRandom(colors);
        }

        state.wordName = wordColor.name;
        state.answerInkName = inkColor.name;

        wordEl.textContent = wordColor.name;
        wordEl.style.color = inkColor.value;

        // Two buttons: one is the text (word) name, the other is ink color name.
        // Shuffle sides.
        var leftIsInk = Math.random() < 0.5;
        if (leftIsInk) {
            btnLeft.textContent = inkColor.name;
            btnRight.textContent = wordColor.name;
            btnLeft.dataset.kind = "ink";
            btnRight.dataset.kind = "word";
        } else {
            btnLeft.textContent = wordColor.name;
            btnRight.textContent = inkColor.name;
            btnLeft.dataset.kind = "word";
            btnRight.dataset.kind = "ink";
        }

        // Ensure readable when ink is white
        if (inkColor.value.toLowerCase() === "#ffffff") {
            wordEl.style.textShadow = "0 2px 0 rgba(17, 24, 39, 0.25)";
        } else {
            wordEl.style.textShadow = "none";
        }
    }

    function tick() {
        if (!state.running) {
            return;
        }
        state.time -= 1;
        updateHeader();
        if (state.time <= 0) {
            endGame();
        }
    }

    function startTimer() {
        clearInterval(state.timerId);
        state.timerId = setInterval(tick, 1000);
    }

    function showCountdown() {
        var count = 3;
        countdownEl.textContent = count;
        countdownEl.classList.remove("hidden");

        var countdownId = setInterval(function () {
            playBeep();
            count -= 1;
            if (count > 0) {
                countdownEl.textContent = count;
                return;
            }
            clearInterval(countdownId);
            countdownEl.classList.add("hidden");
            state.running = true;
            startTimer();
            buildRound();
        }, 1000);
    }

    function handleChoice(kind) {
        if (!state.running) {
            return;
        }

        state.total += 1;

        // Correct answer: ink color.
        if (kind === "ink") {
            state.correct += 1;
        } else {
            state.lives -= 1;
        }

        updateHeader();

        if (state.lives <= 0) {
            endGame();
            return;
        }

        buildRound();
    }

    function saveResult() {
        var entry = {
            correct: state.correct,
            total: state.total,
            date: new Date().toISOString().slice(0, 10)
        };
        var stored = JSON.parse(localStorage.getItem("stroopResults") || "[]");
        stored.push(entry);
        localStorage.setItem("stroopResults", JSON.stringify(stored));
        return stored;
    }

    function renderBest(list) {
        var sorted = list
            .slice()
            .sort(function (a, b) {
                return b.correct - a.correct;
            })
            .slice(0, 5);

        bestListEl.innerHTML = "";
        if (sorted.length === 0) {
            bestListEl.innerHTML = "<li>Результатів ще немає</li>";
            return;
        }

        sorted.forEach(function (item, index) {
            var li = document.createElement("li");
            li.innerHTML =
                "<span>" +
                (index + 1) +
                ". " +
                item.correct +
                " / " +
                item.total +
                "</span><span>" +
                item.date +
                "</span>";
            bestListEl.appendChild(li);
        });
    }

    function endGame() {
        state.running = false;
        clearInterval(state.timerId);
        correctEl.textContent = state.correct;
        totalEl.textContent = state.total;
        var results = saveResult();
        renderBest(results);
        resultEl.classList.add("visible");
    }

    function resetGame(toStartScreen) {
        clearInterval(state.timerId);
        state.time = 90;
        state.lives = 5;
        state.total = 0;
        state.correct = 0;
        state.answerInkName = "";
        state.wordName = "";
        state.running = false;
        updateHeader();
        resultEl.classList.remove("visible");

        stopResumeBtn.textContent = "Зупинити";
        isPaused = false;

        if (toStartScreen) {
            startScreenEl.style.display = "flex";
            stopResumeBtn.style.display = "none";
            countdownEl.classList.add("hidden");
        } else {
            showCountdown();
        }
    }

    var isPaused = false;

    stopResumeBtn.addEventListener("click", function () {
        if (!state.running && !isPaused) {
            return;
        }

        if (isPaused) {
            stopResumeBtn.textContent = "Зупинити";
            state.running = true;
            startTimer();
        } else {
            stopResumeBtn.textContent = "Продовжити";
            state.running = false;
            clearInterval(state.timerId);
        }

        isPaused = !isPaused;
    });

    startBtn.addEventListener("click", function () {
        initAudio();
        startScreenEl.style.display = "none";
        stopResumeBtn.style.display = "inline-flex";
        showCountdown();
    });

    btnLeft.addEventListener("click", function () {
        handleChoice(btnLeft.dataset.kind);
    });

    btnRight.addEventListener("click", function () {
        handleChoice(btnRight.dataset.kind);
    });

    playAgainBtn.addEventListener("click", function () {
        resetGame(true);
    });

    updateHeader();
});
