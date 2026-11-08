# AGENTS.md

## Project

**Thumbnail Maker** is a small React app (Vite + `<canvas>`) for creating YouTube
thumbnails **without AI**. The user uploads their own photo, adds text, and
downloads a 1280×720 PNG. Everything runs in the browser.

Main code: `src/App.jsx` (editor + canvas drawing), `src/index.css` (styles).

## Setup and verification

Always use **pnpm**, never npm or yarn.

```bash
pnpm install     # install dependencies
pnpm dev         # run locally at http://localhost:5173
pnpm lint        # must pass with no warnings
pnpm build       # must pass
```

There is no automated test suite yet. Until there is one, verify changes
manually in `pnpm dev`: upload a photo, type short and very long text, and
download the PNG. Do not claim something is tested if it was not run.

## Rules

### 1. English only
**Applies to:** UI strings, code, comments, README, commit messages, PRs.
**Why:** the project is published in an English-language community and
mixed languages make it inconsistent.

### 2. pnpm only
**Applies to:** all install, run and CI commands, docs, and lockfiles.
**Why:** one package manager keeps the lockfile reproducible. Never commit
`package-lock.json` or `yarn.lock`.

### 3. Text must always fit inside the thumbnail
**Applies to:** any code that draws text on the canvas (`drawThumbnail`).
**Why:** long text once overflowed the edges and was cut off in the exported
image. Wrap text with `wrapLines` (or equivalent) and never draw a line
wider than the canvas safe area. Check with a very long sentence and a very
long single word.

### 4. Async work must be safe against stale results and leaks
**Applies to:** image loading, file handling, blob/object URLs.
**Why:** a slower, older image load once overwrote a newer selection, and a
blob URL was revoked before the download started. Ignore results from
superseded loads, always revoke object URLs, and delay revoking a download
URL until the browser has started the download.

### 5. No AI and no uploads: the user's photo never leaves the browser
**Applies to:** new features, dependencies, and network calls.
**Why:** the product promise is "no AI, just you". Do not add AI image
generation, third-party APIs, analytics, or any code that sends the user's
image to a server. Flag any new network request in review.

### 6. Use the design tokens in `src/index.css`
**Applies to:** all styling.
**Why:** the neo-brutalist look (thick `var(--ink)` borders, hard shadows,
Caveat Brush / Patrick Hand fonts) only works if it stays consistent. Use the
CSS variables (`--ink`, `--pink`, `--blue`, `--green`, `--paper`) instead of
new hard-coded colors, and do not add new fonts or shadow styles.

## Pull requests
- Keep each PR focused on one capability.
- Run `pnpm lint` and `pnpm build` before pushing.
- End commits with the co-author trailer used in this repo.
