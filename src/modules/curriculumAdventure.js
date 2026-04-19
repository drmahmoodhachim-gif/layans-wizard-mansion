import { awardBadge } from "../utils/logic.js";
import { loadState, patchStateSilent } from "./storage.js";
import { syncWizardHeader } from "./headerSync.js";

const PASS_MARK = 75;

function phaseQuestions(yearBand) {
  const isY3 = yearBand === "y3";
  return {
    phase1: [
      {
        question: isY3 ? "What is the value of 4 in 346?" : "What is the value of 7 in 74?",
        options: isY3 ? ["4", "40", "400"] : ["7", "70", "17"],
        answer: isY3 ? "40" : "70",
        explain: isY3 ? "In 346, the 4 is in the tens place, so it means 40." : "In 74, the 7 is in the tens place, so it means 70.",
        shortcut: "Read place from right to left: ones, tens, hundreds."
      },
      {
        question: isY3 ? "Round 167 to the nearest 10." : "How many tens and ones are in 63?",
        options: isY3 ? ["160", "170", "180"] : ["6 tens and 3 ones", "3 tens and 6 ones", "63 tens and 0 ones"],
        answer: isY3 ? "170" : "6 tens and 3 ones",
        explain: isY3 ? "167 is closer to 170 than to 160." : "63 = 60 + 3, so it has 6 tens and 3 ones.",
        shortcut: isY3 ? "If ones digit is 5 or more, round up." : "Split the number: first digit tens, second digit ones."
      },
      {
        question: isY3 ? "Which number has 3 hundreds, 1 ten and 8 ones?" : "Which number is 5 tens and 2 ones?",
        options: isY3 ? ["318", "381", "138"] : ["25", "52", "205"],
        answer: isY3 ? "318" : "52",
        explain: isY3 ? "3 hundreds = 300, 1 ten = 10, 8 ones = 8, total 318." : "5 tens = 50 and 2 ones = 2, total 52.",
        shortcut: "Build place-value totals then combine."
      },
      {
        question: isY3 ? "What is 200 + 40 + 9?" : "What is 30 + 8?",
        options: isY3 ? ["249", "2490", "294"] : ["38", "308", "11"],
        answer: isY3 ? "249" : "38",
        explain: isY3 ? "Add by place: 200 + 40 + 9 = 249." : "30 and 8 combine to make 38.",
        shortcut: "Keep tens and ones in separate lanes first."
      }
    ],
    phase2: [
      {
        question: isY3 ? "What is 54 + 38?" : "What is 27 + 15?",
        options: isY3 ? ["82", "92", "102"] : ["42", "32", "52"],
        answer: isY3 ? "92" : "42",
        explain: isY3 ? "50 + 30 = 80 and 4 + 8 = 12, so 92." : "20 + 10 = 30 and 7 + 5 = 12, so 42.",
        shortcut: "Add tens, then ones."
      },
      {
        question: isY3 ? "What is 73 - 28?" : "What is 46 - 19?",
        options: isY3 ? ["45", "55", "35"] : ["27", "37", "17"],
        answer: isY3 ? "45" : "27",
        explain: isY3 ? "73 - 20 = 53, then 53 - 8 = 45." : "46 - 20 = 26, then add 1 back = 27.",
        shortcut: "Subtract a friendly number, then adjust."
      },
      {
        question: isY3 ? "How many groups of 4 are in 24?" : "How many groups of 2 are in 16?",
        options: isY3 ? ["5", "6", "8"] : ["6", "7", "8"],
        answer: isY3 ? "6" : "8",
        explain: isY3 ? "4 × 6 = 24." : "2 × 8 = 16.",
        shortcut: "Use multiplication facts as inverse division."
      },
      {
        question: isY3 ? "What is 8 × 3?" : "What is 5 × 4?",
        options: isY3 ? ["24", "21", "18"] : ["20", "15", "25"],
        answer: isY3 ? "24" : "20",
        explain: isY3 ? "Eight groups of three are twenty-four." : "Five groups of four are twenty.",
        shortcut: "Chant the table and point-count."
      }
    ],
    phase3: [
      {
        question: "Pick the sentence with correct punctuation.",
        options: ["we went to the park", "We went to the park.", "we went to the park."],
        answer: "We went to the park.",
        explain: "A sentence starts with a capital letter and ends with punctuation.",
        shortcut: "Capital first, full stop last."
      },
      {
        question: isY3 ? "Choose the best adjective." : "Choose the best describing word.",
        options: ["The dragon is big.", "The dragon is huge.", "The dragon is thing."],
        answer: "The dragon is huge.",
        explain: "Huge gives clear, vivid detail.",
        shortcut: "Pick words that paint a picture."
      },
      {
        question: isY3 ? "What does this sentence suggest: 'Sam hugged her coat in the wind'?" : "How might Sam feel in the wind?",
        options: ["Warm", "Cold", "Sleepy"],
        answer: "Cold",
        explain: "Hugging a coat in wind suggests feeling cold.",
        shortcut: "Use clues from actions."
      },
      {
        question: "Choose the best conjunction sentence.",
        options: ["I read a book and I drew a star.", "I read a book because.", "I read a book and."],
        answer: "I read a book and I drew a star.",
        explain: "Both ideas are complete and joined properly.",
        shortcut: "After 'and', make sure another full idea follows."
      }
    ],
    phase4: [
      {
        question: isY3 ? "Which part of a plant carries water?" : "Which part of a plant drinks water?",
        options: ["Roots", "Petals", "Seeds"],
        answer: "Roots",
        explain: "Roots absorb water and minerals from soil.",
        shortcut: "Roots = underground drink straws."
      },
      {
        question: isY3 ? "Which material is magnetic?" : "Which object does a magnet pull?",
        options: ["Wood", "Plastic spoon", "Paperclip"],
        answer: "Paperclip",
        explain: "Most paperclips are steel, which magnets attract.",
        shortcut: "Think: iron/steel sticks to magnets."
      },
      {
        question: "Which habitat suits a fish?",
        options: ["Ocean", "Desert", "Tree branch"],
        answer: "Ocean",
        explain: "Fish need water and oxygen from water.",
        shortcut: "Match body parts to habitat needs."
      },
      {
        question: isY3 ? "What do humans need for healthy bones?" : "What helps bones grow strong?",
        options: ["Exercise and healthy food", "Only sweets", "No sleep"],
        answer: "Exercise and healthy food",
        explain: "Bodies grow stronger with balanced food and activity.",
        shortcut: "Eat, move, sleep = strong body trio."
      }
    ]
  };
}

const PHASE_META = [
  { id: "phase1", title: "Phase 1 • Number Castle", tag: "Maths", goal: "Place value confidence" },
  { id: "phase2", title: "Phase 2 • Calculation Cavern", tag: "Maths", goal: "Add/subtract and tables fluency" },
  { id: "phase3", title: "Phase 3 • Story & Spelling Hall", tag: "English", goal: "Sentence, vocabulary and inference skills" },
  { id: "phase4", title: "Phase 4 • Science Explorer Lab", tag: "Science", goal: "Habitats, plants and materials basics" }
];

function getProgress(state, id) {
  const fallback = { best: 0, attempts: 0, passed: false };
  return state.academyProgress?.[id] || fallback;
}

export function renderCurriculumAdventure(container, state) {
  const questionsByPhase = phaseQuestions(state.yearBand);
  let active = "phase1";
  let index = 0;
  let score = 0;
  let locked = false;

  const wrap = document.createElement("div");
  wrap.className = "academy-page";
  wrap.innerHTML = `
    <section class="theme-hero">
      <h2>🧙 Curriculum Adventure Academy</h2>
      <p>Complete all four phases with coaching, shortcuts, and badge rewards.</p>
    </section>
    <section class="academy-grid"></section>
    <section class="activity-box">
      <p class="activity-help">Each phase has 4 questions. Pass mark: ${PASS_MARK}%.</p>
      <div id="academyQuestion"></div>
      <div id="academyFeedback"></div>
      <div class="row">
        <button type="button" id="academyNext" disabled>Next</button>
        <button type="button" id="academyRestart">Restart phase</button>
      </div>
    </section>
  `;

  container.appendChild(wrap);
  const grid = wrap.querySelector(".academy-grid");
  const qArea = wrap.querySelector("#academyQuestion");
  const feedback = wrap.querySelector("#academyFeedback");
  const nextBtn = wrap.querySelector("#academyNext");

  function drawCards() {
    const fresh = loadState();
    grid.innerHTML = PHASE_META.map((phase) => {
      const p = getProgress(fresh, phase.id);
      return `
        <button type="button" class="academy-card ${phase.id === active ? "academy-card--active" : ""}" data-phase="${phase.id}">
          <p class="academy-tag">${phase.tag}</p>
          <h3>${phase.title}</h3>
          <p>${phase.goal}</p>
          <p><strong>Best:</strong> ${p.best}% · <strong>Attempts:</strong> ${p.attempts} · ${p.passed ? "✅ Passed" : "⏳ In progress"}</p>
        </button>
      `;
    }).join("");
    grid.querySelectorAll(".academy-card").forEach((btn) => {
      btn.addEventListener("click", () => {
        active = btn.dataset.phase;
        index = 0;
        score = 0;
        locked = false;
        feedback.innerHTML = "";
        nextBtn.disabled = true;
        drawCards();
        paintQuestion();
      });
    });
  }

  function paintQuestion() {
    const list = questionsByPhase[active];
    if (index >= list.length) {
      const pct = Math.round((score / list.length) * 100);
      const passed = pct >= PASS_MARK;
      const fresh = loadState();
      const prev = getProgress(fresh, active);
      const nextProgress = {
        ...fresh.academyProgress,
        [active]: {
          best: Math.max(prev.best, pct),
          attempts: prev.attempts + 1,
          passed: prev.passed || passed
        }
      };
      const smilesBonus = passed ? 8 : 3;
      let merged = { ...fresh, smiles: fresh.smiles + smilesBonus, academyProgress: nextProgress };
      if (passed) {
        merged = awardBadge(merged, `academy-${active}-pass`);
      }
      patchStateSilent({
        smiles: merged.smiles,
        badges: merged.badges,
        academyProgress: merged.academyProgress
      });
      syncWizardHeader();
      feedback.innerHTML = `
        <section class="answer-coach" aria-live="polite">
          <p><strong>${passed ? "Great pass! ✅" : "Good try - keep practicing 💪"}</strong></p>
          <p>You scored <strong>${pct}%</strong>. ${passed ? "Badge earned and smiles added." : "You still earned smiles for effort."}</p>
        </section>
      `;
      qArea.innerHTML = `<p><strong>Phase complete.</strong> Restart or switch phase cards above.</p>`;
      nextBtn.disabled = true;
      drawCards();
      return;
    }

    const q = list[index];
    qArea.innerHTML = `
      <p>Question ${index + 1} of ${list.length}</p>
      <p><strong>${q.question}</strong></p>
      <div class="row">
        ${q.options.map((opt) => `<button type="button" class="academy-opt" data-value="${opt}">${opt}</button>`).join("")}
      </div>
    `;
    feedback.innerHTML = "";
    locked = false;
    nextBtn.disabled = true;
    qArea.querySelectorAll(".academy-opt").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (locked) return;
        locked = true;
        const isCorrect = btn.dataset.value === q.answer;
        if (isCorrect) score += 1;
        qArea.querySelectorAll(".academy-opt").forEach((b) => {
          b.disabled = true;
        });
        feedback.innerHTML = `
          <section class="answer-coach" aria-live="polite">
            <p><strong>${isCorrect ? "Correct! ✅" : `Correct answer: ${q.answer}`}</strong></p>
            <p><strong>Simple explanation:</strong> ${q.explain}</p>
            <p><strong>Brain shortcut:</strong> ${q.shortcut}</p>
          </section>
        `;
        nextBtn.disabled = false;
      });
    });
  }

  wrap.querySelector("#academyRestart").addEventListener("click", () => {
    index = 0;
    score = 0;
    paintQuestion();
  });

  nextBtn.addEventListener("click", () => {
    index += 1;
    paintQuestion();
  });

  drawCards();
  paintQuestion();
}
