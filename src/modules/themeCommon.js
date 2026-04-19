import { awardBadge, calculateScore, checkQuizAnswer } from "../utils/logic.js";
import { renderArtPad } from "./art.js";
import { CURRICULUM_WORDS } from "./curriculumWords.js";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getMilestoneKey(themeKey, activity, id) {
  return `${themeKey}:${activity}:${id}`;
}

function getVocabList(yearBand, themeKey) {
  const band = yearBand === "y3" ? "y3" : "y2";
  return CURRICULUM_WORDS[band][themeKey] || [];
}

function speakText(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

function interactiveText(text, vocabList) {
  let output = text;
  vocabList.forEach((item) => {
    const pattern = new RegExp(`\\b(${item.word})\\b`, "ig");
    output = output.replace(
      pattern,
      `<button type="button" class="word-chip" data-word="${item.word.toLowerCase()}">$1</button>`
    );
  });
  return output;
}

const SPELL_LISTS = {
  y2: ["because", "beautiful", "everybody", "great", "could", "should", "would", "people", "water", "again"],
  y3: ["although", "possible", "probably", "important", "information", "dictionary", "paragraph", "experiment", "temperature", "environment"]
};

function renderSpellingPractice(container, themeKey, state, setState) {
  const band = state.yearBand === "y3" ? "y3" : "y2";
  const words = SPELL_LISTS[band];
  const box = document.createElement("section");
  box.className = "activity-box";
  box.innerHTML = `
    <h3>✏️ Spelling Sprint</h3>
    <p class="activity-help">
      Practise spellings picked for England Year ${band === "y3" ? "3" : "2"} word work.
      Listen, then spell the word in the box.
    </p>
    <p><strong>Word:</strong> <span id="spellWord">Tap start</span></p>
    <label>Your spelling
      <input type="text" id="spellInput" autocomplete="off" aria-label="Type the spelling">
    </label>
    <div class="row">
      <button type="button" id="spellStart">Start</button>
      <button type="button" id="spellListen">Listen again</button>
      <button type="button" id="spellCheck">Check</button>
    </div>
    <p id="spellFeedback" aria-live="polite"></p>
  `;
  let index = 0;
  let currentWord = "";

  function pickWord() {
    currentWord = words[index % words.length];
    box.querySelector("#spellWord").textContent = "Listen carefully… (word hidden)";
    speakText(currentWord);
    box.querySelector("#spellFeedback").textContent = "";
    box.querySelector("#spellInput").value = "";
  }

  box.querySelector("#spellStart").addEventListener("click", () => {
    index = Math.floor(Math.random() * words.length);
    pickWord();
  });
  box.querySelector("#spellListen").addEventListener("click", () => speakText(currentWord));
  box.querySelector("#spellCheck").addEventListener("click", () => {
    const typed = box.querySelector("#spellInput").value.trim().toLowerCase();
    const ok = typed === currentWord.toLowerCase();
    const fb = box.querySelector("#spellFeedback");
    if (ok) {
      fb.textContent = "Correct! Clear letters and neat focus — super work.";
      const current = structuredClone(state);
      const next = markMilestone(current, themeKey, "spelling-win", `${band}-${currentWord}`, 2, `${themeKey}-spelling-${band}`);
      setState(next);
      index += 1;
    } else {
      fb.textContent = `Try again: the word is spelled “${currentWord}”.`;
    }
  });

  container.appendChild(box);
}

function getMathQuestions(band) {
  if (band === "y3") {
    return [
      {
        q: "What is 7 × 4?",
        options: ["21", "28", "32"],
        a: "28",
        explain: "7 groups of 4 make 28 in total.",
        shortcut: "Use 4×7 = 28 from your times-table chant."
      },
      {
        q: "What is 36 + 27?",
        options: ["53", "63", "73"],
        a: "63",
        explain: "30 + 20 = 50 and 6 + 7 = 13, so 50 + 13 = 63.",
        shortcut: "Split tens and ones: (30+20) and (6+7)."
      },
      {
        q: "How many mm in 4 cm?",
        options: ["40", "400", "4000"],
        a: "40",
        explain: "1 cm = 10 mm, so 4 cm = 4 × 10 mm.",
        shortcut: "Centimetres to millimetres: multiply by 10."
      }
    ];
  }
  return [
    {
      q: "What is 25 + 18?",
      options: ["34", "43", "53"],
      a: "43",
      explain: "25 and 18 make 43 when added together.",
      shortcut: "Add 20 + 10 first, then add 5 + 8."
    },
    {
      q: "What is 5 × 6?",
      options: ["25", "30", "36"],
      a: "30",
      explain: "Five groups of six equals 30.",
      shortcut: "Count by 5s: 5, 10, 15, 20, 25, 30."
    },
    {
      q: "What is half of 20?",
      options: ["5", "10", "12"],
      a: "10",
      explain: "Half means split into 2 equal parts. 20 split in 2 is 10.",
      shortcut: "Double-check: 10 + 10 = 20."
    }
  ];
}

function renderMathSprint(container, themeKey, state, setState) {
  const band = state.yearBand === "y3" ? "y3" : "y2";
  const questions = getMathQuestions(band);
  let idx = 0;
  let score = 0;
  let awarded = false;
  let feedback = null;
  const box = document.createElement("section");
  box.className = "activity-box";
  box.innerHTML = `
    <h3>🔢 Number Sprint</h3>
    <p class="activity-help">
      Quick UK maths practice for Year ${band === "y3" ? "3" : "2"}.
    </p>
    <div id="mathArea"></div>
  `;
  const area = box.querySelector("#mathArea");

  function paint() {
    if (idx >= questions.length) {
      area.innerHTML = `
        <p>You scored <strong>${score}/${questions.length}</strong>.</p>
        <button type="button" id="mathAgain">Play again</button>
      `;
      area.querySelector("#mathAgain").addEventListener("click", () => {
        idx = 0;
        score = 0;
        awarded = false;
        paint();
      });
      if (!awarded) {
        const current = structuredClone(state);
        const next = markMilestone(
          current,
          themeKey,
          "math-run",
          band,
          Math.max(1, score),
          `${themeKey}-math-${band}`
        );
        setState(next);
        awarded = true;
      }
      return;
    }
    const item = questions[idx];
    area.innerHTML = `
      <p><strong>${item.q}</strong></p>
      <div class="row">
        ${item.options.map((opt) => `<button type="button" class="mathOpt" data-value="${opt}">${opt}</button>`).join("")}
      </div>
      <div id="mathFeedback"></div>
    `;
    feedback = area.querySelector("#mathFeedback");
    area.querySelectorAll(".mathOpt").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const chosen = e.currentTarget.dataset.value;
        const correct = chosen === item.a;
        if (correct) score += 1;
        area.querySelectorAll(".mathOpt").forEach((b) => {
          b.disabled = true;
        });
        feedback.innerHTML = `
          <section class="answer-coach" aria-live="polite">
            <p><strong>${correct ? "Correct! ✅" : `Not this time. ✅ Correct answer: ${item.a}`}</strong></p>
            <p><strong>Simple explanation:</strong> ${item.explain || "This answer matches the maths rule in the question."}</p>
            <p><strong>Brain shortcut:</strong> ${item.shortcut || "Break the problem into smaller parts."}</p>
            <button type="button" id="mathNextBtn">Next question</button>
          </section>
        `;
        feedback.querySelector("#mathNextBtn").addEventListener("click", () => {
          idx += 1;
          paint();
        });
      });
    });
  }
  paint();
  container.appendChild(box);
}

function markMilestone(state, themeKey, activity, id, smilesToAdd, badgeName) {
  const key = getMilestoneKey(themeKey, activity, id);
  if (state.gameProgress[key]) {
    return state;
  }
  const next = structuredClone(state);
  next.gameProgress[key] = true;
  next.smiles += smilesToAdd;
  return awardBadge(next, badgeName);
}

function renderStories(container, stories, themeKey, state, setState) {
  let storyIndex = 0;
  let pageIndex = 0;
  let completedMessage = "";
  let readingMode = "self";
  const vocabList = getVocabList(state.yearBand, themeKey);
  const bandLabel = state.yearBand === "y3" ? "Year 3" : "Year 2";
  const box = document.createElement("section");
  box.className = "activity-box";
  box.innerHTML = `
    <h3>📖 Stories — ${bandLabel} companion</h3>
    <p class="activity-help">
      Based on England’s national curriculum for ${bandLabel}.
      Tap highlighted words to see spelling, meaning, and pronunciation.
    </p>
    <label>
      Story
      <select id="storySelect" aria-label="Pick a story">
        ${stories.map((s, i) => `<option value="${i}">${s.title}</option>`).join("")}
      </select>
    </label>
    <article id="storyPage" class="book-page"></article>
    <p id="storyProgress" aria-live="polite"></p>
    <div class="row">
      <button type="button" id="prevPage">Previous</button>
      <button type="button" id="nextPage">Next</button>
      <button type="button" id="readAgain">Read Again</button>
      <button type="button" id="readModeBtn">Reading Mode: Read by myself</button>
      <button type="button" id="readAloudBtn">Read Aloud</button>
      <button type="button" id="stopReadBtn">Stop Voice</button>
    </div>
    <section id="wordPanel" class="word-panel" aria-live="polite">
      <h4>Word Explorer</h4>
      <p>Tap a highlighted word to see spelling and meaning.</p>
    </section>
    <p id="storyMessage" aria-live="polite"></p>
  `;
  const storyPage = box.querySelector("#storyPage");
  const storyProgress = box.querySelector("#storyProgress");
  const storyMessage = box.querySelector("#storyMessage");
  const wordPanel = box.querySelector("#wordPanel");
  const prevPage = box.querySelector("#prevPage");
  const nextPage = box.querySelector("#nextPage");
  const readAgain = box.querySelector("#readAgain");
  const readModeBtn = box.querySelector("#readModeBtn");
  const readAloudBtn = box.querySelector("#readAloudBtn");
  const stopReadBtn = box.querySelector("#stopReadBtn");
  const select = box.querySelector("#storySelect");

  function paint() {
    const story = stories[storyIndex];
    const page = story.pages[pageIndex];
    const end = pageIndex >= story.pages.length - 1;
    storyPage.innerHTML = `
      <h4>${story.title}</h4>
      <p class="illustration">${page.emoji}</p>
      <p>${interactiveText(page.text, vocabList)}</p>
      ${end ? `<p><strong>Think:</strong> ${story.reflection}</p>` : ""}
    `;
    storyProgress.textContent = `Page ${pageIndex + 1} of ${story.pages.length}`;
    prevPage.disabled = pageIndex === 0;
    nextPage.textContent = end ? "Finish Story" : "Next";
    storyMessage.textContent = completedMessage;

    storyPage.querySelectorAll(".word-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const selected = vocabList.find((v) => v.word.toLowerCase() === chip.dataset.word);
        if (!selected) return;
        const spelling = selected.word.split("").join("-");
        wordPanel.innerHTML = `
          <h4>Word Explorer</h4>
          <p><strong>Word:</strong> ${selected.word}</p>
          <p><strong>Spelling:</strong> ${spelling}</p>
          <p><strong>Meaning:</strong> ${selected.meaning}</p>
          <p><strong>Pronunciation:</strong> ${selected.pronunciation}</p>
          <button type="button" id="sayWordBtn">Say this word</button>
        `;
        wordPanel.querySelector("#sayWordBtn").addEventListener("click", () => speakText(selected.word));
      });
    });

    if (readingMode === "aloud") {
      speakText(page.text);
    }
  }

  prevPage.addEventListener("click", () => {
    if (pageIndex === 0) return;
    pageIndex -= 1;
    completedMessage = "";
    paint();
  });

  nextPage.addEventListener("click", () => {
    const story = stories[storyIndex];
    if (pageIndex < story.pages.length - 1) {
      pageIndex += 1;
      completedMessage = "";
      paint();
      return;
    }
    const current = structuredClone(state);
    const next = markMilestone(
      current,
      themeKey,
      "story",
      story.title,
      2,
      `${themeKey}-story-star`
    );
    setState(next);
    completedMessage = "Great reading! You earned smiles for finishing this story.";
    paint();
  });

  readAgain.addEventListener("click", () => {
    pageIndex = 0;
    completedMessage = "";
    paint();
  });
  readModeBtn.addEventListener("click", () => {
    readingMode = readingMode === "self" ? "aloud" : "self";
    readModeBtn.textContent =
      readingMode === "self" ? "Reading Mode: Read by myself" : "Reading Mode: Read aloud";
    if (readingMode === "aloud") {
      const story = stories[storyIndex];
      speakText(story.pages[pageIndex].text);
    }
  });
  readAloudBtn.addEventListener("click", () => {
    const story = stories[storyIndex];
    speakText(story.pages[pageIndex].text);
  });
  stopReadBtn.addEventListener("click", () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  });
  select.addEventListener("change", (e) => {
    storyIndex = Number(e.target.value);
    pageIndex = 0;
    completedMessage = "";
    wordPanel.innerHTML = `<h4>Word Explorer</h4><p>Tap a highlighted word to see spelling and meaning.</p>`;
    paint();
  });
  paint();
  container.appendChild(box);
}

function renderChallenge(container, themeData, themeKey, state, setState) {
  const key = `${themeKey}-${todayKey()}`;
  const done = Boolean(state.challengesDoneByDay[key]);
  const box = document.createElement("section");
  box.className = "activity-box";
  box.innerHTML = `
    <h3>🏆 Challenge of the Day</h3>
    <p class="activity-help">Try this in real life, then tap when you finish.</p>
    <p>${themeData.challenge}</p>
    <p>Current streak: <strong>${state.streaks[themeKey] || 0}</strong> days</p>
    <button type="button" ${done ? "disabled" : ""} id="doneBtn">${done ? "Done today 🌟" : "I did it!"}</button>
    <p id="challengeMessage" aria-live="polite"></p>
  `;
  const challengeMessage = box.querySelector("#challengeMessage");
  box.querySelector("#doneBtn").addEventListener("click", () => {
    const next = structuredClone(state);
    if (next.challengesDoneByDay[key]) return;
    next.challengesDoneByDay[key] = true;
    next.streaks[themeKey] = (next.streaks[themeKey] || 0) + 1;
    next.smiles += 3;
    const badge = `${themeKey}-challenge-${next.streaks[themeKey]}`;
    const updated = awardBadge(next, badge);
    setState(updated);
    challengeMessage.textContent = `Amazing! Your ${themeKey} streak is now ${updated.streaks[themeKey]} days.`;
  });
  container.appendChild(box);
}

function renderQuizGame(container, game, themeKey, state, setState) {
  let idx = 0;
  let score = 0;
  const box = document.createElement("section");
  box.className = "activity-box";
  box.innerHTML = `
    <h3>🎮 ${game.title}</h3>
    <p class="activity-help">Choose one answer for each question.</p>
    <div id="quizArea"></div>
  `;
  const quizArea = box.querySelector("#quizArea");
  let awarded = false;
  let answered = false;
  function paint() {
    if (idx >= game.questions.length) {
      const pct = calculateScore(score, game.questions.length);
      quizArea.innerHTML = `
        <p>You scored <strong>${score}/${game.questions.length}</strong> (${pct}%).</p>
        <p>${pct >= 70 ? "Excellent thinking! 🌟" : "Nice try! Practice makes progress. 💪"}</p>
        <button type="button" id="again">Play Again</button>
      `;
      quizArea.querySelector("#again").addEventListener("click", () => {
        idx = 0;
        score = 0;
        awarded = false;
        paint();
      });
      if (!awarded) {
        const current = structuredClone(state);
        const next = markMilestone(
          current,
          themeKey,
          "quiz",
          game.title,
          Math.max(2, score),
          `${themeKey}-quiz-master`
        );
        setState(next);
        awarded = true;
      }
      return;
    }
    const q = game.questions[idx];
    quizArea.innerHTML = `
      <p>Question ${idx + 1} of ${game.questions.length}</p>
      <p><strong>${q.question}</strong></p>
      <div class="row">
        ${q.options.map((opt) => `<button type="button" class="optBtn" data-value="${opt}">${opt}</button>`).join("")}
      </div>
      <div id="quizFeedback"></div>
    `;
    answered = false;
    const quizFeedback = quizArea.querySelector("#quizFeedback");
    quizArea.querySelectorAll(".optBtn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        if (answered) return;
        answered = true;
        const selected = e.currentTarget.dataset.value;
        const isCorrect = checkQuizAnswer(q.answer, selected);
        if (isCorrect) score += 1;
        quizArea.querySelectorAll(".optBtn").forEach((b) => {
          b.disabled = true;
        });
        quizFeedback.innerHTML = `
          <section class="answer-coach" aria-live="polite">
            <p><strong>${isCorrect ? "Correct! ✅" : `Not this time. ✅ Correct answer: ${q.answer}`}</strong></p>
            <p><strong>Simple explanation:</strong> ${q.explain || "This is the best answer for what the question asks."}</p>
            <p><strong>Brain shortcut:</strong> ${q.shortcut || "Look for key words before choosing."}</p>
            <button type="button" id="quizNextBtn">Next question</button>
          </section>
        `;
        quizFeedback.querySelector("#quizNextBtn").addEventListener("click", () => {
          idx += 1;
          paint();
        });
      });
    });
  }
  paint();
  container.appendChild(box);
}

function renderMemoryGame(container, game, themeKey, state, setState) {
  const box = document.createElement("section");
  box.className = "activity-box";
  box.innerHTML = `
    <h3>🎮 ${game.title}</h3>
    <p class="activity-help">Find all matching kind phrases.</p>
    <div class="row">
      <button type="button" id="resetMemory">Restart Game</button>
    </div>
    <div class="memory-grid"></div>
    <p id="memMsg" aria-live="polite"></p>
  `;
  const grid = box.querySelector(".memory-grid");
  const msg = box.querySelector("#memMsg");

  function setupBoard() {
    const cards = [...game.pairs, ...game.pairs].sort(() => Math.random() - 0.5);
    let first = null;
    let locked = false;
    let matches = 0;
    grid.innerHTML = "";
    msg.textContent = "";

    cards.forEach((word, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "memory-card";
      btn.dataset.word = word;
      btn.dataset.index = String(index);
      btn.textContent = "✨";
      btn.setAttribute("aria-label", `Hidden card ${index + 1}`);
      btn.addEventListener("click", () => {
        if (locked || btn.disabled || btn === first) return;
        btn.textContent = word;
        btn.setAttribute("aria-label", `Card says ${word}`);
        if (!first) {
          first = btn;
          return;
        }
        if (first.dataset.word === btn.dataset.word) {
          first.disabled = true;
          btn.disabled = true;
          first = null;
          matches += 1;
          if (matches === game.pairs.length) {
            msg.textContent = "You matched all kind words! Great job!";
            const current = structuredClone(state);
            const next = markMilestone(
              current,
              themeKey,
              "memory",
              game.title,
              4,
              `${themeKey}-memory-friend`
            );
            setState(next);
          }
        } else {
          locked = true;
          const prev = first;
          first = null;
          setTimeout(() => {
            prev.textContent = "✨";
            btn.textContent = "✨";
            prev.setAttribute("aria-label", "Hidden card");
            btn.setAttribute("aria-label", "Hidden card");
            locked = false;
          }, 700);
        }
      });
      grid.appendChild(btn);
    });
  }

  box.querySelector("#resetMemory").addEventListener("click", setupBoard);
  setupBoard();
  container.appendChild(box);
}

function renderBingo(container, game, themeKey, state, setState) {
  const marks = new Set();
  const box = document.createElement("section");
  box.className = "activity-box";
  box.innerHTML = `
    <h3>🎮 ${game.title}</h3>
    <p class="activity-help">Mark actions you complete. Get any full row, column, or diagonal to win.</p>
    <div class="row"><button type="button" id="clearBingo">Clear Board</button></div>
    <div class="bingo-grid"></div>
    <p id="bingoMsg" aria-live="polite"></p>
  `;
  const grid = box.querySelector(".bingo-grid");
  const msg = box.querySelector("#bingoMsg");
  let won = false;
  game.actions.forEach((action, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "bingo-cell";
    btn.textContent = action;
    btn.addEventListener("click", () => {
      btn.classList.toggle("marked");
      if (btn.classList.contains("marked")) marks.add(i);
      else marks.delete(i);
      const wins = game.lines.some((line) => line.every((n) => marks.has(n)));
      if (wins && !won) {
        msg.textContent = "Bingo! You are a friendship star!";
        const current = structuredClone(state);
        const next = markMilestone(current, themeKey, "bingo", game.title, 5, `${themeKey}-bingo-winner`);
        setState(next);
        won = true;
      }
    });
    grid.appendChild(btn);
  });
  box.querySelector("#clearBingo").addEventListener("click", () => {
    marks.clear();
    won = false;
    msg.textContent = "";
    grid.querySelectorAll(".bingo-cell").forEach((cell) => cell.classList.remove("marked"));
  });
  container.appendChild(box);
}

export function renderThemeActivities(root, themeData, themeKey, state, setState) {
  renderStories(root, themeData.stories, themeKey, state, setState);
  renderSpellingPractice(root, themeKey, state, setState);
  renderMathSprint(root, themeKey, state, setState);
  renderChallenge(root, themeData, themeKey, state, setState);

  if (themeData.game.type === "quiz" || themeData.game.type === "fact-or-fib") {
    renderQuizGame(root, themeData.game, themeKey, state, setState);
  }
  if (themeData.game.type === "memory") {
    renderMemoryGame(root, themeData.game, themeKey, state, setState);
  }
  if (themeData.game.type === "bingo") {
    renderBingo(root, themeData.game, themeKey, state, setState);
  }
  renderArtPad(root, state, setState, themeKey);
}
