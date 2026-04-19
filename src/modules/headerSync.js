import { loadState } from "./storage.js";

/** Update status bar without full app render (after silent saves). */
export function syncWizardHeader() {
  const s = loadState();
  const smileEl = document.getElementById("wizardSmileCount");
  if (smileEl) smileEl.textContent = String(s.smiles);
  const badgeEl = document.getElementById("wizardBadges");
  if (badgeEl) {
    const recent = s.badges.slice(-8);
    badgeEl.innerHTML = recent.length
      ? recent.map((b) => `<span class="badge">${b}</span>`).join("")
      : "No badges yet";
  }
}
