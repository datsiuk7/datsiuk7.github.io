document.addEventListener("DOMContentLoaded", function () {
    var timeEl = document.getElementById("time");
    var levelEl = document.getElementById("level");
    var sublevelEl = document.getElementById("sublevel");
    var progressEl = document.getElementById("progress");
    var livesEl = document.getElementById("lives");
    var levelHintEl = document.getElementById("level-hint");
    var levelButtons = Array.prototype.slice.call(
        document.querySelectorAll(".level-btn")
    );
    var stopResumeBtn = document.getElementById("btn-stop-resume");
    var exitBtn = document.getElementById("btn-exit");

    var gridEl = document.getElementById("grid");
    var taskEl = document.getElementById("task");
    var startScreenEl = document.getElementById("start-screen");
    var countdownEl = document.getElementById("countdown");

    var resultEl = document.getElementById("result");
    var correctEl = document.getElementById("correct");
    var totalEl = document.getElementById("total");
    var finalTimeEl = document.getElementById("final-time");
    var resultSubEl = document.getElementById("result-sub");
    var bestLevelEl = document.getElementById("best-level");
    var bestListEl = document.getElementById("best-list");
    var playAgainBtn = document.getElementById("play-again");

    var state = {
        level: 1,
        time: 90,
        timerId: null,
        running: false,
        sequenceIndex: 0,
        maxNumber: 4,
        totalSteps: 0,
        totalStepsLevel: 0,
        completedStepsLevel: 0,
        sublevelIndex: 0,
        sublevels: [],
        lives: 3,
        maxLives: 3,
        remaining: [],
        currentTask: null
    };

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

    function levelToTime() {
        return 90;
    }

    function getSublevels(level) {
        var base = [
            { rows: 2, cols: 2 },
            { rows: 2, cols: 2 },
            { rows: 3, cols: 2 },
            { rows: 3, cols: 3 },
            { rows: 3, cols: 3 }
        ];
        var add = Math.round(((level - 1) * 2) / 9);
        return base.map(function (size) {
            return {
                rows: Math.min(5, size.rows + add),
                cols: Math.min(5, size.cols + add)
            };
        });
    }

    function updateHeader() {
        timeEl.textContent = state.time;
        levelEl.textContent = state.level;
        sublevelEl.textContent = state.sublevelIndex + 1;
        progressEl.textContent = state.sequenceIndex;
        livesEl.textContent = "❤️".repeat(state.lives);
    }

    function updateLevelHint() {
        var timeLimit = levelToTime(state.level);
        levelHintEl.textContent = "Час: " + timeLimit + "с";
    }

    function buildGrid(rows, cols) {
        var totalCells = rows * cols;
        var blackCount = Math.ceil(totalCells / 2);
        var redCount = Math.floor(totalCells / 2);
        var blackNumbers = [];
        var redNumbers = [];
        for (var i = 1; i <= blackCount; i += 1) {
            blackNumbers.push(i);
        }
        for (var j = 1; j <= redCount; j += 1) {
            redNumbers.push(j);
        }
        var cells = [];
        blackNumbers.forEach(function (num) {
            cells.push({ color: "black", value: num });
        });
        redNumbers.forEach(function (num) {
            cells.push({ color: "red", value: num });
        });

        for (var i = cells.length - 1; i > 0; i -= 1) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = cells[i];
            cells[i] = cells[j];
            cells[j] = temp;
        }

        gridEl.innerHTML = "";

        gridEl.style.setProperty("--grid-cols", cols);

        var rendered = [];

        cells.forEach(function (cellData) {
            var cell = document.createElement("button");
            cell.type = "button";
            cell.className = "cell " + cellData.color;
            cell.textContent = cellData.value;
            cell.dataset.color = cellData.color;
            cell.dataset.value = cellData.value;
            cellData.element = cell;
            cell.addEventListener("click", function () {
                handleCellClick(cell, cellData);
            });
            gridEl.appendChild(cell);
            rendered.push(cellData);
        });

        return rendered;
    }

    function getExtremes(color) {
        var values = state.remaining
            .filter(function (item) {
                return item.color === color;
            })
            .map(function (item) {
                return item.value;
            });

        if (values.length === 0) {
            return null;
        }

        return {
            min: Math.min.apply(null, values),
            max: Math.max.apply(null, values)
        };
    }

    function pickTask() {
        var options = [];
        var black = getExtremes("black");
        var red = getExtremes("red");

        if (black) {
            options.push({ color: "black", type: "min", value: black.min });
            options.push({ color: "black", type: "max", value: black.max });
        }
        if (red) {
            options.push({ color: "red", type: "min", value: red.min });
            options.push({ color: "red", type: "max", value: red.max });
        }

        var task = options[Math.floor(Math.random() * options.length)];
        state.currentTask = task;
        taskEl.classList.remove("task-black", "task-red");
        taskEl.classList.add(task.color === "black" ? "task-black" : "task-red");
        taskEl.textContent =
            "Оберіть " +
            (task.type === "min" ? "найменше " : "найбільше ") +
            (task.color === "black" ? "чорне" : "червоне") +
            " число";
    }

    function handleCellClick(cell, cellData) {
        if (!state.running) {
            return;
        }

        if (cell.classList.contains("correct")) {
            return;
        }

        var task = state.currentTask;
        var isCorrect =
            cellData.color === task.color &&
            Number(cellData.value) === Number(task.value);

        if (isCorrect) {
            cell.classList.add("correct");
            cell.disabled = true;
            state.remaining = state.remaining.filter(function (item) {
                return item !== cellData;
            });
            state.sequenceIndex += 1;
            state.completedStepsLevel += 1;
            updateHeader();
            if (state.remaining.length === 0) {
                advanceSublevel();
                return;
            }
            pickTask();
            return;
        }

        cell.classList.add("wrong");
        state.lives -= 1;
        updateHeader();
        if (state.lives <= 0) {
            endGame(false, "Раунд незавершено: закінчились життя");
            return;
        }
        setTimeout(function () {
            cell.classList.remove("wrong");
        }, 300);
        pickTask();
    }

    function tick() {
        if (!state.running) {
            return;
        }
        state.time -= 1;
        updateHeader();
        if (state.time <= 0) {
            endGame(false, "Раунд незавершено: час вичерпано");
        }
    }

    function startTimer() {
        clearInterval(state.timerId);
        state.timerId = setInterval(tick, 1000);
    }

    function startSublevel() {
        var size = state.sublevels[state.sublevelIndex];
        state.sequenceIndex = 0;
        state.remaining = buildGrid(size.rows, size.cols);
        state.totalSteps = state.remaining.length;
        totalEl.textContent = state.totalSteps;
        pickTask();
        updateHeader();
    }

    function advanceSublevel() {
        if (state.sublevelIndex < state.sublevels.length - 1) {
            state.sublevelIndex += 1;
            startSublevel();
            return;
        }
        endGame(true, "Раунд завершено");
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
        }, 1000);
    }

    function startGame() {
        state.sublevels = getSublevels(state.level);
        state.sublevelIndex = 0;
        state.sequenceIndex = 0;
        state.time = levelToTime(state.level);
        state.lives = state.maxLives;
        state.completedStepsLevel = 0;
        state.totalStepsLevel = state.sublevels.reduce(function (sum, size) {
            return sum + size.rows * size.cols;
        }, 0);
        startSublevel();
        updateHeader();
        stopResumeBtn.textContent = "Зупинити";
        stopResumeBtn.style.display = "inline-flex";
        resultEl.classList.remove("visible");
        startScreenEl.classList.add("hidden");
        showCountdown();
    }

    function endGame(isWin, message) {
        state.running = false;
        clearInterval(state.timerId);
        stopResumeBtn.textContent = "Продовжити";
        var timeSpent = Math.max(0, levelToTime(state.level) - state.time);
        correctEl.textContent = state.sequenceIndex;
        finalTimeEl.textContent = timeSpent;
        bestLevelEl.textContent = state.level;
        resultSubEl.textContent = message || (isWin ? "Раунд завершено" : "Раунд незавершено");
        saveResult(isWin, timeSpent);
        renderBest();
        resultEl.classList.add("visible");
    }

    function saveResult(isWin, timeSpent) {
        var key = "clickerBlackRedResults";
        var stored = JSON.parse(localStorage.getItem(key) || "{}");
        if (!stored[state.level]) {
            stored[state.level] = [];
        }
        stored[state.level].push({
            steps: state.completedStepsLevel,
            total: state.totalStepsLevel,
            time: timeSpent,
            win: isWin,
            date: new Date().toISOString().slice(0, 10)
        });
        localStorage.setItem(key, JSON.stringify(stored));
    }

    function renderBest() {
        var key = "clickerBlackRedResults";
        var stored = JSON.parse(localStorage.getItem(key) || "{}");
        var list = stored[state.level] || [];
        var sorted = list
            .slice()
            .sort(function (a, b) {
                if (b.steps !== a.steps) {
                    return b.steps - a.steps;
                }
                return a.time - b.time;
            })
            .slice(0, 5);

        bestListEl.innerHTML = "";
        if (sorted.length === 0) {
            bestListEl.innerHTML = "<li>Результатів ще немає</li>";
            return;
        }

        sorted.forEach(function (item, index) {
            var li = document.createElement("li");
            var status = item.win ? "✔" : "✖";
            li.innerHTML =
                "<span>" +
                (index + 1) +
                ". " +
                item.steps +
                "/" +
                item.total +
                " " +
                status +
                "</span><span>" +
                item.time +
                "с</span>";
            bestListEl.appendChild(li);
        });
    }

    function togglePause() {
        if (!state.running && state.time > 0 && !resultEl.classList.contains("visible")) {
            state.running = true;
            startTimer();
            stopResumeBtn.textContent = "Зупинити";
            return;
        }
        if (state.running) {
            state.running = false;
            clearInterval(state.timerId);
            stopResumeBtn.textContent = "Продовжити";
        }
    }

    levelButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            state.level = Number(button.dataset.level);
            updateLevelHint();
            updateHeader();
            initAudio();
            startGame();
        });
    });

    playAgainBtn.addEventListener("click", function () {
        resultEl.classList.remove("visible");
        startScreenEl.classList.remove("hidden");
    });

    exitBtn.addEventListener("click", function () {
        state.running = false;
        clearInterval(state.timerId);
        resultEl.classList.remove("visible");
        startScreenEl.classList.remove("hidden");
        stopResumeBtn.textContent = "Зупинити";
    });

    stopResumeBtn.addEventListener("click", function () {
        togglePause();
    });

    updateLevelHint();
    updateHeader();
    state.sublevels = getSublevels(state.level);
    state.sublevelIndex = 0;
    state.remaining = buildGrid(state.sublevels[0].rows, state.sublevels[0].cols);
    state.totalSteps = state.remaining.length;
    totalEl.textContent = state.totalSteps;
    pickTask();
    renderBest();
});
