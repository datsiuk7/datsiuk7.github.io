document.addEventListener("DOMContentLoaded", function () {
    var timeEl = document.getElementById("time");
    var scoreEl = document.getElementById("score");
    var livesEl = document.getElementById("lives");
    var cardColorEl = document.getElementById("card-color");
    var cardShapeEl = document.getElementById("card-shape");
    var btnNo = document.getElementById("btn-no");
    var btnYes = document.getElementById("btn-yes");
    var countdownEl = document.getElementById("countdown");
    var resultEl = document.getElementById("result");
    var correctEl = document.getElementById("correct");
    var totalEl = document.getElementById("total");
    var bestListEl = document.getElementById("best-list");
    var playAgainBtn = document.getElementById("play-again");
    var startScreenEl = document.getElementById("start-screen");
    var startBtn = document.getElementById("start-btn");
    var stopResumeBtn = document.getElementById("btn-stop-resume");

    var colors = [
        { name: "blue", value: "#3b82f6" },
        { name: "orange", value: "#f59e0b" },
        { name: "green", value: "#22c55e" },
        { name: "pink", value: "#ec4899" },
        { name: "purple", value: "#8b5cf6" },
        { name: "yellow", value: "#eab308" }
    ];

    var shapes = ["circle", "square", "triangle", "hexagon", "star"];
    var state = {
        time: 90,
        lives: 5,
        total: 0,
        correct: 0,
        answer: false,
        timerId: null,
        running: false
    };

    function pickRandom(list) {
        return list[Math.floor(Math.random() * list.length)];
    }

    function shapeSvg(shape, color) {
        if (shape === "circle") {
            return "<svg width=\"100\" height=\"100\" viewBox=\"0 0 100 100\"><circle cx=\"50\" cy=\"50\" r=\"32\" fill=\"" + color + "\"/></svg>";
        }
        if (shape === "square") {
            return "<svg width=\"100\" height=\"100\" viewBox=\"0 0 100 100\"><rect x=\"22\" y=\"22\" width=\"56\" height=\"56\" rx=\"6\" fill=\"" + color + "\"/></svg>";
        }
        if (shape === "triangle") {
            return "<svg width=\"100\" height=\"100\" viewBox=\"0 0 100 100\"><polygon points=\"50,16 86,84 14,84\" fill=\"" + color + "\"/></svg>";
        }
        if (shape === "hexagon") {
            return "<svg width=\"100\" height=\"100\" viewBox=\"0 0 100 100\"><polygon points=\"50,14 80,32 80,68 50,86 20,68 20,32\" fill=\"" + color + "\"/></svg>";
        }
        return "<svg width=\"100\" height=\"100\" viewBox=\"0 0 100 100\"><polygon points=\"50,12 61,38 90,38 66,56 75,84 50,66 25,84 34,56 10,38 39,38\" fill=\"" + color + "\"/></svg>";
    }

    function updateHeader() {
        timeEl.textContent = state.time;
        scoreEl.textContent = state.correct;
        livesEl.textContent = "❤️".repeat(state.lives);
    }

    function buildRound() {
        var showLeft = Math.random() < 0.5;
        var leftColor = pickRandom(colors);
        var leftShape = pickRandom(shapes);
        var rightColor = pickRandom(colors);
        var rightShape = pickRandom(shapes);

        cardColorEl.innerHTML = "";
        cardShapeEl.innerHTML = "";
        cardColorEl.classList.add("card--empty");
        cardShapeEl.classList.add("card--empty");

        if (showLeft) {
            cardColorEl.innerHTML = shapeSvg(leftShape, leftColor.value);
            cardColorEl.classList.remove("card--empty");
            state.answer = leftColor.name === "blue";
        } else {
            cardShapeEl.innerHTML = shapeSvg(rightShape, rightColor.value);
            cardShapeEl.classList.remove("card--empty");
            state.answer = rightShape === "square";
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

    var audioContext = null;

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

    var isPaused = false;

    stopResumeBtn.addEventListener("click", function () {
        if (isPaused) {
            stopResumeBtn.textContent = "Зупинити";
            state.running = true;
            startTimer();
            buildRound();
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

    function handleAnswer(value) {
        if (!state.running) {
            return;
        }
        state.total += 1;
        if (value === state.answer) {
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
        var stored = JSON.parse(localStorage.getItem("geoSwitchingResults") || "[]");
        stored.push(entry);
        localStorage.setItem("geoSwitchingResults", JSON.stringify(stored));
        return stored;
    }

    function renderBest(list) {
        var sorted = list.slice().sort(function (a, b) {
            return b.correct - a.correct;
        }).slice(0, 5);
        bestListEl.innerHTML = "";
        if (sorted.length === 0) {
            bestListEl.innerHTML = "<li>No results yet</li>";
            return;
        }
        sorted.forEach(function (item, index) {
            var li = document.createElement("li");
            li.innerHTML = "<span>" + (index + 1) + ". " + item.correct + " / " + item.total + "</span><span>" + item.date + "</span>";
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

    function resetGame() {
        state.time = 90;
        state.lives = 5;
        state.total = 0;
        state.correct = 0;
        state.answer = false;
        updateHeader();
        resultEl.classList.remove("visible");
        showCountdown();
    }

    btnNo.addEventListener("click", function () {
        handleAnswer(false);
    });
    btnYes.addEventListener("click", function () {
        handleAnswer(true);
    });
    playAgainBtn.addEventListener("click", function () {
        resetGame();
    });

    updateHeader();
});
