document.addEventListener("DOMContentLoaded", function () {
    /* ——— DOM refs ——— */
    var levelEl = document.getElementById("level");
    var sublevelEl = document.getElementById("sublevel");
    var totalSublevelsEl = document.getElementById("total-sublevels");
    var seqLengthEl = document.getElementById("sequence-length");
    var timerEl = document.getElementById("timer");
    var boardEl = document.getElementById("board");
    var startScreenEl = document.getElementById("start-screen");
    var countdownEl = document.getElementById("countdown");
    var resultEl = document.getElementById("result");
    var resultTitleEl = document.getElementById("result-title");
    var resultMessageEl = document.getElementById("result-message");
    var finalSublevelsEl = document.getElementById("final-sublevels");
    var finalTimeEl = document.getElementById("final-time");
    var playAgainBtn = document.getElementById("play-again");
    var exitBtn = document.getElementById("btn-exit");
    var soundBtn = document.getElementById("btn-sound");
    var phaseIndicator = document.getElementById("phase-indicator");
    var phaseText = document.getElementById("phase-text");

    var levelButtons = Array.prototype.slice.call(
        document.querySelectorAll(".level-btn")
    );

    /* ——— Audio ——— */
    var audioContext = null;
    var soundEnabled = true;

    function initAudio() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioContext.state === "suspended") {
            audioContext.resume();
        }
    }

    function playTone(freq, duration, type) {
        if (!audioContext || !soundEnabled) return;
        var oscillator = audioContext.createOscillator();
        var gainNode = audioContext.createGain();
        oscillator.type = type || "sine";
        oscillator.frequency.value = freq;
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration);
    }

    function playFlashSound(index, total) {
        var baseFreq = 400;
        var step = 80;
        playTone(baseFreq + index * step, 0.2, "sine");
    }

    function playClickSound() {
        playTone(600, 0.1, "triangle");
    }

    function playCorrectSound() {
        playTone(880, 0.15, "sine");
    }

    function playWrongSound() {
        playTone(200, 0.35, "sawtooth");
    }

    function playLevelCompleteSound() {
        var t = audioContext ? audioContext.currentTime : 0;
        if (!audioContext || !soundEnabled) return;
        [523, 659, 784, 1047].forEach(function (freq, i) {
            var osc = audioContext.createOscillator();
            var g = audioContext.createGain();
            osc.type = "sine";
            osc.frequency.value = freq;
            g.gain.setValueAtTime(0.12, t + i * 0.12);
            g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.3);
            osc.connect(g);
            g.connect(audioContext.destination);
            osc.start(t + i * 0.12);
            osc.stop(t + i * 0.12 + 0.3);
        });
    }

    function playCountdownBeep() {
        playTone(880, 0.12, "sine");
    }

    /* ——— Level configuration ——— */
    /*
        10 levels × 7 sub-levels each.
        Each level defines: grid rows×cols, base sequence length (sub1) → max sequence length (sub7).
        Flash interval also decreases (faster) with level.
    */
    var LEVEL_CONFIG = [
        /* Level  1 */ { rows: 2, cols: 2, seqStart: 2, seqEnd: 4,  flashInterval: 700,  flashDuration: 500  },
        /* Level  2 */ { rows: 2, cols: 3, seqStart: 3, seqEnd: 5,  flashInterval: 650,  flashDuration: 450  },
        /* Level  3 */ { rows: 3, cols: 3, seqStart: 3, seqEnd: 6,  flashInterval: 600,  flashDuration: 420  },
        /* Level  4 */ { rows: 3, cols: 4, seqStart: 4, seqEnd: 7,  flashInterval: 560,  flashDuration: 400  },
        /* Level  5 */ { rows: 4, cols: 4, seqStart: 4, seqEnd: 8,  flashInterval: 520,  flashDuration: 380  },
        /* Level  6 */ { rows: 4, cols: 5, seqStart: 5, seqEnd: 9,  flashInterval: 480,  flashDuration: 350  },
        /* Level  7 */ { rows: 5, cols: 5, seqStart: 5, seqEnd: 10, flashInterval: 440,  flashDuration: 320  },
        /* Level  8 */ { rows: 5, cols: 6, seqStart: 6, seqEnd: 11, flashInterval: 400,  flashDuration: 300  },
        /* Level  9 */ { rows: 6, cols: 6, seqStart: 6, seqEnd: 12, flashInterval: 370,  flashDuration: 280  },
        /* Level 10 */ { rows: 6, cols: 7, seqStart: 7, seqEnd: 13, flashInterval: 340,  flashDuration: 260  }
    ];

    var SUB_LEVELS_COUNT = 7;

    function getSubLevelConfig(level, sublevelIndex) {
        var cfg = LEVEL_CONFIG[level - 1];
        var t = sublevelIndex / (SUB_LEVELS_COUNT - 1); // 0..1
        var seqLen = Math.round(cfg.seqStart + t * (cfg.seqEnd - cfg.seqStart));
        // Flash interval gets slightly faster within sub-levels
        var intervalReduction = t * 60;
        var durationReduction = t * 40;
        return {
            rows: cfg.rows,
            cols: cfg.cols,
            sequenceLength: seqLen,
            flashInterval: Math.round(cfg.flashInterval - intervalReduction),
            flashDuration: Math.round(cfg.flashDuration - durationReduction)
        };
    }

    /* ——— State ——— */
    var state = {
        level: 1,
        sublevelIndex: 0,
        sequence: [],       // array of cell indices
        playerIndex: 0,     // current position in player's input
        phase: "idle",      // "idle" | "showing" | "input" | "finished"
        running: false,
        timerStart: 0,
        timerId: null,
        elapsedSeconds: 0,
        completedSublevels: 0
    };

    /* ——— Timer ——— */
    function formatTime(seconds) {
        var m = Math.floor(seconds / 60);
        var s = seconds % 60;
        return m + ":" + (s < 10 ? "0" : "") + s;
    }

    function startTimer() {
        state.timerStart = Date.now();
        state.elapsedSeconds = 0;
        timerEl.textContent = "0:00";
        clearInterval(state.timerId);
        state.timerId = setInterval(function () {
            state.elapsedSeconds = Math.floor((Date.now() - state.timerStart) / 1000);
            timerEl.textContent = formatTime(state.elapsedSeconds);
        }, 500);
    }

    function stopTimer() {
        clearInterval(state.timerId);
        state.timerId = null;
    }

    /* ——— UI helpers ——— */
    function updateHeader() {
        levelEl.textContent = state.level;
        sublevelEl.textContent = state.sublevelIndex + 1;
        totalSublevelsEl.textContent = SUB_LEVELS_COUNT;
        seqLengthEl.textContent = state.sequence.length;
    }

    function setPhase(text, className) {
        phaseText.textContent = text;
        phaseIndicator.className = "phase-indicator";
        if (className) {
            phaseIndicator.classList.add(className);
        }
    }

    /* ——— Board ——— */
    function buildBoard(rows, cols) {
        var totalCells = rows * cols;
        boardEl.style.setProperty("--board-cols", cols);
        boardEl.innerHTML = "";

        for (var i = 0; i < totalCells; i++) {
            var cell = document.createElement("button");
            cell.type = "button";
            cell.className = "cell";
            cell.dataset.index = i;

            var numSpan = document.createElement("span");
            numSpan.className = "cell-number";
            cell.appendChild(numSpan);

            (function (idx) {
                cell.addEventListener("click", function () {
                    handleCellClick(idx);
                });
            })(i);

            boardEl.appendChild(cell);
        }
    }

    function getCells() {
        return Array.prototype.slice.call(boardEl.querySelectorAll(".cell"));
    }

    /* ——— Sequence generation ——— */
    function generateSequence(totalCells, length) {
        // Create array of all available cell indices
        var availableCells = [];
        for (var i = 0; i < totalCells; i++) {
            availableCells.push(i);
        }
        
        // Shuffle the available cells
        for (var i = availableCells.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = availableCells[i];
            availableCells[i] = availableCells[j];
            availableCells[j] = temp;
        }
        
        // Take the first 'length' cells (each cell appears only once)
        var seq = availableCells.slice(0, Math.min(length, totalCells));
        
        return seq;
    }

    /* ——— Show sequence (flashing) ——— */
    function showSequence(cfg, callback) {
        var cells = getCells();
        state.phase = "showing";
        setPhase("Запам'ятайте послідовність", "");

        // Disable all cells during showing
        cells.forEach(function (c) { c.classList.add("disabled"); });

        var i = 0;
        var flashTimeout;

        function flashNext() {
            if (i >= state.sequence.length) {
                // Done showing
                setTimeout(function () {
                    cells.forEach(function (c) { c.classList.remove("disabled"); });
                    callback();
                }, 300);
                return;
            }

            var cellIndex = state.sequence[i];
            var cell = cells[cellIndex];

            // Show flash
            cell.classList.add("flash");
            cell.querySelector(".cell-number").textContent = i + 1;
            cell.classList.add("show-number");
            playFlashSound(i, state.sequence.length);

            flashTimeout = setTimeout(function () {
                cell.classList.remove("flash");
                cell.classList.remove("show-number");
                i++;

                flashTimeout = setTimeout(flashNext, cfg.flashInterval - cfg.flashDuration);
            }, cfg.flashDuration);
        }

        // Small pause before starting
        setTimeout(flashNext, 400);
    }

    /* ——— Handle player click ——— */
    function handleCellClick(cellIndex) {
        if (state.phase !== "input") return;

        var cells = getCells();
        var cell = cells[cellIndex];
        var expected = state.sequence[state.playerIndex];

        playClickSound();

        if (cellIndex === expected) {
            // Correct!
            cell.classList.add("correct");
            cell.querySelector(".cell-number").textContent = state.playerIndex + 1;
            cell.classList.add("show-number");
            playCorrectSound();

            state.playerIndex++;

            // Brief highlight then remove
            setTimeout(function () {
                cell.classList.remove("correct");
                cell.classList.remove("show-number");
            }, 350);

            if (state.playerIndex >= state.sequence.length) {
                // Sub-level complete!
                state.phase = "finished";
                state.completedSublevels++;
                cells.forEach(function (c) { c.classList.add("disabled"); });

                // Show all correct sequence briefly
                setTimeout(function () {
                    showCorrectSequence(cells, function () {
                        advanceSublevel();
                    });
                }, 400);
            }
        } else {
            // Wrong!
            cell.classList.add("wrong");
            playWrongSound();

            state.phase = "finished";
            cells.forEach(function (c) { c.classList.add("disabled"); });

            setTimeout(function () {
                cell.classList.remove("wrong");
                // Show the correct sequence after error
                showCorrectSequence(cells, function () {
                    finishLevel("Помилка!", "Ви натиснули неправильну клітинку. Спробуйте ще раз!");
                });
            }, 600);
        }
    }

    /* ——— Show correct sequence after round ends ——— */
    function showCorrectSequence(cells, callback) {
        state.sequence.forEach(function (idx, i) {
            var cell = cells[idx];
            cell.classList.add("flash", "show-number");
            cell.querySelector(".cell-number").textContent = i + 1;
        });

        setTimeout(function () {
            state.sequence.forEach(function (idx) {
                var cell = cells[idx];
                cell.classList.remove("flash", "show-number");
            });
            callback();
        }, 1200);
    }

    /* ——— Sub-level flow ——— */
    function startSublevel() {
        var cfg = getSubLevelConfig(state.level, state.sublevelIndex);

        buildBoard(cfg.rows, cfg.cols);

        var totalCells = cfg.rows * cfg.cols;
        state.sequence = generateSequence(totalCells, cfg.sequenceLength);
        state.playerIndex = 0;
        state.phase = "showing";

        updateHeader();

        showSequence(cfg, function () {
            state.phase = "input";
            setPhase("Відтворіть послідовність", "input-phase");
        });
    }

    function advanceSublevel() {
        if (state.sublevelIndex < SUB_LEVELS_COUNT - 1) {
            state.sublevelIndex++;
            updateHeader();
            setPhase("Наступний субрівень...", "");

            setTimeout(function () {
                startSublevel();
            }, 800);
            return;
        }

        // All sub-levels complete!
        playLevelCompleteSound();
        finishLevel("🎉 Рівень пройдено!", "Вітаємо! Ви пройшли всі субрівні.");
    }

    /* ——— Level flow ——— */
    function startLevel(level) {
        state.level = level;
        state.sublevelIndex = 0;
        state.completedSublevels = 0;
        state.phase = "idle";
        state.running = true;

        updateHeader();
        resultEl.classList.remove("visible");
        startScreenEl.classList.add("hidden");

        showCountdown(function () {
            startTimer();
            startSublevel();
        });
    }

    function finishLevel(title, message) {
        state.running = false;
        state.phase = "idle";
        stopTimer();

        resultTitleEl.textContent = title || "Рівень завершено";
        resultMessageEl.textContent = message || "";
        finalSublevelsEl.textContent = state.completedSublevels + " / " + SUB_LEVELS_COUNT;
        finalTimeEl.textContent = formatTime(state.elapsedSeconds);
        resultEl.classList.add("visible");
    }

    /* ——— Countdown ——— */
    function showCountdown(callback) {
        var count = 3;
        countdownEl.textContent = count;
        countdownEl.classList.remove("hidden");
        playCountdownBeep();

        var countdownId = setInterval(function () {
            count -= 1;
            if (count > 0) {
                countdownEl.textContent = count;
                playCountdownBeep();
                return;
            }
            clearInterval(countdownId);
            countdownEl.classList.add("hidden");
            if (callback) callback();
        }, 1000);
    }

    /* ——— Level select ——— */
    function showLevelSelect() {
        resultEl.classList.remove("visible");
        startScreenEl.classList.remove("hidden");
        boardEl.innerHTML = "";
        state.running = false;
        state.phase = "idle";
        stopTimer();
        setPhase("", "");
    }

    /* ——— Sound toggle ——— */
    soundBtn.addEventListener("click", function () {
        soundEnabled = !soundEnabled;
        soundBtn.textContent = soundEnabled ? "🔊" : "🔇";
        soundBtn.classList.toggle("muted", !soundEnabled);
    });

    /* ——— Event listeners ——— */
    levelButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            var level = Number(button.dataset.level);
            initAudio();
            startLevel(level);
        });
    });

    playAgainBtn.addEventListener("click", function () {
        showLevelSelect();
    });

    exitBtn.addEventListener("click", function () {
        showLevelSelect();
    });

    updateHeader();
});
