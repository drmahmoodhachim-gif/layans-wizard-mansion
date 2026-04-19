# Layan's Wizard Mansion for Learning

A playful, kid-safe learning web app for ages 6-16, built with Vite + vanilla JS.

## Install

```bash
npm install
```

## Run locally

```bash
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy to Netlify

- Netlify uses `netlify.toml`:
  - Build command: `npm run build`
  - Publish directory: `dist`
- Or run from CLI:

```bash
netlify deploy --prod --dir=dist
```

## Add new story or quiz content

1. Open one of:
   - `src/data/kindness.json`
   - `src/data/nature.json`
   - `src/data/friendship.json`
   - `src/data/learning.json`
2. For stories, add another object to `stories` with:
   - `title`
   - `reflection`
   - `pages` (emoji + text)
3. For quizzes, add a new object in `game.questions` with:
   - `question`
   - `options`
   - `answer`
4. Save and redeploy.

## Safety

- No accounts
- No chat
- No analytics or trackers
- All progress stored only in browser localStorage
