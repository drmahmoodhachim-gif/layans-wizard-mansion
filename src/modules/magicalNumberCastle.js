import { awardBadge } from "../utils/logic.js";
import { loadState, patchState, patchStateSilent } from "./storage.js";
import { syncWizardHeader } from "./headerSync.js";

export const ROUTE_ID = "math/year2/place-value";

let keyboardCleanup = null;

export function disposeCastleKeyboard() {
  if (keyboardCleanup) {
    keyboardCleanup();
    keyboardCleanup = null;
  }
}

function getCastleProgress(state) {
  const d = { score: 0, level: 1, lessonProgress: 0, activeChallenge: null };
  return { ...d, ...(state.castleProgress || {}) };
}

function coachingFor(targetNumber, userNumber, correct) {
  const tens = Math.floor(targetNumber / 10);
  const ones = targetNumber % 10;
  const explain = correct
    ? `${tens} tens (${tens} × 10 = ${tens * 10}) plus ${ones} ones equals ${targetNumber}. The first digit is tens, the second is ones.`
    : `The target is ${targetNumber}. That is ${tens} tens and ${ones} ones (${tens * 10} + ${ones} = ${targetNumber}). You built ${userNumber}.`;
  const shortcut =
    "Brain shortcut: split the 2-digit number — tens digit × 10, then add the ones digit.";
  return { explain, shortcut };
}

export function renderMagicalNumberCastle(container, state) {
  disposeCastleKeyboard();

  const bandNote =
    state.yearBand === "y3"
      ? "<p class=\"activity-help\">Tip: This castle focuses on <strong>Year 2</strong> place value — great revision for Year 3 too!</p>"
      : "";

  let local = getCastleProgress(state);
  let currentTens = null;
  let currentOnes = null;
  let selectingTens = true;

  let targetNumber =
    local.activeChallenge != null && local.activeChallenge >= 10 && local.activeChallenge <= 99
      ? local.activeChallenge
      : Math.floor(Math.random() * 90) + 10;

  const wrap = document.createElement("div");
  wrap.className = "castle-page";
  wrap.innerHTML = `
    <section class="castle-header activity-box">
      <p class="castle-curriculum-tag">Year 2 Mathematics • Number & Place Value</p>
      <h2 class="castle-title">🏰 Magical Number Castle 🏰</h2>
      <p class="castle-objective"><strong>Learning goal:</strong> Know that digits in a 2-digit number are tens and ones.</p>
      ${bandNote}
      <div class="castle-progress-wrap">
        <div class="castle-progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" aria-label="Lesson progress">
          <div class="castle-progress-fill" id="castleProgressFill"></div>
        </div>
        <p class="castle-score-line">⭐ Score: <strong id="castleScore">0</strong> · Level: <strong id="castleLevel">1</strong></p>
      </div>
    </section>

    <section class="castle-challenge activity-box" aria-live="polite">
      <p id="castleChallengeText"></p>
    </section>

    <div class="castle-towers">
      <div class="castle-tower castle-tower--tens">
        <span class="castle-tower-emoji" aria-hidden="true">🏰</span>
        <h3>Tens tower</h3>
        <p class="castle-tower-hint">How many groups of 10?</p>
        <div class="castle-num-display" id="castleTensDisplay">?</div>
      </div>
      <div class="castle-tower castle-tower--ones">
        <span class="castle-tower-emoji" aria-hidden="true">🏰</span>
        <h3>Ones tower</h3>
        <p class="castle-tower-hint">How many single units?</p>
        <div class="castle-num-display" id="castleOnesDisplay">?</div>
      </div>
    </div>

    <section class="activity-box">
      <p class="activity-help">Tap a number or press keys 0–9 on your keyboard.</p>
      <div class="castle-keypad" id="castleKeypad"></div>
    </section>

    <section class="castle-result activity-box">
      <p>Your magical number is:</p>
      <div class="castle-final-number" id="castleFinalNumber">—</div>
      <p id="castleBuildExplain" class="castle-build-explain">Pick tens, then ones.</p>
      <div id="castleFeedbackCoach" class="answer-coach" hidden></div>
    </section>

    <div class="row castle-controls">
      <button type="button" class="fun-button" id="castleClear">🔄 Clear castle</button>
      <button type="button" class="fun-button" id="castleNew">✨ New challenge</button>
      <button type="button" class="fun-button" id="castleCheck">🎯 Check answer</button>
    </div>

    <section class="castle-learn-more activity-box">
      <h3>🎓 What you’re learning</h3>
      <p>
        In a 2-digit number, the <strong>left</strong> digit shows <strong>tens</strong> (groups of 10).
        The <strong>right</strong> digit shows <strong>ones</strong> (single units). Together they make the full number!
      </p>
    </section>
  `;

  container.appendChild(wrap);

  const tensEl = wrap.querySelector("#castleTensDisplay");
  const onesEl = wrap.querySelector("#castleOnesDisplay");
  const finalEl = wrap.querySelector("#castleFinalNumber");
  const explainEl = wrap.querySelector("#castleBuildExplain");
  const challengeEl = wrap.querySelector("#castleChallengeText");
  const coachEl = wrap.querySelector("#castleFeedbackCoach");
  const scoreEl = wrap.querySelector("#castleScore");
  const levelEl = wrap.querySelector("#castleLevel");
  const fillEl = wrap.querySelector("#castleProgressFill");
  const keypad = wrap.querySelector("#castleKeypad");

  function syncProgressBar() {
    const pct = Math.min(100, local.lessonProgress);
    fillEl.style.width = `${pct}%`;
    fillEl.closest(".castle-progress-bar").setAttribute("aria-valuenow", String(pct));
  }

  /** Award smiles/badges and castle stats without full re-render (keeps coaching visible). */
  function persistCastleProgress(extraSmiles, badgeId) {
    const base = loadState();
    let merged = {
      ...base,
      smiles: base.smiles + extraSmiles,
      castleProgress: { ...local }
    };
    if (badgeId) merged = awardBadge(merged, badgeId);
    patchStateSilent({
      smiles: merged.smiles,
      badges: merged.badges,
      castleProgress: merged.castleProgress
    });
    syncWizardHeader();
  }

  function updateDisplays() {
    scoreEl.textContent = String(local.score);
    levelEl.textContent = String(local.level);
    syncProgressBar();
  }

  function setChallengeText() {
    const t = Math.floor(targetNumber / 10);
    const o = targetNumber % 10;
    challengeEl.innerHTML = `🎯 <strong>Challenge:</strong> Build the number <strong>${targetNumber}</strong> in the castle!<br><span class="activity-help">Hint: ${targetNumber} = ${t} tens + ${o} ones</span>`;
  }

  function updateFinal() {
    if (currentTens !== null && currentOnes !== null) {
      const n = currentTens * 10 + currentOnes;
      finalEl.textContent = String(n);
      explainEl.innerHTML = `<strong>${currentTens}</strong> tens + <strong>${currentOnes}</strong> ones = <strong>${n}</strong>`;
    } else {
      finalEl.textContent = "—";
      explainEl.textContent = "Pick tens, then ones.";
    }
  }

  function clearCastle() {
    currentTens = null;
    currentOnes = null;
    selectingTens = true;
    tensEl.textContent = "?";
    onesEl.textContent = "?";
    coachEl.hidden = true;
    coachEl.innerHTML = "";
    updateFinal();
  }

  function newChallenge() {
    targetNumber = Math.floor(Math.random() * 90) + 10;
    local = { ...local, activeChallenge: targetNumber };
    patchState({ castleProgress: { ...local } });
  }

  function selectDigit(num) {
    if (selectingTens) {
      currentTens = num;
      tensEl.textContent = String(num);
      selectingTens = false;
      explainEl.textContent = "Great! Now choose the ones digit.";
    } else {
      currentOnes = num;
      onesEl.textContent = String(num);
      selectingTens = true;
      updateFinal();
    }
  }

  function showCoach(correct, userNumber) {
    const { explain, shortcut } = coachingFor(targetNumber, userNumber, correct);
    coachEl.hidden = false;
    coachEl.innerHTML = `
      <p><strong>${correct ? "Correct! ✅" : "Keep trying 💪"}</strong></p>
      <p><strong>Simple explanation:</strong> ${explain}</p>
      <p><strong>Brain shortcut:</strong> ${shortcut}</p>
    `;
  }

  function checkAnswer() {
    if (currentTens === null || currentOnes === null) {
      showCoach(false, NaN);
      coachEl.querySelector("p").innerHTML = "<strong>Fill both towers first!</strong> Choose tens, then ones.";
      coachEl.hidden = false;
      return;
    }
    const userNumber = currentTens * 10 + currentOnes;
    const correct = userNumber === targetNumber;
    showCoach(correct, userNumber);

    if (correct) {
      local.score += 10;
      local.lessonProgress = Math.min(100, local.lessonProgress + 10);
      let badgeId = null;
      if (local.lessonProgress >= 100) {
        local.level += 1;
        local.lessonProgress = 0;
        badgeId = `castle-level-${local.level}`;
      }
      persistCastleProgress(5, badgeId);
      updateDisplays();
      window.setTimeout(() => {
        const fresh = loadState();
        const cp = getCastleProgress(fresh);
        const nextT = Math.floor(Math.random() * 90) + 10;
        patchState({ castleProgress: { ...cp, activeChallenge: nextT } });
      }, 2200);
    }
  }

  for (let n = 0; n <= 9; n += 1) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "castle-num-btn";
    b.textContent = String(n);
    b.setAttribute("aria-label", `Digit ${n}`);
    b.addEventListener("click", () => selectDigit(n));
    keypad.appendChild(b);
  }

  wrap.querySelector("#castleClear").addEventListener("click", clearCastle);
  wrap.querySelector("#castleNew").addEventListener("click", newChallenge);
  wrap.querySelector("#castleCheck").addEventListener("click", checkAnswer);

  function onKey(e) {
    const route = (location.hash || "#/").replace("#/", "");
    if (route !== ROUTE_ID) return;
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
    const n = Number.parseInt(e.key, 10);
    if (!Number.isNaN(n) && n >= 0 && n <= 9) selectDigit(n);
    if (e.key === "Enter") checkAnswer();
    if (e.key === "Escape") clearCastle();
  }

  window.addEventListener("keydown", onKey);
  keyboardCleanup = () => window.removeEventListener("keydown", onKey);

  setChallengeText();
  updateDisplays();
  updateFinal();

  return keyboardCleanup;
}
