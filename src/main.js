import "./styles.css";
import { registerSW } from "virtual:pwa-register";
import { loadState, patchStateSilent, saveState } from "./modules/storage.js";
import { syncWizardHeader } from "./modules/headerSync.js";
import { disposeCastleKeyboard, renderMagicalNumberCastle } from "./modules/magicalNumberCastle.js";
import { renderCurriculumAdventure } from "./modules/curriculumAdventure.js";
import { renderKindness } from "./modules/kindness.js";
import { renderNature } from "./modules/nature.js";
import { renderFriendship } from "./modules/friendship.js";
import { renderLearning } from "./modules/learning.js";

registerSW();

const app = document.querySelector("#app");
let state = loadState();
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setState(next) {
  state = next;
  saveState(state);
  render();
}

function renderCastlePage(content) {
  const bandLabel = state.yearBand === "y3" ? "Year 3" : "Year 2";
  content.innerHTML = `
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <a href="#/">Home</a> <span>/</span> <strong>Math</strong> <span>/</span> <strong>Place value</strong>
    </nav>
    <section class="theme-hero">
      <h2>🏰 Magical Number Castle</h2>
      <p>Year 2 place value • Companion mode: ${bandLabel}</p>
    </section>
    <div class="row">
      <a class="fun-button" href="#/">🏠 Home</a>
      <a class="fun-button" href="#/learning">📚 Learning room</a>
    </div>
    <main id="castleRoot" tabindex="-1"></main>
  `;
  const root = content.querySelector("#castleRoot");
  renderMagicalNumberCastle(root, state);
}

function renderAdventurePage(content) {
  const bandLabel = state.yearBand === "y3" ? "Year 3" : "Year 2";
  content.innerHTML = `
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <a href="#/">Home</a> <span>/</span> <strong>Curriculum Adventure</strong>
    </nav>
    <section class="theme-hero">
      <h2>🧙 Curriculum Adventure Academy</h2>
      <p>All planned phases in one place • Companion mode: ${bandLabel}</p>
    </section>
    <div class="row">
      <a class="fun-button" href="#/">🏠 Home</a>
      <a class="fun-button" href="#/math/year2/place-value">🏰 Number Castle</a>
    </div>
    <main id="academyRoot" tabindex="-1"></main>
  `;
  const root = content.querySelector("#academyRoot");
  renderCurriculumAdventure(root, state);
}

function onGlobalClick(e) {
  const base = loadState();
  patchStateSilent({ smiles: base.smiles + 1 });
  state = loadState();
  syncWizardHeader();
  if (reducedMotion) return;
  const smile = document.createElement("div");
  smile.className = "floating-smile";
  smile.textContent = "😊";
  smile.style.left = `${e.clientX}px`;
  smile.style.top = `${e.clientY}px`;
  document.body.appendChild(smile);
  setTimeout(() => smile.remove(), 900);
}

function themeMeta() {
  return [
    {
      key: "kindness",
      icon: "💝",
      title: "Kindness & PSHE",
      copy: "Stories and habits that match kindness and wellbeing learning."
    },
    {
      key: "nature",
      icon: "🌱",
      title: "Science & Geography Outdoors",
      copy: "Plants, habitats, and observing the world like a young scientist."
    },
    {
      key: "friendship",
      icon: "👫",
      title: "Speaking & Listening",
      copy: "Friendly communication skills for classroom and playground life."
    },
    {
      key: "learning",
      icon: "📚",
      title: "English & Maths Boost",
      copy: "Reading, spelling, and number practice in tiny joyful bursts."
    }
  ];
}

function curriculumMap(yearBand) {
  if (yearBand === "y3") {
    return [
      {
        subject: "English",
        focus: "Paragraphs, inference, prefixes/suffixes, speech punctuation",
        room: "📚 English & Maths Boost"
      },
      {
        subject: "Mathematics",
        focus: "3-digit numbers, 3/4/8 tables, fractions, perimeter, measure",
        room: "📚 English & Maths Boost"
      },
      {
        subject: "Science",
        focus: "Plants, rocks, light, forces and magnets, nutrition",
        room: "🌱 Science & Geography Outdoors"
      },
      {
        subject: "PSHE & Speaking",
        focus: "Respectful talk, listening, teamwork and conflict resolution",
        room: "👫 Speaking & Listening"
      },
      {
        subject: "Structured Phase Path",
        focus: "4 guided phases: place value, calculation, English writing, and science review",
        room: "🧙 Curriculum Adventure Academy"
      }
    ];
  }
  return [
    {
      subject: "English",
      focus: "Phonics fluency, simple punctuation, suffixes and sentence writing",
      room: "📚 English & Maths Boost"
    },
    {
      subject: "Mathematics",
      focus: "Number to 100, 2/5/10 tables, time, money, simple fractions",
      room: "📚 English & Maths Boost"
    },
    {
      subject: "Science",
      focus: "Plants, habitats, animals and materials",
      room: "🌱 Science & Geography Outdoors"
    },
    {
      subject: "PSHE & Speaking",
      focus: "Kindness, sharing, turn-taking, polite classroom language",
      room: "💝 Kindness & PSHE"
    },
    {
      subject: "Structured Phase Path",
      focus: "4 guided phases: place value, calculation, English writing, and science review",
      room: "🧙 Curriculum Adventure Academy"
    }
  ];
}

function renderHome(content) {
  const yearLabel = state.yearBand === "y3" ? "Year 3" : "Year 2";
  const mapCards = curriculumMap(state.yearBand);
  content.innerHTML = `
    <section class="play-hub">
      <p class="hub-kicker">🎮 Play + Learn Hub</p>
      <h2>Pick a Room and Start a Challenge!</h2>
        <div class="hub-actions">
        <a class="hub-pill" href="#/kindness">💝 Kindness Quest</a>
        <a class="hub-pill" href="#/nature">🌱 Nature Quest</a>
        <a class="hub-pill" href="#/friendship">👫 Team Quest</a>
        <a class="hub-pill" href="#/learning">📚 Brain Quest</a>
        <a class="hub-pill hub-pill--featured" href="#/math/year2/place-value">🏰 Number Castle (Y2 maths)</a>
        <a class="hub-pill hub-pill--featured" href="#/academy/phases">🧙 Curriculum Adventure (All phases)</a>
      </div>
    </section>

    <section class="layan-intro">
      <h2>Hi! I'm Layan! 😊</h2>
      <p>
        This mansion is a gentle learning companion for Arcadia School pupils in
        <strong>${yearLabel}</strong>, using ideas from the
        <strong>England national curriculum</strong> (reading, writing, maths, science, and more),
        without replacing your teachers or homework.
      </p>
      <div class="row">
        <label>
          Choose year band
          <select id="yearBand" aria-label="Choose Year 2 or Year 3 companion mode">
            <option value="y2" ${state.yearBand === "y2" ? "selected" : ""}>Year 2 (end of Key Stage 1)</option>
            <option value="y3" ${state.yearBand === "y3" ? "selected" : ""}>Year 3 (start of Key Stage 2)</option>
          </select>
        </label>
      </div>
    </section>

    <section class="curriculum-map">
      <h3>🧭 Curriculum Companion Map (${yearLabel})</h3>
      <p class="activity-help">
        Quick parent-friendly overview of how each room supports key UK objectives.
      </p>
      <div class="map-grid">
        ${mapCards.map((item) => `
          <article class="map-card" aria-label="${item.subject} curriculum support">
            <h4>${item.subject}</h4>
            <p><strong>Focus:</strong> ${item.focus}</p>
            <p><strong>Room:</strong> ${item.room}</p>
          </article>
        `).join("")}
      </div>
    </section>

    <section class="themes-grid">
      ${themeMeta().map((theme) => `
        <a href="#/${theme.key}" class="theme-card ${theme.key}" aria-label="Open ${theme.title}">
          <span class="theme-icon">${theme.icon}</span>
          <h3 class="theme-title">${theme.title}</h3>
          <p>${theme.copy}</p>
          <p class="mini-tags">Stories 📖 · Challenges 🏆 · Games 🎮 · Art 🎨</p>
        </a>
      `).join("")}
    </section>
  `;
  content.querySelector("#yearBand").addEventListener("change", (e) => {
    const value = e.target.value === "y3" ? "y3" : "y2";
    setState({ ...state, yearBand: value });
  });
}

function renderTheme(content, themeKey) {
  const label = themeMeta().find((t) => t.key === themeKey)?.title || themeKey;
  const bandLabel = state.yearBand === "y3" ? "Year 3" : "Year 2";
  content.innerHTML = `
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <a href="#/">Home</a> <span>/</span> <strong>${label}</strong>
    </nav>
    <section class="theme-hero">
      <h2>${label}</h2>
      <p>Activities tuned for ${bandLabel}. Choose tasks, earn smiles, and grow step by step.</p>
    </section>
    <div class="row">
      <a class="fun-button" href="#/">🏠 Home</a>
      <button type="button" class="fun-button" id="focusMain">Jump to activities</button>
    </div>
    <main id="themeMain" tabindex="-1"></main>
  `;
  const themeMain = content.querySelector("#themeMain");
  if (themeKey === "kindness") renderKindness(themeMain, state, setState);
  if (themeKey === "nature") renderNature(themeMain, state, setState);
  if (themeKey === "friendship") renderFriendship(themeMain, state, setState);
  if (themeKey === "learning") renderLearning(themeMain, state, setState);
  content.querySelector("#focusMain").addEventListener("click", () => themeMain.focus());
}

function render() {
  state = loadState();
  const hash = location.hash || "#/";
  const route = hash.replace("#/", "");
  if (route !== "math/year2/place-value") disposeCastleKeyboard();
  const badges = state.badges.slice(-8);
  const bandLabel = state.yearBand === "y3" ? "Year 3" : "Year 2";
  app.innerHTML = `
    <div class="magic-bg"></div>
    <div class="container">
      <div class="top-nav">
        <a href="#/" class="brand-badge" aria-label="Go to Wizard Mansion home">🏰 Wizard Mansion</a>
        <div class="top-nav-links">
          <a href="#/kindness">Kindness</a>
          <a href="#/nature">Nature</a>
          <a href="#/friendship">Friendship</a>
          <a href="#/learning">Learning</a>
          <a href="#/math/year2/place-value">🏰 Castle</a>
          <a href="#/academy/phases">🧙 Phases</a>
        </div>
      </div>
      <header class="header">
        <h1 class="title">🏰 Layan's Wizard Mansion for Learning 🪄</h1>
        <p class="subtitle">A gentle companion for Arcadia School — England curriculum ideas for ${bandLabel}.</p>
        <div class="status-bar">
          <p>Smiles: <strong id="wizardSmileCount">${state.smiles}</strong> 😊</p>
          <p>Badges: <span id="wizardBadges">${badges.length ? badges.map((b) => `<span class="badge">${b}</span>`).join("") : "No badges yet"}</span></p>
          <p>Companion mode: <strong>${bandLabel}</strong></p>
        </div>
      </header>
      <div id="content"></div>
      <footer class="footer">
        <p>Made with 💕 by Layan, age 7</p>
      </footer>
    </div>
  `;
  const content = app.querySelector("#content");
  if (!route) renderHome(content);
  else if (route === "math/year2/place-value") renderCastlePage(content);
  else if (route === "academy/phases") renderAdventurePage(content);
  else if (["kindness", "nature", "friendship", "learning"].includes(route)) renderTheme(content, route);
  else renderHome(content);
}

window.addEventListener("hashchange", render);
window.addEventListener("wizard-storage-update", render);
document.addEventListener("click", onGlobalClick);
render();
