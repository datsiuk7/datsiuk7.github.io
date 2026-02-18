document.addEventListener("DOMContentLoaded", function () {
    var timeEl = document.getElementById("time");
    var scoreEl = document.getElementById("score");
    var livesEl = document.getElementById("lives");
    var stopResumeBtn = document.getElementById("btn-stop-resume");

    var arenaEl = document.getElementById("arena");
    var planeEl = document.getElementById("plane");
    var btnUp = document.getElementById("btn-up");
    var btnDown = document.getElementById("btn-down");
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

    var planeSvg =
        "<svg viewBox=\"0 0 200 200\" aria-hidden=\"true\" focusable=\"false\">" +
        "<circle cx=\"99.834\" cy=\"99.833\" r=\"99.833\" style=\"fill: var(--arena-color, #3b82f6);\"></circle>" +
        "<path fill=\"#ffffff\" d=\"M75.544 144.56c-1.567.67-2.533 1.59-2.52 2.59.014 1.038 1.086 1.955 2.778 2.588-.25-.958-.392-1.993-.407-3.062-.007-.735.048-1.44.15-2.117zM80.913 139.277c-1.893.028-3.477 2.03-4.066 4.82-.17.8-.262 1.663-.248 2.564.015 1.27.23 2.457.585 3.493.39 1.137.95 2.094 1.632 2.755.677.66 1.462 1.028 2.297 1.017l11.388-.238-9.686-14.344-1.903-.066zM96.612 113.27c-8.613.805-18.314 1.633-28.184 1.89l43.056 63.79 16.417-.215-26.935-65.86-4.353.395zM74.372 56.5c-.12-.68-.188-1.387-.198-2.11-.015-1.064.097-2.104.323-3.073-1.678.678-2.725 1.627-2.713 2.663.013 1 1.003 1.89 2.588 2.52zM75.374 54.372c.01.903.127 1.76.318 2.556.37 1.554 1.042 2.857 1.904 3.696.668.65 1.454 1.025 2.288 1.012l1.868-.07 9.38-14.725-11.445.152c-1.675.018-3.108 1.584-3.828 3.87-.327 1.046-.505 2.243-.486 3.51zM96.263 86.792l4.248.274 25.292-66.118-16.417.217-40.845 64.49c9.744.012 19.257.574 27.723 1.137zM96.158 88.387c-12.306-.815-24.62-1.46-36.906-.964-6.15.233-12.28.713-18.425 1.352-1.54.162-19.48 1.01-19.33 12.253.032 2.428 1.062 4.364 2.633 5.895 5.082 4.947 15.844 5.752 17.02 5.844 6.152.484 12.303.795 18.452.858 12.303.178 24.585-.8 36.86-1.942 12.285-1.142 24.574-2.1 36.84-4.08 3.822-.592 7.636-1.26 11.45-2L162.4 124.42l10.502-3.507-1.677-2.73-2.626 1.27c-.27.13-.595.043-.762-.21l-8.86-13.397c-.103-.155-.126-.348-.067-.523s.198-.315.373-.374l3.157-1.078-1.253-2.04c.026-.005.053-.013.078-.02-1.16.104-2.372.175-3.615.19-6.288.08-13.717-.477-15.17-1.894-.26-.252-.32-.505-.32-.674-.038-2.736 14.783-2.975 15.416-2.983 1.27-.017 2.51.025 3.696.102l-.193-.046 1.098-1.9-3.04-.94c-.177-.056-.317-.19-.383-.364-.065-.174-.046-.37.052-.527l8.5-13.635c.157-.255.48-.35.754-.23l2.53 1.142 1.73-3-10.595-3.232-17.198 19.35c-3.813-.63-7.624-1.19-11.438-1.684-12.324-1.648-24.626-2.28-36.932-3.1zM31.24 94.473c.288-.704.957-.956 1.485-.564l1.333.98c.36.263.562.754.573 1.258.003.25-.038.49-.135.718-.095.23-.18.45-.26.665l-4.028.054c.233-.976.57-1.996 1.034-3.11zm-1.413 6.406c-.014-.824.06-1.646.213-2.495l3.916-.05c-.574 1.82-.555 3.18.07 4.98l-3.918.052c-.177-.847-.27-1.665-.28-2.488zm4.393 5.874l-1.31 1.017c-.522.41-1.19.177-1.498-.523-.493-1.107-.856-2.117-1.114-3.082l4.027-.053c.086.21.176.425.277.65.305.696.137 1.588-.382 1.992zM160.403 105.83l8.147 12.315 2.045-.99-7.514-12.24zM160.234 92.747l2.56.792 7.192-12.447-1.94-.877zM143.073 99.42c.007.006.018.02.037.04.908.884 6.59 1.74 14.528 1.636 3.98-.053 7.603-.648 10.274-1.244.724-.233 1.444-.474 2.168-.723v-.156c-.67-.213-1.34-.413-2.013-.61-2.7-.538-6.415-1.063-10.48-1.012-9.077.127-14.15 1.382-14.514 2.07z\"></path>" +
        "</svg>";

    var state = {
        time: 90,
        lives: 5,
        total: 0,
        correct: 0,
        // ruleColor: "blue" means same direction, "red" means opposite
        ruleColor: "blue",
        planeDir: "up",
        expectedDir: "up",
        timerId: null,
        running: false
    };

    var audioContext = null;

    function pickRandom(list) {
        return list[Math.floor(Math.random() * list.length)];
    }

    function oppositeDir(dir) {
        if (dir === "up") {
            return "down";
        }
        if (dir === "down") {
            return "up";
        }
        if (dir === "left") {
            return "right";
        }
        return "left";
    }

    function dirToRotation(dir) {
        if (dir === "up") {
            return "90deg";
        }
        if (dir === "right") {
            return "180deg";
        }
        if (dir === "down") {
            return "270deg";
        }
        return "0deg";
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
        var dirs = ["up", "down", "left", "right"];
        state.planeDir = pickRandom(dirs);
        state.ruleColor = Math.random() < 0.5 ? "blue" : "red";

        if (state.ruleColor === "blue") {
            state.expectedDir = state.planeDir;
            arenaEl.style.setProperty("--arena-color", "#3b82f6");
        } else {
            state.expectedDir = oppositeDir(state.planeDir);
            arenaEl.style.setProperty("--arena-color", "#ef4444");
        }

        if (!planeEl.innerHTML) {
            planeEl.innerHTML = planeSvg;
        }
        planeEl.style.setProperty("--plane-rot", dirToRotation(state.planeDir));
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
        GameAnalytics.send("game_start", { time: state.time, lives: state.lives });
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

    function handleAnswer(dir) {
        if (!state.running) {
            return;
        }

        state.total += 1;

        if (dir === state.expectedDir) {
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
            player: GameAnalytics.getPlayerName(),
            date: new Date().toISOString().slice(0, 10)
        };
        var stored = JSON.parse(localStorage.getItem("airportResults") || "[]");
        stored.push(entry);
        localStorage.setItem("airportResults", JSON.stringify(stored));
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
                (item.player || "—") +
                " — " +
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
        GameAnalytics.send("game_end", { correct: state.correct, total: state.total });
    }

    function resetGame(toStartScreen) {
        clearInterval(state.timerId);
        state.time = 90;
        state.lives = 5;
        state.total = 0;
        state.correct = 0;
        state.ruleColor = "blue";
        state.planeDir = "up";
        state.expectedDir = "up";
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
        GameAnalytics.ensurePlayerName();
        initAudio();
        startScreenEl.style.display = "none";
        stopResumeBtn.style.display = "inline-flex";
        showCountdown();
    });

    function bindArrow(btn, dir) {
        btn.addEventListener("click", function () {
            handleAnswer(dir);
        });
    }

    bindArrow(btnUp, "up");
    bindArrow(btnDown, "down");
    bindArrow(btnLeft, "left");
    bindArrow(btnRight, "right");

    document.addEventListener("keydown", function (e) {
        if (!state.running) {
            return;
        }

        var dir = null;
        if (e.key === "ArrowUp") {
            dir = "up";
        } else if (e.key === "ArrowDown") {
            dir = "down";
        } else if (e.key === "ArrowLeft") {
            dir = "left";
        } else if (e.key === "ArrowRight") {
            dir = "right";
        }

        if (!dir) {
            return;
        }

        e.preventDefault();
        handleAnswer(dir);
    });

    playAgainBtn.addEventListener("click", function () {
        resetGame(true);
    });

    updateHeader();
});
