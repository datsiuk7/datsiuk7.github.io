import customtkinter as ctk
import json
import random
import os
from pathlib import Path

# ── Theme ──────────────────────────────────────────────────────────────────────
ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")

# ── Paths ──────────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).parent
CURRENT_FILE = BASE_DIR / "current_verbs.json"
OTHER_FILE   = BASE_DIR / "other_verbs.json"
PROGRESS_FILE = BASE_DIR / "progress.json"

# ── Colors ─────────────────────────────────────────────────────────────────────
CARD_BG      = "#1e2235"
ACCENT_BLUE  = "#4a9eff"
ACCENT_GREEN = "#2ecc71"
ACCENT_RED   = "#e74c3c"
TEXT_PRIMARY = "#ffffff"
TEXT_SECOND  = "#a0aec0"
HEADER_BG    = "#161929"
BTN_KNOW     = "#1a6b3c"
BTN_UNKNOW   = "#7b1a1a"
BTN_KNOW_H   = "#2ecc71"
BTN_UNKNOW_H = "#e74c3c"

# ══════════════════════════════════════════════════════════════════════════════
#  DATA
# ══════════════════════════════════════════════════════════════════════════════
def load_verbs(path: Path) -> list[dict]:
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def load_progress() -> dict:
    if PROGRESS_FILE.exists():
        with open(PROGRESS_FILE, encoding="utf-8") as f:
            return json.load(f)
    return {}


def save_progress(data: dict):
    with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


# ══════════════════════════════════════════════════════════════════════════════
#  FLASHCARD ENGINE  (Anki-like SM-2 simplified)
# ══════════════════════════════════════════════════════════════════════════════
class CardDeck:
    def __init__(self, verbs: list[dict], label: str):
        self.verbs  = verbs
        self.label  = label
        self.prog   = load_progress()

        for v in verbs:
            key = v["base"]
            if key not in self.prog:
                self.prog[key] = {"knew": 0, "didnt": 0, "streak": 0, "done": False}

        self.queue: list[dict] = []
        self._build_queue()

    # ---------- queue ---------------------------------------------------------
    def _build_queue(self):
        not_done = [v for v in self.verbs if not self.prog[v["base"]]["done"]]
        if not not_done:
            not_done = self.verbs[:]          # reset when all are done
            for v in not_done:
                self.prog[v["base"]]["done"] = False
        random.shuffle(not_done)
        self.queue = not_done

    def current(self) -> dict | None:
        return self.queue[0] if self.queue else None

    def answer(self, knew: bool):
        if not self.queue:
            return
        v   = self.queue.pop(0)
        key = v["base"]
        p   = self.prog[key]

        if knew:
            p["knew"]   += 1
            p["streak"] += 1
            if p["streak"] >= 3:
                p["done"] = True
        else:
            p["didnt"]  += 1
            p["streak"] = 0
            self.queue.append(v)   # put back at the end

        save_progress(self.prog)

        if not self.queue:
            self._build_queue()

    # ---------- stats ---------------------------------------------------------
    def stats(self) -> dict:
        total  = len(self.verbs)
        known  = sum(1 for v in self.verbs if self.prog[v["base"]]["done"])
        total_knew  = sum(self.prog[v["base"]]["knew"]  for v in self.verbs)
        total_didnt = sum(self.prog[v["base"]]["didnt"] for v in self.verbs)
        return {
            "total": total, "known": known,
            "knew": total_knew, "didnt": total_didnt,
        }

    def delete_learned(self, base: str):
        """Remove verb from learned — reset streak so it goes back into study queue."""
        if base in self.prog:
            self.prog[base]["streak"] = 0
            self.prog[base]["done"]   = False
            save_progress(self.prog)
            # put it back at front of queue if it belongs to this deck
            verb = next((v for v in self.verbs if v["base"] == base), None)
            if verb and verb not in self.queue:
                self.queue.insert(0, verb)

    def learned_verbs(self) -> list[dict]:
        """Return list of verb dicts that are marked done."""
        return [v for v in self.verbs if self.prog[v["base"]]["done"]]

    def verb_stat(self, base: str) -> dict:
        """Return progress record for a single verb."""
        return self.prog.get(base, {"knew": 0, "didnt": 0, "streak": 0, "done": False})

    def reset(self):
        for v in self.verbs:
            key = v["base"]
            self.prog[key] = {"knew": 0, "didnt": 0, "streak": 0, "done": False}
        save_progress(self.prog)
        self._build_queue()


# ══════════════════════════════════════════════════════════════════════════════
#  CARD FRAME  (single flashcard widget)
# ══════════════════════════════════════════════════════════════════════════════
class CardFrame(ctk.CTkFrame):
    def __init__(self, master, on_submit, **kw):
        super().__init__(master, fg_color=CARD_BG, corner_radius=20, **kw)
        self.on_submit = on_submit
        self._build()

    def _build(self):
        # ---- top label -------------------------------------------------------
        self.lbl_type = ctk.CTkLabel(
            self, text="BASE FORM",
            font=ctk.CTkFont(size=11, weight="bold"),
            text_color=ACCENT_BLUE
        )
        self.lbl_type.pack(pady=(24, 0))

        # ---- main verb word --------------------------------------------------
        self.lbl_verb = ctk.CTkLabel(
            self, text="",
            font=ctk.CTkFont(family="Segoe UI", size=52, weight="bold"),
            text_color=TEXT_PRIMARY
        )
        self.lbl_verb.pack(pady=(4, 0))

        # ---- translation -----------------------------------------------------
        self.lbl_trans = ctk.CTkLabel(
            self, text="",
            font=ctk.CTkFont(size=16),
            text_color=TEXT_SECOND
        )
        self.lbl_trans.pack(pady=(4, 0))

        # ---- divider ---------------------------------------------------------
        ctk.CTkFrame(self, height=1, fg_color="#2d3452").pack(
            fill="x", padx=30, pady=14
        )

        # ---- input rows ------------------------------------------------------
        input_frame = ctk.CTkFrame(self, fg_color="transparent")
        input_frame.pack(fill="x", padx=30, pady=0)

        self.entry_ps, self.lbl_ps_result = self._mk_input_row(
            input_frame, "Past Simple:", "#f6c90e"
        )
        self.entry_pp, self.lbl_pp_result = self._mk_input_row(
            input_frame, "Past Participle:", "#e67e22"
        )

        # ---- example sentence (shown after submit) ---------------------------
        self.lbl_example = ctk.CTkLabel(
            self, text="",
            font=ctk.CTkFont(size=13, slant="italic"),
            text_color=TEXT_SECOND, wraplength=380
        )
        self.lbl_example.pack(pady=(10, 0))

        self.revealed = False
        self.verb_data = {}

    def _mk_input_row(self, parent, title: str, color: str):
        row = ctk.CTkFrame(parent, fg_color="transparent")
        row.pack(fill="x", pady=5)

        ctk.CTkLabel(
            row, text=title,
            font=ctk.CTkFont(size=13),
            text_color=TEXT_SECOND, width=140, anchor="w"
        ).pack(side="left")

        entry = ctk.CTkEntry(
            row,
            font=ctk.CTkFont(size=16, weight="bold"),
            text_color=color,
            fg_color="#252b42",
            border_color="#3a4060",
            border_width=2,
            width=180, height=36,
            placeholder_text="впиши форму..."
        )
        entry.pack(side="left", padx=(0, 10))

        lbl_result = ctk.CTkLabel(
            row, text="",
            font=ctk.CTkFont(size=18, weight="bold"),
            anchor="w", width=30
        )
        lbl_result.pack(side="left")

        return entry, lbl_result

    # ---------- public --------------------------------------------------------
    def show_verb(self, verb: dict):
        self.verb_data = verb
        self.lbl_verb.configure(text=verb["base"])
        self.lbl_trans.configure(text=verb["translation"])
        # clear inputs and results
        self.entry_ps.delete(0, "end")
        self.entry_pp.delete(0, "end")
        self.entry_ps.configure(border_color="#3a4060")
        self.entry_pp.configure(border_color="#3a4060")
        self.lbl_ps_result.configure(text="")
        self.lbl_pp_result.configure(text="")
        self.lbl_example.configure(text="")
        self.revealed = False
        self.entry_ps.focus()

    def check_answers(self) -> bool:
        """Check both inputs. Returns True if both are exactly correct."""
        v = self.verb_data
        user_ps = self.entry_ps.get().strip().lower()
        user_pp = self.entry_pp.get().strip().lower()
        correct_ps = v["past_simple"].strip().lower()
        correct_pp = v["past_participle"].strip().lower()

        ps_ok = user_ps == correct_ps
        pp_ok = user_pp == correct_pp

        # colour entries
        self.entry_ps.configure(
            border_color=ACCENT_GREEN if ps_ok else ACCENT_RED
        )
        self.entry_pp.configure(
            border_color=ACCENT_GREEN if pp_ok else ACCENT_RED
        )

        # show ✓ or ✗ + correct answer
        if ps_ok:
            self.lbl_ps_result.configure(text="✓", text_color=ACCENT_GREEN)
        else:
            self.lbl_ps_result.configure(
                text=f"✗ {v['past_simple']}", text_color=ACCENT_RED
            )

        if pp_ok:
            self.lbl_pp_result.configure(text="✓", text_color=ACCENT_GREEN)
        else:
            self.lbl_pp_result.configure(
                text=f"✗ {v['past_participle']}", text_color=ACCENT_RED
            )

        self.lbl_example.configure(text=f'"{v["example"]}"')
        self.revealed = True
        return ps_ok and pp_ok


# ══════════════════════════════════════════════════════════════════════════════
#  STUDY VIEW
# ══════════════════════════════════════════════════════════════════════════════
class StudyView(ctk.CTkFrame):
    def __init__(self, master, deck: CardDeck, on_back, **kw):
        super().__init__(master, fg_color=HEADER_BG, **kw)
        self.deck        = deck
        self.on_back     = on_back
        self._enter_held = False   # blocks keyboard auto-repeat
        self._build()
        self._next()

    def _build(self):
        # ── top bar ──────────────────────────────────────────────────────────
        top = ctk.CTkFrame(self, fg_color="transparent")
        top.pack(fill="x", padx=20, pady=(16, 0))

        ctk.CTkButton(
            top, text="← Назад", width=90, height=32,
            fg_color="transparent", border_color=ACCENT_BLUE,
            border_width=1, text_color=ACCENT_BLUE,
            hover_color="#1a2540",
            command=self.on_back
        ).pack(side="left")

        self.lbl_title = ctk.CTkLabel(
            top, text=self.deck.label,
            font=ctk.CTkFont(size=16, weight="bold"),
            text_color=TEXT_PRIMARY
        )
        self.lbl_title.pack(side="left", padx=20)

        right = ctk.CTkFrame(top, fg_color="transparent")
        right.pack(side="right")
        self.lbl_stat = ctk.CTkLabel(
            right, text="",
            font=ctk.CTkFont(size=12),
            text_color=TEXT_SECOND
        )
        self.lbl_stat.pack()

        # ── progress bar ─────────────────────────────────────────────────────
        self.progress_bar = ctk.CTkProgressBar(
            self, height=6, progress_color=ACCENT_BLUE,
            fg_color="#2d3452"
        )
        self.progress_bar.pack(fill="x", padx=20, pady=(10, 0))
        self.progress_bar.set(0)

        # ── card ─────────────────────────────────────────────────────────────
        self.card = CardFrame(self, on_submit=self._submit)
        self.card.pack(fill="both", expand=True, padx=30, pady=20)

        # ── submit button ─────────────────────────────────────────────────────
        self.btn_submit = ctk.CTkButton(
            self, text="✔  Перевірити  (Enter)",
            font=ctk.CTkFont(size=15, weight="bold"),
            height=46, corner_radius=12,
            fg_color=ACCENT_BLUE, hover_color="#3080dd",
            command=self._submit
        )
        self.btn_submit.pack(padx=30, pady=(0, 10))

        # ── next button (shown after check) ───────────────────────────────────
        self.btn_next = ctk.CTkButton(
            self, text="→  Наступне  (Enter)",
            font=ctk.CTkFont(size=15, weight="bold"),
            height=46, corner_radius=12,
            fg_color="#2d3452", hover_color="#3a4460",
            command=self._next
        )
        self.btn_next.pack(padx=30, pady=(0, 20))
        self.btn_next.pack_forget()   # hidden until after check

    # ---------- logic ---------------------------------------------------------
    def _bind_enter_submit(self):
        """Bind Enter on entries/btn → _submit, with auto-repeat guard."""
        for w in (self.card.entry_ps, self.card.entry_pp, self.btn_next):
            w.unbind("<Return>")
            w.unbind("<KeyRelease-Return>")
        for w in (self.card.entry_ps, self.card.entry_pp):
            w.bind("<Return>",         lambda e: self._on_enter_press(self._submit))
            w.bind("<KeyRelease-Return>", lambda e: self._on_enter_release())

    def _bind_enter_next(self):
        """Bind Enter on entries/btn → _next, with auto-repeat guard."""
        for w in (self.card.entry_ps, self.card.entry_pp, self.btn_next):
            w.unbind("<Return>")
            w.unbind("<KeyRelease-Return>")
        for w in (self.card.entry_ps, self.card.entry_pp, self.btn_next):
            w.bind("<Return>",         lambda e: self._on_enter_press(self._next))
            w.bind("<KeyRelease-Return>", lambda e: self._on_enter_release())

    def _on_enter_press(self, action):
        if self._enter_held:
            return          # ignore auto-repeat
        self._enter_held = True
        action()

    def _on_enter_release(self):
        self._enter_held = False

    def _next(self):
        verb = self.deck.current()
        if verb:
            self.card.show_verb(verb)
            self._bind_enter_submit()
            # show submit, hide next
            self.btn_submit.pack(padx=30, pady=(0, 10))
            self.btn_next.pack_forget()
            self._update_stats()

    def _submit(self):
        knew = self.card.check_answers()
        self.deck.answer(knew)
        self._update_stats()

        # swap buttons: hide submit, show next
        self.btn_submit.pack_forget()
        self.btn_next.pack(padx=30, pady=(0, 20))
        self._bind_enter_next()
        self.btn_next.focus_set()

    def _update_stats(self):
        s = self.deck.stats()
        pct = s["known"] / s["total"] if s["total"] else 0
        self.progress_bar.set(pct)
        self.lbl_stat.configure(
            text=f"✅ {s['known']}/{s['total']}  |  👍 {s['knew']}  👎 {s['didnt']}"
        )


# ══════════════════════════════════════════════════════════════════════════════
#  TABLE VIEW  (full table)
# ══════════════════════════════════════════════════════════════════════════════
class TableView(ctk.CTkFrame):
    def __init__(self, master, verbs: list[dict], title: str, on_back, **kw):
        super().__init__(master, fg_color=HEADER_BG, **kw)
        self.on_back = on_back
        self._build(verbs, title)

    def _build(self, verbs, title):
        # back button
        top = ctk.CTkFrame(self, fg_color="transparent")
        top.pack(fill="x", padx=20, pady=(14, 0))
        ctk.CTkButton(
            top, text="← Назад", width=90, height=32,
            fg_color="transparent", border_color=ACCENT_BLUE,
            border_width=1, text_color=ACCENT_BLUE,
            hover_color="#1a2540",
            command=self.on_back
        ).pack(side="left")
        ctk.CTkLabel(
            top, text=title,
            font=ctk.CTkFont(size=16, weight="bold"),
            text_color=TEXT_PRIMARY
        ).pack(side="left", padx=20)

        # scrollable area
        scroll = ctk.CTkScrollableFrame(self, fg_color="transparent")
        scroll.pack(fill="both", expand=True, padx=16, pady=12)

        headers = ["Base Form", "Past Simple", "Past Participle", "Translation", "Example"]
        colors  = [ACCENT_BLUE, "#f6c90e", "#e67e22", TEXT_SECOND, TEXT_SECOND]

        for ci, (h, c) in enumerate(zip(headers, colors)):
            ctk.CTkLabel(
                scroll, text=h,
                font=ctk.CTkFont(size=11, weight="bold"),
                text_color=c
            ).grid(row=0, column=ci, padx=10, pady=(4, 8), sticky="w")

        for ri, v in enumerate(verbs, start=1):
            row_bg = "#1e2235" if ri % 2 == 1 else "#232840"
            row_frame = ctk.CTkFrame(scroll, fg_color=row_bg, corner_radius=8)
            row_frame.grid(row=ri, column=0, columnspan=5,
                           sticky="ew", padx=2, pady=2)
            scroll.grid_columnconfigure(0, weight=1)

            cells = [
                (v["base"],             ACCENT_BLUE,  "bold"),
                (v["past_simple"],      "#f6c90e",    "bold"),
                (v["past_participle"],  "#e67e22",    "bold"),
                (v["translation"],      TEXT_SECOND,  "normal"),
                (v["example"],          TEXT_SECOND,  "normal"),
            ]
            for ci, (text, color, weight) in enumerate(cells):
                ctk.CTkLabel(
                    row_frame, text=text,
                    font=ctk.CTkFont(size=13, weight=weight),
                    text_color=color, anchor="w",
                    wraplength=200 if ci == 4 else 0
                ).grid(row=0, column=ci, padx=(12, 8), pady=8, sticky="w")
            row_frame.grid_columnconfigure(4, weight=1)


# ══════════════════════════════════════════════════════════════════════════════
#  PROGRESS VIEW
# ══════════════════════════════════════════════════════════════════════════════
class ProgressView(ctk.CTkFrame):
    def __init__(self, master, deck_current: "CardDeck",
                 deck_all: "CardDeck", on_back, **kw):
        super().__init__(master, fg_color=HEADER_BG, **kw)
        self.deck_current = deck_current
        self.deck_all     = deck_all
        self.on_back      = on_back
        self._build()

    def _build(self):
        # ── top bar ──────────────────────────────────────────────────────────
        top = ctk.CTkFrame(self, fg_color="transparent")
        top.pack(fill="x", padx=20, pady=(16, 0))
        ctk.CTkButton(
            top, text="← Назад", width=90, height=32,
            fg_color="transparent", border_color=ACCENT_BLUE,
            border_width=1, text_color=ACCENT_BLUE,
            hover_color="#1a2540",
            command=self.on_back
        ).pack(side="left")
        ctk.CTkLabel(
            top, text="📊 Прогрес",
            font=ctk.CTkFont(size=18, weight="bold"),
            text_color=TEXT_PRIMARY
        ).pack(side="left", padx=16)

        # ── summary cards ────────────────────────────────────────────────────
        for deck, icon, title in [
            (self.deck_current, "⚡", "Зараз вивчаю"),
            (self.deck_all,     "📖", "Всі дієслова"),
        ]:
            self._summary_card(deck, icon, title)

        # ── label above learned table ────────────────────────────────────────
        ctk.CTkLabel(
            self,
            text="✅ Вивчені (відповів 3 рази підряд) — можеш видалити, щоб повернути до навчання",
            font=ctk.CTkFont(size=12),
            text_color=TEXT_SECOND
        ).pack(pady=(10, 4))

        # ── scrollable learned table ──────────────────────────────────────────
        self.scroll = ctk.CTkScrollableFrame(
            self, fg_color="transparent", height=280
        )
        self.scroll.pack(fill="both", expand=True, padx=16, pady=(0, 16))
        self._fill_table()

    def _summary_card(self, deck: "CardDeck", icon: str, title: str):
        s = deck.stats()
        total   = s["total"]
        known   = s["known"]
        pct     = known / total if total else 0
        in_prog = total - known

        box = ctk.CTkFrame(self, fg_color=CARD_BG, corner_radius=14)
        box.pack(fill="x", padx=20, pady=(8, 0))

        # header row
        h = ctk.CTkFrame(box, fg_color="transparent")
        h.pack(fill="x", padx=16, pady=(12, 4))
        ctk.CTkLabel(
            h, text=f"{icon}  {title}",
            font=ctk.CTkFont(size=14, weight="bold"),
            text_color=TEXT_PRIMARY
        ).pack(side="left")
        ctk.CTkLabel(
            h, text=f"вивчено {known}/{total}  ({pct*100:.0f}%)",
            font=ctk.CTkFont(size=12),
            text_color=ACCENT_GREEN if pct >= 0.8 else TEXT_SECOND
        ).pack(side="right")

        # progress bar
        bar = ctk.CTkProgressBar(
            box, height=8,
            progress_color=ACCENT_GREEN if pct >= 0.8 else ACCENT_BLUE,
            fg_color="#2d3452"
        )
        bar.pack(fill="x", padx=16, pady=(0, 8))
        bar.set(pct)

        # counters
        c = ctk.CTkFrame(box, fg_color="transparent")
        c.pack(fill="x", padx=16, pady=(0, 12))
        for txt, col in [
            (f"✅ Вивчені: {known}",          ACCENT_GREEN),
            (f"📚 В процесі: {in_prog}",       ACCENT_BLUE),
            (f"👍 Правильно: {s['knew']}",    ACCENT_GREEN),
            (f"👎 Неправильно: {s['didnt']}", ACCENT_RED),
        ]:
            ctk.CTkLabel(
                c, text=txt,
                font=ctk.CTkFont(size=12),
                text_color=col
            ).pack(side="left", padx=10)

    def _fill_table(self):
        # clear
        for w in self.scroll.winfo_children():
            w.destroy()

        # collect all learned from both decks (unique by base)
        seen = set()
        learned = []
        for deck in (self.deck_current, self.deck_all):
            for v in deck.learned_verbs():
                if v["base"] not in seen:
                    seen.add(v["base"])
                    learned.append((v, deck))

        if not learned:
            ctk.CTkLabel(
                self.scroll,
                text="Немає вивчених дієслів. Відповій 3 рази правильно, щоб дієслово потрапило сюди.",
                text_color=TEXT_SECOND, font=ctk.CTkFont(size=13)
            ).pack(pady=20)
            return

        # header
        hrow = ctk.CTkFrame(self.scroll, fg_color="transparent")
        hrow.pack(fill="x", pady=(0, 4))
        for txt, w in [("Base", 110), ("Past Simple", 120),
                       ("Past Participle", 140), ("Переклад", 130),
                       ("✅/❌", 70), ("", 80)]:
            ctk.CTkLabel(
                hrow, text=txt, width=w,
                font=ctk.CTkFont(size=11, weight="bold"),
                text_color=TEXT_SECOND, anchor="w"
            ).pack(side="left", padx=4)

        for i, (v, deck) in enumerate(learned):
            bg = "#1e2235" if i % 2 == 0 else "#232840"
            row = ctk.CTkFrame(self.scroll, fg_color=bg, corner_radius=8)
            row.pack(fill="x", pady=2)

            st = deck.verb_stat(v["base"])
            ratio = f"👍{st['knew']} / 👎{st['didnt']}"

            for txt, w, col in [
                (v["base"],            110, ACCENT_BLUE),
                (v["past_simple"],     120, "#f6c90e"),
                (v["past_participle"], 140, "#e67e22"),
                (v["translation"],     130, TEXT_SECOND),
                (ratio,                70,  TEXT_SECOND),
            ]:
                ctk.CTkLabel(
                    row, text=txt, width=w,
                    font=ctk.CTkFont(size=12),
                    text_color=col, anchor="w"
                ).pack(side="left", padx=4, pady=6)

            # capture for closure
            base_  = v["base"]
            deck_  = deck
            ctk.CTkButton(
                row, text="❌ Видалити", width=80, height=28,
                font=ctk.CTkFont(size=11),
                fg_color="transparent",
                border_color=ACCENT_RED, border_width=1,
                text_color=ACCENT_RED,
                hover_color="#3a1a1a",
                command=lambda b=base_, d=deck_: self._delete(b, d)
            ).pack(side="left", padx=6)

    def _delete(self, base: str, deck: "CardDeck"):
        deck.delete_learned(base)
        self._fill_table()   # refresh list


# ══════════════════════════════════════════════════════════════════════════════
#  HOME VIEW
# ══════════════════════════════════════════════════════════════════════════════
class HomeView(ctk.CTkFrame):
    def __init__(self, master, on_study_current, on_study_all,
                 on_table_current, on_table_all, on_reset, on_progress, **kw):
        super().__init__(master, fg_color=HEADER_BG, **kw)
        self._build(on_study_current, on_study_all,
                    on_table_current, on_table_all, on_reset, on_progress)

    def _build(self, on_study_current, on_study_all,
               on_table_current, on_table_all, on_reset, on_progress):
        # ── header ────────────────────────────────────────────────────────────
        ctk.CTkLabel(
            self, text="📚  Irregular Verbs",
            font=ctk.CTkFont(size=32, weight="bold"),
            text_color=TEXT_PRIMARY
        ).pack(pady=(40, 4))
        ctk.CTkLabel(
            self, text="Anki-стиль запам'ятовування неправильних дієслів",
            font=ctk.CTkFont(size=14),
            text_color=TEXT_SECOND
        ).pack(pady=(0, 30))

        # ── cards ─────────────────────────────────────────────────────────────
        cards_frame = ctk.CTkFrame(self, fg_color="transparent")
        cards_frame.pack(padx=40, fill="x")
        cards_frame.grid_columnconfigure((0, 1), weight=1)

        self._section(
            cards_frame, col=0,
            icon="⚡", title="Зараз вивчаю",
            desc="10 базових дієслів\n(be, have, do, say, go …)",
            color=ACCENT_BLUE,
            btn_study=("▶  Вчити",   on_study_current),
            btn_table=("📋  Таблиця", on_table_current),
        )
        self._section(
            cards_frame, col=1,
            icon="📖", title="Всі дієслова",
            desc="50 популярних дієслів\n(повний список)",
            color="#9b59b6",
            btn_study=("▶  Вчити",   on_study_all),
            btn_table=("📋  Таблиця", on_table_all),
        )

        # ── bottom buttons ────────────────────────────────────────────────────
        bottom = ctk.CTkFrame(self, fg_color="transparent")
        bottom.pack(pady=30)

        ctk.CTkButton(
            bottom, text="📊  Прогрес",
            font=ctk.CTkFont(size=13, weight="bold"),
            fg_color=ACCENT_BLUE, hover_color="#3080dd",
            width=160, height=38,
            command=on_progress
        ).pack(side="left", padx=8)

        ctk.CTkButton(
            bottom, text="🔄  Скинути прогрес",
            font=ctk.CTkFont(size=13),
            fg_color="transparent",
            border_color="#555",
            border_width=1,
            text_color=TEXT_SECOND,
            hover_color="#2a2a3a",
            width=160, height=38,
            command=on_reset
        ).pack(side="left", padx=8)

    def _section(self, parent, col, icon, title, desc,
                 color, btn_study, btn_table):
        box = ctk.CTkFrame(parent, fg_color=CARD_BG, corner_radius=16)
        box.grid(row=0, column=col, padx=10, pady=10, sticky="nsew")

        ctk.CTkLabel(
            box, text=icon,
            font=ctk.CTkFont(size=36)
        ).pack(pady=(24, 4))

        ctk.CTkLabel(
            box, text=title,
            font=ctk.CTkFont(size=18, weight="bold"),
            text_color=TEXT_PRIMARY
        ).pack()

        ctk.CTkLabel(
            box, text=desc,
            font=ctk.CTkFont(size=12),
            text_color=TEXT_SECOND,
            justify="center"
        ).pack(pady=(4, 18))

        ctk.CTkButton(
            box, text=btn_study[0],
            font=ctk.CTkFont(size=14, weight="bold"),
            height=42, corner_radius=10,
            fg_color=color, hover_color=self._lighten(color),
            command=btn_study[1]
        ).pack(fill="x", padx=20, pady=(0, 8))

        ctk.CTkButton(
            box, text=btn_table[0],
            font=ctk.CTkFont(size=13),
            height=36, corner_radius=10,
            fg_color="transparent",
            border_color=color, border_width=1,
            text_color=color,
            hover_color="#1a2540",
            command=btn_table[1]
        ).pack(fill="x", padx=20, pady=(0, 20))

    @staticmethod
    def _lighten(hex_color: str) -> str:
        """Return slightly lighter hex for hover."""
        mapping = {
            ACCENT_BLUE: "#3080dd",
            "#9b59b6": "#7d3f9e",
        }
        return mapping.get(hex_color, "#555")


# ══════════════════════════════════════════════════════════════════════════════
#  APP
# ══════════════════════════════════════════════════════════════════════════════
class App(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title("Irregular Verbs — Flashcards")
        self.geometry("680x700")
        self.minsize(580, 600)
        self.configure(fg_color=HEADER_BG)

        # load data
        current_verbs = load_verbs(CURRENT_FILE)
        other_verbs   = load_verbs(OTHER_FILE)
        all_verbs     = current_verbs + other_verbs

        self.deck_current = CardDeck(current_verbs, "⚡ Зараз вивчаю (10 дієслів)")
        self.deck_all     = CardDeck(all_verbs,     "📖 Всі дієслова (60 дієслів)")

        self._current_view = None
        self._show_home()

    # ── navigation ────────────────────────────────────────────────────────────
    def _clear(self):
        if self._current_view:
            self._current_view.destroy()

    def _show_home(self):
        self._clear()
        self._current_view = HomeView(
            self,
            on_study_current=self._study_current,
            on_study_all=self._study_all,
            on_table_current=lambda: self._table(
                load_verbs(CURRENT_FILE), "📋 Таблиця — Зараз вивчаю"
            ),
            on_table_all=lambda: self._table(
                load_verbs(CURRENT_FILE) + load_verbs(OTHER_FILE),
                "📋 Таблиця — Всі дієслова"
            ),
            on_reset=self._reset,
            on_progress=self._show_progress,
        )
        self._current_view.pack(fill="both", expand=True)

    def _study_current(self):
        self._clear()
        self._current_view = StudyView(
            self, self.deck_current, self._show_home
        )
        self._current_view.pack(fill="both", expand=True)

    def _study_all(self):
        self._clear()
        self._current_view = StudyView(
            self, self.deck_all, self._show_home
        )
        self._current_view.pack(fill="both", expand=True)

    def _table(self, verbs, title):
        self._clear()
        self._current_view = TableView(
            self, verbs, title, self._show_home
        )
        self._current_view.pack(fill="both", expand=True)

    def _show_progress(self):
        self._clear()
        self._current_view = ProgressView(
            self,
            deck_current=self.deck_current,
            deck_all=self.deck_all,
            on_back=self._show_home,
        )
        self._current_view.pack(fill="both", expand=True)

    def _reset(self):
        dialog = ctk.CTkToplevel(self)
        dialog.title("Скинути прогрес")
        dialog.geometry("360x160")
        dialog.resizable(False, False)
        dialog.configure(fg_color=CARD_BG)
        dialog.grab_set()

        ctk.CTkLabel(
            dialog, text="Скинути весь прогрес?",
            font=ctk.CTkFont(size=15, weight="bold"),
            text_color=TEXT_PRIMARY
        ).pack(pady=(24, 6))
        ctk.CTkLabel(
            dialog, text="Всі лічильники будуть обнулені.",
            text_color=TEXT_SECOND, font=ctk.CTkFont(size=12)
        ).pack()

        row = ctk.CTkFrame(dialog, fg_color="transparent")
        row.pack(pady=18)

        def confirm():
            self.deck_current.reset()
            self.deck_all.reset()
            dialog.destroy()

        ctk.CTkButton(
            row, text="Так, скинути",
            fg_color=ACCENT_RED, hover_color="#c0392b",
            width=130, height=36, command=confirm
        ).pack(side="left", padx=8)
        ctk.CTkButton(
            row, text="Скасувати",
            fg_color="transparent", border_color="#555",
            border_width=1, text_color=TEXT_SECOND,
            hover_color="#2a2a3a",
            width=110, height=36, command=dialog.destroy
        ).pack(side="left", padx=8)


# ── entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    App().mainloop()
