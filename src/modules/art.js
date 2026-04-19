export function renderArtPad(container, state, setState, theme) {
  const promptsByTheme = {
    kindness: [
      "Draw a picture of helping someone.",
      "Draw two friends sharing a toy.",
      "Draw a thank-you card."
    ],
    nature: [
      "Draw your favorite tree and sky.",
      "Draw three different leaves.",
      "Draw a tiny garden with flowers."
    ],
    friendship: [
      "Draw you and a friend playing together.",
      "Draw a team working on a project.",
      "Draw a friendship high-five moment."
    ],
    learning: [
      "Draw one new thing you learned today.",
      "Draw your dream classroom.",
      "Draw a science fact as a picture."
    ]
  };
  const themePrompts = promptsByTheme[theme] || promptsByTheme.learning;
  const chosenPrompt = themePrompts[Math.floor(Math.random() * themePrompts.length)];

  const section = document.createElement("section");
  section.className = "activity-box";
  section.innerHTML = `
    <h3>🎨 Art Studio</h3>
    <p class="activity-help"><strong>Art Mission:</strong> <span id="artPrompt">${chosenPrompt}</span></p>
    <div class="row">
      <button type="button" id="newPromptBtn">New Mission</button>
    </div>
    <div class="art-controls">
      <label>Color <input type="color" id="colorPicker" value="#7cb342" aria-label="Brush color"></label>
      <label>Size <input type="range" id="sizePicker" min="2" max="20" value="6" aria-label="Brush size"></label>
      <button type="button" id="undoBtn">Undo</button>
      <button type="button" id="clearBtn">Clear</button>
      <button type="button" id="saveBtn">Save to My Gallery</button>
      <button type="button" id="doneBtn">I Finished This Mission</button>
    </div>
    <canvas id="drawCanvas" width="600" height="320" aria-label="Drawing canvas"></canvas>
    <p id="artMessage" aria-live="polite"></p>
    <div id="gallery" class="gallery"></div>
  `;
  container.appendChild(section);

  const canvas = section.querySelector("#drawCanvas");
  const ctx = canvas.getContext("2d");
  const colorPicker = section.querySelector("#colorPicker");
  const sizePicker = section.querySelector("#sizePicker");
  const gallery = section.querySelector("#gallery");
  const artPrompt = section.querySelector("#artPrompt");
  const artMessage = section.querySelector("#artMessage");
  const strokes = [];
  let drawing = false;
  let currentStroke = [];

  function renderGallery() {
    const items = state.drawings.filter((item) => item.theme === theme);
    gallery.innerHTML = items.length
      ? items.map((item) => `<img alt="Saved drawing" src="${item.data}" />`).join("")
      : "<p>No saved art yet. Make one now!</p>";
  }

  function startDraw(x, y) {
    drawing = true;
    currentStroke = [{ x, y, color: colorPicker.value, size: Number(sizePicker.value) }];
  }

  function drawTo(x, y) {
    if (!drawing) return;
    const last = currentStroke[currentStroke.length - 1];
    const color = colorPicker.value;
    const size = Number(sizePicker.value);
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    currentStroke.push({ x, y, color, size });
  }

  function endDraw() {
    if (!drawing) return;
    drawing = false;
    if (currentStroke.length > 1) strokes.push(currentStroke);
  }

  canvas.addEventListener("pointerdown", (e) => startDraw(e.offsetX, e.offsetY));
  canvas.addEventListener("pointermove", (e) => drawTo(e.offsetX, e.offsetY));
  canvas.addEventListener("pointerup", endDraw);
  canvas.addEventListener("pointerleave", endDraw);

  section.querySelector("#newPromptBtn").addEventListener("click", () => {
    const nextPrompt = themePrompts[Math.floor(Math.random() * themePrompts.length)];
    artPrompt.textContent = nextPrompt;
    artMessage.textContent = "";
  });

  section.querySelector("#clearBtn").addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokes.length = 0;
  });

  section.querySelector("#undoBtn").addEventListener("click", () => {
    strokes.pop();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokes.forEach((stroke) => {
      for (let i = 1; i < stroke.length; i += 1) {
        const a = stroke[i - 1];
        const b = stroke[i];
        ctx.strokeStyle = b.color;
        ctx.lineWidth = b.size;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    });
  });

  section.querySelector("#saveBtn").addEventListener("click", () => {
    const shot = canvas.toDataURL("image/png");
    const drawings = [...state.drawings, { data: shot, theme, createdAt: Date.now() }];
    const capped = drawings.slice(-10);
    setState({ ...state, drawings: capped, smiles: state.smiles + 2 });
    artMessage.textContent = "Saved to your gallery! Great creativity!";
  });

  section.querySelector("#doneBtn").addEventListener("click", () => {
    if (!strokes.length) {
      artMessage.textContent = "Draw something first, then mark mission done.";
      return;
    }
    const missionKey = `${theme}:art:${new Date().toISOString().slice(0, 10)}`;
    if (state.gameProgress[missionKey]) {
      artMessage.textContent = "Mission already completed today. Try a new one tomorrow!";
      return;
    }
    const next = structuredClone(state);
    next.gameProgress[missionKey] = true;
    next.smiles += 3;
    if (!next.badges.includes(`${theme}-art-star`)) {
      next.badges.push(`${theme}-art-star`);
    }
    setState(next);
    artMessage.textContent = "Mission complete! You earned smiles and an art badge!";
  });

  renderGallery();
}
