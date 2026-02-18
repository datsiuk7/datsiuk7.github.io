document.addEventListener("DOMContentLoaded", function () {
    var levelEl = document.getElementById("level");
    var sublevelEl = document.getElementById("sublevel");
    var progressEl = document.getElementById("progress");
    var totalEl = document.getElementById("total");
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
    var totalResultEl = document.getElementById("total-result");
    var resultSubEl = document.getElementById("result-sub");
    var bestLevelEl = document.getElementById("best-level");
    var bestListEl = document.getElementById("best-list");
    var playAgainBtn = document.getElementById("play-again");

    var state = {
        level: 1,
        running: false,
        phase: "idle", // idle | memorize | click
        nextExpected: 1,
        numberedCount: 0,
        completedStepsLevel: 0,
        totalStepsLevel: 0,
        sublevelIndex: 0,
        sublevels: [],
        lives: 3,
        maxLives: 3,
        memorizeTimer: null,
        cells: []
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
        if (!audioContext) return;
        var osc = audioContext.createOscillator();
        var gain = audioContext.createGain();
        osc.type = "sine";
        osc.frequency.value = 880;
        gain.gain.value = 0.15;
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.start();
        osc.stop(audioContext.currentTime + 0.12);
    }

    function playCorrect() {
        if (!audioContext) return;
        var osc = audioContext.createOscillator();
        var gain = audioContext.createGain();
        osc.type = "sine";
        osc.frequency.value = 660;
        gain.gain.value = 0.12;
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.start();
        osc.stop(audioContext.currentTime + 0.1);
    }

    function playWrong() {
        if (!audioContext) return;
        var osc = audioContext.createOscillator();
        var gain = audioContext.createGain();
        osc.type = "square";
        osc.frequency.value = 220;
        gain.gain.value = 0.12;
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.start();
        osc.stop(audioContext.currentTime + 0.2);
    }

    /* ─── Level config ─── */

    // Returns array of 5 sub-levels, each { rows, cols, numbered, memorizeTime }
    function getSublevels(level) {
        var configs = {
            1:  [
                { rows: 2, cols: 2, numbered: 2, memorizeTime: 3000 },
                { rows: 2, cols: 2, numbered: 3, memorizeTime: 3000 },
                { rows: 2, cols: 3, numbered: 3, memorizeTime: 3000 },
                { rows: 2, cols: 3, numbered: 4, memorizeTime: 2800 },
                { rows: 3, cols: 3, numbered: 4, memorizeTime: 2800 }
            ],
            2:  [
                { rows: 3, cols: 3, numbered: 4, memorizeTime: 2800 },
                { rows: 3, cols: 3, numbered: 5, memorizeTime: 2800 },
                { rows: 3, cols: 4, numbered: 5, memorizeTime: 2600 },
                { rows: 3, cols: 4, numbered: 6, memorizeTime: 2600 },
                { rows: 3, cols: 4, numbered: 6, memorizeTime: 2400 }
            ],
            3:  [
                { rows: 3, cols: 4, numbered: 5, memorizeTime: 2600 },
                { rows: 3, cols: 4, numbered: 6, memorizeTime: 2400 },
                { rows: 4, cols: 4, numbered: 6, memorizeTime: 2400 },
                { rows: 4, cols: 4, numbered: 7, memorizeTime: 2200 },
                { rows: 4, cols: 4, numbered: 8, memorizeTime: 2200 }
            ],
            4:  [
                { rows: 4, cols: 4, numbered: 6, memorizeTime: 2400 },
                { rows: 4, cols: 4, numbered: 7, memorizeTime: 2200 },
                { rows: 4, cols: 5, numbered: 7, memorizeTime: 2200 },
                { rows: 4, cols: 5, numbered: 8, memorizeTime: 2000 },
                { rows: 4, cols: 5, numbered: 9, memorizeTime: 2000 }
            ],
            5:  [
                { rows: 4, cols: 5, numbered: 7, memorizeTime: 2200 },
                { rows: 4, cols: 5, numbered: 8, memorizeTime: 2000 },
                { rows: 5, cols: 5, numbered: 9, memorizeTime: 2000 },
                { rows: 5, cols: 5, numbered: 9, memorizeTime: 1800 },
                { rows: 5, cols: 5, numbered: 10, memorizeTime: 1800 }
            ],
            6:  [
                { rows: 5, cols: 5, numbered: 8, memorizeTime: 2000 },
                { rows: 5, cols: 5, numbered: 9, memorizeTime: 1800 },
                { rows: 5, cols: 6, numbered: 10, memorizeTime: 1800 },
                { rows: 5, cols: 6, numbered: 11, memorizeTime: 1600 },
                { rows: 5, cols: 6, numbered: 12, memorizeTime: 1600 }
            ],
            7:  [
                { rows: 5, cols: 6, numbered: 9, memorizeTime: 1800 },
                { rows: 5, cols: 6, numbered: 10, memorizeTime: 1600 },
                { rows: 6, cols: 6, numbered: 11, memorizeTime: 1600 },
                { rows: 6, cols: 6, numbered: 12, memorizeTime: 1400 },
                { rows: 6, cols: 6, numbered: 13, memorizeTime: 1400 }
            ],
            8:  [
                { rows: 6, cols: 6, numbered: 10, memorizeTime: 1600 },
                { rows: 6, cols: 6, numbered: 11, memorizeTime: 1400 },
                { rows: 6, cols: 6, numbered: 12, memorizeTime: 1400 },
                { rows: 6, cols: 7, numbered: 13, memorizeTime: 1200 },
                { rows: 6, cols: 7, numbered: 14, memorizeTime: 1200 }
            ],
            9:  [
                { rows: 6, cols: 6, numbered: 11, memorizeTime: 1400 },
                { rows: 6, cols: 7, numbered: 12, memorizeTime: 1200 },
                { rows: 6, cols: 7, numbered: 13, memorizeTime: 1200 },
                { rows: 6, cols: 7, numbered: 14, memorizeTime: 1000 },
                { rows: 7, cols: 7, numbered: 15, memorizeTime: 1000 }
            ],
            10: [
                { rows: 6, cols: 7, numbered: 12, memorizeTime: 1200 },
                { rows: 6, cols: 7, numbered: 14, memorizeTime: 1000 },
                { rows: 7, cols: 7, numbered: 15, memorizeTime: 1000 },
                { rows: 7, cols: 7, numbered: 16, memorizeTime: 900 },
                { rows: 7, cols: 7, numbered: 18, memorizeTime: 800 }
            ]
        };
        return configs[level] || configs[1];
    }

    /* ─── UI helpers ─── */

    function updateHeader() {
        levelEl.textContent = state.level;
        sublevelEl.textContent = state.sublevelIndex + 1;
        progressEl.textContent = state.nextExpected - 1;
        totalEl.textContent = state.numberedCount;
        livesEl.textContent = "❤️".repeat(state.lives);
    }

    /* ─── Grid ─── */

    function shuffle(arr) {
        for (var i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = arr[i];
            arr[i] = arr[j];
            arr[j] = tmp;
        }
        return arr;
    }

    function buildGrid(config) {
        var totalCells = config.rows * config.cols;
        var numCount = Math.min(config.numbered, totalCells);

        // Pick random positions for numbered cells
        var indices = [];
        for (var i = 0; i < totalCells; i++) indices.push(i);
        shuffle(indices);
        var numberedSet = {};
        for (var k = 0; k < numCount; k++) {
            numberedSet[indices[k]] = k + 1; // value 1..numCount
        }

        gridEl.innerHTML = "";
        gridEl.style.setProperty("--grid-cols", config.cols);

        var cells = [];
        for (var c = 0; c < totalCells; c++) {
            var cell = document.createElement("button");
            cell.type = "button";
            var isNumbered = numberedSet.hasOwnProperty(c);
            var value = isNumbered ? numberedSet[c] : 0;

            cell.className = "cell" + (isNumbered ? " numbered" : " empty");
            cell.textContent = isNumbered ? value : "";
            cell.dataset.value = value;
            cell.dataset.index = c;

            (function (cellEl, val, numbered) {
                cellEl.addEventListener("click", function () {
                    handleCellClick(cellEl, val, numbered);
                });
            })(cell, value, isNumbered);

            gridEl.appendChild(cell);
            cells.push({ element: cell, value: value, isNumbered: isNumbered });
        }

        state.cells = cells;
        state.numberedCount = numCount;
        state.nextExpected = 1;
        return cells;
    }

    /* ─── Memorize → Hide ─── */

    function startMemorizePhase(config) {
        state.phase = "memorize";
        taskEl.textContent = "Запам'ятайте числа";
        taskEl.className = "task-line task-memorize";

        // Show numbers
        state.cells.forEach(function (c) {
            if (c.isNumbered) {
                c.element.className = "cell numbered";
                c.element.textContent = c.value;
            }
        });

        state.memorizeTimer = setTimeout(function () {
            if (!state.running) return;
            hideNumbers();
        }, config.memorizeTime);
    }

    function hideNumbers() {
        state.phase = "click";
        taskEl.textContent = "Натискайте за зростанням: " + state.nextExpected;
        taskEl.className = "task-line task-click";

        state.cells.forEach(function (c) {
            c.element.className = "cell blank";
            c.element.textContent = "";
        });
    }

    /* ─── Click handler ─── */

    function handleCellClick(cellEl, value, isNumbered) {
        if (!state.running || state.phase !== "click") return;
        if (cellEl.classList.contains("correct")) return;

        // Clicked an empty cell
        if (!isNumbered) {
            cellEl.classList.add("wrong");
            playWrong();
            state.lives -= 1;
            updateHeader();
            if (state.lives <= 0) {
                revealRemaining();
                endGame(false, "Раунд незавершено: закінчились життя");
                return;
            }
            setTimeout(function () {
                cellEl.classList.remove("wrong");
            }, 400);
            return;
        }

        // Correct number
        if (value === state.nextExpected) {
            cellEl.className = "cell correct";
            cellEl.textContent = value;
            playCorrect();
            state.nextExpected += 1;
            state.completedStepsLevel += 1;
            updateHeader();

            // All done?
            if (state.nextExpected > state.numberedCount) {
                advanceSublevel();
                return;
            }
            taskEl.textContent = "Натискайте за зростанням: " + state.nextExpected;
            return;
        }

        // Wrong numbered cell
        cellEl.classList.add("wrong");
        cellEl.textContent = value;
        playWrong();
        state.lives -= 1;
        updateHeader();
        if (state.lives <= 0) {
            revealRemaining();
            endGame(false, "Раунд незавершено: закінчились життя");
            return;
        }
        setTimeout(function () {
            cellEl.className = "cell blank";
            cellEl.textContent = "";
        }, 500);
    }

    function revealRemaining() {
        state.cells.forEach(function (c) {
            if (c.isNumbered && !c.element.classList.contains("correct")) {
                c.element.className = "cell revealed";
                c.element.textContent = c.value;
            }
        });
    }

    /* ─── Sublevel flow ─── */

    function startSublevel() {
        var config = state.sublevels[state.sublevelIndex];
        buildGrid(config);
        updateHeader();
        startMemorizePhase(config);
    }

    function advanceSublevel() {
        if (state.sublevelIndex < state.sublevels.length - 1) {
            state.sublevelIndex += 1;
            startSublevel();
            return;
        }
        endGame(true, "Раунд завершено!");
    }

    /* ─── Game flow ─── */

    function showCountdown() {
        GameAnalytics.send("game_start", { level: state.level });
        var count = 3;
        countdownEl.textContent = count;
        countdownEl.classList.remove("hidden");

        var cid = setInterval(function () {
            playBeep();
            count -= 1;
            if (count > 0) {
                countdownEl.textContent = count;
                return;
            }
            clearInterval(cid);
            countdownEl.classList.add("hidden");
            state.running = true;
            startSublevel();
        }, 1000);
    }

    function startGame() {
        state.sublevels = getSublevels(state.level);
        state.sublevelIndex = 0;
        state.nextExpected = 1;
        state.lives = state.maxLives;
        state.phase = "idle";
        state.completedStepsLevel = 0;
        state.totalStepsLevel = state.sublevels.reduce(function (sum, cfg) {
            return sum + cfg.numbered;
        }, 0);

        updateHeader();
        stopResumeBtn.textContent = "Зупинити";
        stopResumeBtn.style.display = "inline-flex";
        resultEl.classList.remove("visible");
        startScreenEl.classList.add("hidden");
        showCountdown();
    }

    function endGame(isWin, message) {
        state.running = false;
        state.phase = "idle";
        if (state.memorizeTimer) {
            clearTimeout(state.memorizeTimer);
            state.memorizeTimer = null;
        }
        stopResumeBtn.textContent = "Продовжити";
        correctEl.textContent = state.completedStepsLevel;
        totalResultEl.textContent = state.totalStepsLevel;
        bestLevelEl.textContent = state.level;
        resultSubEl.textContent = message || (isWin ? "Раунд завершено" : "Раунд незавершено");
        saveResult(isWin);
        renderBest();
        resultEl.classList.add("visible");
        GameAnalytics.send("game_end", {
            level: state.level,
            steps: state.completedStepsLevel,
            total: state.totalStepsLevel,
            win: isWin
        });
    }

    /* ─── Save / Best ─── */

    function saveResult(isWin) {
        var key = "stepsResults";
        var stored = JSON.parse(localStorage.getItem(key) || "{}");
        if (!stored[state.level]) {
            stored[state.level] = [];
        }
        stored[state.level].push({
            steps: state.completedStepsLevel,
            total: state.totalStepsLevel,
            win: isWin,
            player: GameAnalytics.getPlayerName(),
            date: new Date().toISOString().slice(0, 10)
        });
        localStorage.setItem(key, JSON.stringify(stored));
    }

    function renderBest() {
        var key = "stepsResults";
        var stored = JSON.parse(localStorage.getItem(key) || "{}");
        var list = stored[state.level] || [];
        var sorted = list
            .slice()
            .sort(function (a, b) {
                if (b.steps !== a.steps) return b.steps - a.steps;
                return 0;
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
                (item.player || "—") +
                " — " +
                item.steps +
                "/" +
                item.total +
                " " +
                status +
                "</span><span>" +
                item.date +
                "</span>";
            bestListEl.appendChild(li);
        });
    }

    /* ─── Pause / Exit ─── */

    function togglePause() {
        if (!state.running && !resultEl.classList.contains("visible")) {
            state.running = true;
            stopResumeBtn.textContent = "Зупинити";
            // If was paused during memorize phase, restart the hide timer
            if (state.phase === "memorize") {
                var config = state.sublevels[state.sublevelIndex];
                state.memorizeTimer = setTimeout(function () {
                    if (!state.running) return;
                    hideNumbers();
                }, 1000); // short delay on resume
            }
            return;
        }
        if (state.running) {
            state.running = false;
            if (state.memorizeTimer) {
                clearTimeout(state.memorizeTimer);
                state.memorizeTimer = null;
            }
            stopResumeBtn.textContent = "Продовжити";
        }
    }

    /* ─── Event listeners ─── */

    levelButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            GameAnalytics.ensurePlayerName();
            state.level = Number(button.dataset.level);
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
        state.phase = "idle";
        if (state.memorizeTimer) {
            clearTimeout(state.memorizeTimer);
            state.memorizeTimer = null;
        }
        resultEl.classList.remove("visible");
        startScreenEl.classList.remove("hidden");
        stopResumeBtn.textContent = "Зупинити";
    });

    stopResumeBtn.addEventListener("click", function () {
        togglePause();
    });

    /* ─── Init ─── */

    updateHeader();
    renderBest();
});
