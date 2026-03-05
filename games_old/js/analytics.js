/**
 * GameAnalytics — shared analytics module for all games.
 * Sends events to games.datsiuk.com via sendBeacon (fire-and-forget)
 * with XMLHttpRequest fallback.
 *
 * Also manages player name (localStorage) and visitor_id.
 */
var GameAnalytics = (function () {
    "use strict";

    var API_URL = "https://games.datsiuk.com/api/game-events";

    /* ——— Session & Visitor ID ——— */
    function generateId() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            var r = (Math.random() * 16) | 0;
            var v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    var sessionId = generateId(); // new every tab

    var visitorId = (function () {
        var key = "gameVisitorId";
        var stored = localStorage.getItem(key);
        if (stored) return stored;
        var id = generateId();
        localStorage.setItem(key, id);
        return id;
    })();

    /* ——— Player Name ——— */
    var PLAYER_NAME_KEY = "gamePlayerName";

    function getPlayerName() {
        return localStorage.getItem(PLAYER_NAME_KEY) || "";
    }

    function setPlayerName(name) {
        localStorage.setItem(PLAYER_NAME_KEY, (name || "").trim());
    }

    /**
     * Prompts the user for their name if not set yet.
     * Returns the current player name.
     */
    function ensurePlayerName() {
        var name = getPlayerName();
        if (!name) {
            var msg = "Введіть через пробіл: ім'я, прізвище, університет та курс\n\nПриклад: Іван Петренко КПІ 3";
            while (true) {
                name = prompt(msg) || "";
                name = name.trim();
                if (!name) break; // user cancelled
                var parts = name.split(/\s+/);
                if (parts.length >= 4) {
                    setPlayerName(name);
                    break;
                }
                msg = "⚠️ Потрібно ввести 4 слова: ім'я, прізвище, університет та курс\n\nПриклад: Іван Петренко КПІ 3\n\nВи ввели: \"" + name + "\" — це лише " + parts.length + " " + (parts.length === 1 ? "слово" : "слова") + ". Спробуйте ще раз:";
            }
        }
        return name;
    }

    /* ——— Send event ——— */
    function send(eventName, data) {
        var payload = JSON.stringify({
            session_id: sessionId,
            visitor_id: visitorId,
            player_name: getPlayerName(),
            game: detectGame(),
            event: eventName,
            data: data || {},
            timestamp: new Date().toISOString()
        });

        // Try sendBeacon first (fire-and-forget, works on page close)
        if (navigator.sendBeacon) {
            try {
                var blob = new Blob([payload], { type: "application/json" });
                var sent = navigator.sendBeacon(API_URL, blob);
                if (sent) return;
            } catch (e) { /* fallback below */ }
        }

        // Fallback: XMLHttpRequest (async, fire-and-forget)
        try {
            var xhr = new XMLHttpRequest();
            xhr.open("POST", API_URL, true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.send(payload);
        } catch (e) { /* silently fail */ }
    }

    /* ——— Detect current game from URL ——— */
    function detectGame() {
        var path = window.location.pathname || "";
        var parts = path.split("/").filter(Boolean);
        // URL pattern: /games/GameName/index.html
        for (var i = 0; i < parts.length; i++) {
            if (parts[i] === "games" && parts[i + 1]) {
                return parts[i + 1];
            }
        }
        return parts[parts.length - 2] || "unknown";
    }

    /* ——— Public API ——— */
    return {
        send: send,
        sessionId: sessionId,
        visitorId: visitorId,
        getPlayerName: getPlayerName,
        setPlayerName: setPlayerName,
        ensurePlayerName: ensurePlayerName
    };
})();
