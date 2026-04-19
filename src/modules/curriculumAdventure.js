import { awardBadge } from "../utils/logic.js";
import { loadState, patchStateSilent } from "./storage.js";
import { syncWizardHeader } from "./headerSync.js";

const PASS_MARK = 75;

const PHASE_META = [
  { id: "phase1", title: "Phase 1 • Year 2 Mathematics", tag: "Maths", goal: "Number and basic operations" },
  { id: "phase2", title: "Phase 2 • Year 2 English", tag: "English", goal: "Phonics and basic writing" },
  { id: "phase3", title: "Phase 3 • Year 2 Science", tag: "Science", goal: "Living things and materials" },
  { id: "phase4", title: "Phase 4 • Year 3 Mathematics", tag: "Maths", goal: "Advanced number work" },
  { id: "phase5", title: "Phase 5 • Year 3 English", tag: "English", goal: "Advanced literacy skills" },
  { id: "phase6", title: "Phase 6 • Year 3 Science", tag: "Science", goal: "Complex scientific concepts" }
];

function phaseModules() {
  return {
    phase1: [
      {
        title: "Magical Number Castle",
        objective: "Build and compare numbers with place value",
        questions: [
          { question: "What is 6 tens and 4 ones?", options: ["46", "64", "604"], answer: "64", explain: "6 tens = 60 and 4 ones = 4, so total 64.", shortcut: "Tens first, ones second." },
          { question: "Which symbol is correct: 58 __ 85?", options: [">", "<", "="], answer: "<", explain: "58 is smaller than 85.", shortcut: "Compare tens digit first." },
          { question: "Count in 5s: 5, 10, 15, __", options: ["20", "25", "18"], answer: "20", explain: "Skip counting by 5 adds five each step.", shortcut: "Use fingers: 5, 10, 15, 20." }
        ]
      },
      {
        title: "Potion Making Calculator",
        objective: "Add and subtract within 100",
        questions: [
          { question: "What is 34 + 21?", options: ["55", "45", "54"], answer: "55", explain: "30+20=50 and 4+1=5, total 55.", shortcut: "Split tens and ones." },
          { question: "What is 60 - 17?", options: ["53", "43", "47"], answer: "43", explain: "60 - 10 = 50, then 50 - 7 = 43.", shortcut: "Subtract in two easy steps." },
          { question: "Missing number: __ + 9 = 20", options: ["11", "12", "10"], answer: "11", explain: "11 and 9 make 20.", shortcut: "Think inverse: 20 - 9." }
        ]
      }
    ],
    phase2: [
      {
        title: "Phonics Wizard Spells",
        objective: "Blend and decode common Year 2 words",
        questions: [
          { question: "Pick the contraction for 'do not'.", options: ["dont", "don't", "do'nt"], answer: "don't", explain: "The apostrophe replaces missing letters.", shortcut: "Say both words and listen for the missing sound." },
          { question: "Which word has the /igh/ sound?", options: ["night", "net", "nap"], answer: "night", explain: "The letters 'igh' make the long /i/ sound.", shortcut: "Look for the letter pattern." },
          { question: "Choose the correctly spelled common word.", options: ["becaus", "because", "becose"], answer: "because", explain: "Because is a Year 2 common exception word.", shortcut: "Use your memory sentence for because." }
        ]
      },
      {
        title: "Story Creation Castle",
        objective: "Compose clear sentences and short narratives",
        questions: [
          { question: "Best opening sentence:", options: ["once there was a dragon", "Once there was a dragon.", "once There was a dragon"], answer: "Once there was a dragon.", explain: "Capital letter and full stop are both needed.", shortcut: "Sentence sandwich: capital + words + stop." },
          { question: "Choose a conjunction sentence.", options: ["I ran and I laughed.", "I ran and.", "And I ran"], answer: "I ran and I laughed.", explain: "Both parts are complete ideas joined by 'and'.", shortcut: "Check both sides of 'and' make sense." },
          { question: "Which is a question?", options: ["The cat is sleepy.", "Where is the cat?", "The cat!"], answer: "Where is the cat?", explain: "Questions ask something and end with '?'.", shortcut: "Question words often start with where/what/why." }
        ]
      }
    ],
    phase3: [
      {
        title: "Habitat Explorer Mission",
        objective: "Identify habitats and basic life needs",
        questions: [
          { question: "Which is a habitat?", options: ["Pond", "Pencil case", "Window"], answer: "Pond", explain: "A habitat is where living things live.", shortcut: "Think 'home for living things'." },
          { question: "Which is alive?", options: ["Tree", "Toy car", "Stone"], answer: "Tree", explain: "Trees grow and need water and light.", shortcut: "Alive things grow, feed, and reproduce." },
          { question: "A frog likely lives in a ____.", options: ["pond", "desert", "oven"], answer: "pond", explain: "Frogs need wet habitats.", shortcut: "Match body needs to place." }
        ]
      },
      {
        title: "Materials Testing Workshop",
        objective: "Match materials to useful properties",
        questions: [
          { question: "Best material for a raincoat:", options: ["paper", "waterproof plastic", "sponge"], answer: "waterproof plastic", explain: "A raincoat should not soak up water.", shortcut: "Ask: should it absorb or repel water?" },
          { question: "Which can change shape when stretched?", options: ["rubber band", "rock", "glass"], answer: "rubber band", explain: "Rubber is elastic and stretches.", shortcut: "Elastic means stretch and return." },
          { question: "Which is strongest for a bridge toy?", options: ["cardboard tube", "wet tissue", "foil paper"], answer: "cardboard tube", explain: "Cardboard can hold more weight than tissue or foil.", shortcut: "Choose strong + stiff for structures." }
        ]
      }
    ],
    phase4: [
      {
        title: "Number Kingdom Expansion",
        objective: "Use 3-digit place value and calculations",
        questions: [
          { question: "Value of 7 in 472:", options: ["7", "70", "700"], answer: "70", explain: "The 7 is in the tens column.", shortcut: "Ones, tens, hundreds from right to left." },
          { question: "What is 308 + 45?", options: ["353", "343", "313"], answer: "353", explain: "300+40=340 and 8+5=13, total 353.", shortcut: "Add hundreds/tens/ones separately." },
          { question: "Which is 8 × 4?", options: ["24", "32", "48"], answer: "32", explain: "8 groups of 4 make 32.", shortcut: "Use doubles: 4×8 is double 4×4." }
        ]
      },
      {
        title: "Fraction Art Studio",
        objective: "Compare and build simple fractions",
        questions: [
          { question: "Which fraction is bigger?", options: ["1/2", "1/4", "same"], answer: "1/2", explain: "Half is larger than a quarter of the same whole.", shortcut: "More equal parts means smaller pieces." },
          { question: "What is 2/4 equal to?", options: ["1/2", "1/3", "3/4"], answer: "1/2", explain: "Two quarters cover the same as one half.", shortcut: "Simplify by dividing top and bottom by 2." },
          { question: "3/10 means:", options: ["3 equal parts total", "3 out of 10 equal parts", "10 out of 3"], answer: "3 out of 10 equal parts", explain: "Denominator is total equal parts, numerator is selected parts.", shortcut: "Top picked, bottom total." }
        ]
      }
    ],
    phase5: [
      {
        title: "Etymology Exploration Lab",
        objective: "Use prefixes, suffixes and dictionary skills",
        questions: [
          { question: "Prefix in 'unhappy' is:", options: ["happy", "un", "py"], answer: "un", explain: "The prefix comes before the root word.", shortcut: "Prefix = pre = before." },
          { question: "Suffix in 'careful' is:", options: ["care", "ful", "car"], answer: "ful", explain: "Suffixes are added at the end.", shortcut: "Suffix sits at the suffix-end." },
          { question: "Choose the correct homophone:", options: ["Their going home.", "They're going home.", "There going home."], answer: "They're going home.", explain: "They're = they are.", shortcut: "Expand contraction to check." }
        ]
      },
      {
        title: "Professional Writer's Studio",
        objective: "Plan, draft and improve clear paragraphs",
        questions: [
          { question: "Best paragraph opener:", options: ["first i", "First, I", "FIRST i"], answer: "First, I", explain: "Capital letter and comma after opener are correct.", shortcut: "Sentence polish: capital + punctuation." },
          { question: "Pick strongest adjective:", options: ["nice", "magnificent", "ok"], answer: "magnificent", explain: "Specific vocabulary improves writing.", shortcut: "Swap weak words for precise words." },
          { question: "Which heading fits a pet-care text?", options: ["How to care for your rabbit", "A Story About Rainbows", "Shopping List"], answer: "How to care for your rabbit", explain: "The heading should match the text purpose.", shortcut: "Ask: what is this text trying to do?" }
        ]
      }
    ],
    phase6: [
      {
        title: "Light Physics Playground",
        objective: "Understand light sources and shadows",
        questions: [
          { question: "Which is a light source?", options: ["Moon", "Torch", "Mirror"], answer: "Torch", explain: "A source makes its own light.", shortcut: "Source means it emits light itself." },
          { question: "A shadow gets bigger when the object is ____ the light.", options: ["closer to", "far from", "behind you"], answer: "closer to", explain: "Near the source, shadows spread larger.", shortcut: "Closer to lamp, larger shadow." },
          { question: "Best way to stay safe in strong sun:", options: ["No hat", "Hat and shade", "Look at the sun"], answer: "Hat and shade", explain: "Sun safety protects skin and eyes.", shortcut: "Shade + hat + sunscreen." }
        ]
      },
      {
        title: "Forces Investigation Station",
        objective: "Explore friction and magnets",
        questions: [
          { question: "Which surface has more friction?", options: ["Carpet", "Ice", "Wet tile"], answer: "Carpet", explain: "Rough surfaces create more resistance.", shortcut: "Rough = more grip." },
          { question: "Which item is magnetic?", options: ["Paperclip", "Wooden spoon", "Rubber"], answer: "Paperclip", explain: "Paperclips are usually steel.", shortcut: "Iron/steel are often magnetic." },
          { question: "Like poles of magnets ____.", options: ["attract", "repel", "melt"], answer: "repel", explain: "Like poles push away from each other.", shortcut: "Like poles leave." }
        ]
      }
    ]
  };
}

function getProgress(state, id) {
  const fallback = { best: 0, attempts: 0, passed: false };
  return state.academyProgress?.[id] || fallback;
}

export function renderCurriculumAdventure(container, state) {
  const modulesByPhase = phaseModules();
  let active = "phase1";
  let activeModule = 0;
  let index = 0;
  let score = 0;
  let locked = false;

  const wrap = document.createElement("div");
  wrap.className = "academy-page";
  wrap.innerHTML = `
    <section class="theme-hero">
      <h2>🧙 Curriculum Adventure Academy</h2>
      <p>Complete all six phases from your guide with coaching, shortcuts, and badge rewards.</p>
    </section>
    <section class="academy-grid"></section>
    <section class="activity-box">
      <p class="activity-help">Each module has 3 questions. Pass mark: ${PASS_MARK}%.</p>
      <div id="academyModules" class="academy-modules"></div>
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
  const modulesEl = wrap.querySelector("#academyModules");

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
        activeModule = 0;
        index = 0;
        score = 0;
        locked = false;
        feedback.innerHTML = "";
        nextBtn.disabled = true;
        drawCards();
        drawModules();
        paintQuestion();
      });
    });
  }

  function drawModules() {
    const modules = modulesByPhase[active];
    modulesEl.innerHTML = modules.map((m, i) => `
      <button type="button" class="academy-module-btn ${i === activeModule ? "academy-module-btn--active" : ""}" data-index="${i}">
        ${m.title}
      </button>
    `).join("");
    modulesEl.querySelectorAll(".academy-module-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeModule = Number(btn.dataset.index);
        index = 0;
        score = 0;
        feedback.innerHTML = "";
        nextBtn.disabled = true;
        drawModules();
        paintQuestion();
      });
    });
  }

  function paintQuestion() {
    const module = modulesByPhase[active][activeModule];
    const list = module.questions;
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
        merged = awardBadge(merged, `academy-${active}-m${activeModule + 1}-pass`);
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
          <p><strong>${module.title}</strong>: you scored <strong>${pct}%</strong>. ${passed ? "Badge earned and smiles added." : "You still earned smiles for effort."}</p>
        </section>
      `;
      qArea.innerHTML = `<p><strong>Module complete.</strong> Restart or switch module/phase above.</p>`;
      nextBtn.disabled = true;
      drawCards();
      return;
    }

    const q = list[index];
    qArea.innerHTML = `
      <p>Question ${index + 1} of ${list.length}</p>
      <p class="activity-help"><strong>${module.title}</strong> — ${module.objective}</p>
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
  drawModules();
  paintQuestion();
}
