# Poem × Palette × Painting

A single-page web experience that weaves together a random poem, a harmonious colour palette, and a matching work of art — all connected by a shared emotional hue.

<img width="1122" height="774" alt="image" src="https://github.com/user-attachments/assets/311266c9-1aa7-48dd-9d0d-d4ab7d3836e5" />

---

## How it works

Each click of **Generate** runs a four-step pipeline:

1. **Poem** — A random poem is fetched from [PoetryDB](https://poetrydb.org/).
2. **Sentiment scoring** — Every word in the poem is scored against nine hand-tuned emotional clusters (Dark, Joy, Contemplation, Spring, Summer, Autumn, Winter, Love, Spiritual). The winning cluster — and any strong runner-up — determines an *anchor colour* expressed in HSL.
3. **Palette** — The anchor colour is sent to the [Colormind](http://colormind.io/) AI palette generator, which returns five harmonious RGB values. If Colormind is unavailable (it is HTTP-only and may be blocked by mixed-content rules), an algorithmic fallback generates a palette by rotating the hue ±30°/60° from the anchor.
4. **Painting** — The anchor hue is used to query the [Art Institute of Chicago public API](https://api.artic.edu/docs/), searching for artworks whose dominant colour falls within ±20° of the anchor. A result is picked at random from the matches; if the narrow range is empty, the search widens automatically before falling back to any painting with an image.

All three results are rendered together — poem on the left, painting on the right, palette spanning the full width below — creating a triptych that shares a common emotional and chromatic identity.

---

## Sentiment clusters

| Cluster | Anchor hue | Poet touchstone |
|---|---|---|
| Dark / Grief / Death | Deep violet | Poe |
| Warm / Joy / Celebration | Golden yellow | Whitman |
| Cool / Calm / Contemplation | Steel blue | Stevens & cummings |
| Spring | Fresh green | Hopkins |
| Summer | Deep green | Clare |
| Autumn | Burnt orange | Keats |
| Winter | Pale blue | Frost |
| Love / Longing / Passion | Deep rose | Neruda & cummings |
| Spiritual / Wonder | Soft purple | Blake & Rumi |

When the poem scores strongly in two clusters, the anchor colour is blended — 70% winner, 30% runner-up — and both labels appear in the UI.

---

## APIs used

| Service | Purpose | Docs |
|---|---|---|
| [PoetryDB](https://poetrydb.org/) | Random poem | [github.com/thundercomb/poetrydb](https://github.com/thundercomb/poetrydb) |
| [Colormind](http://colormind.io/) | AI-generated colour palette | [colormind.io/api](http://colormind.io/api/) |
| [Art Institute of Chicago](https://api.artic.edu/) | Painting search by dominant hue | [api.artic.edu/docs](https://api.artic.edu/docs/) |

All APIs are free and require no key.

> **Note on Colormind:** Colormind is served over plain HTTP. Browsers running the page on an `https://` origin will block the request as mixed content. The app detects this and silently falls back to an algorithmic palette, so the experience is unaffected.

---

## Running locally

No build step, no dependencies. Just serve the files from any static server.

**Using the VS Code Live Server extension** — right-click `index.html` → *Open with Live Server*.

**Using Node.js `serve`:**
```bash
npx serve .
```

**Using Python:**
```bash
# Python 3
python -m http.server 8080
```

Then open `http://localhost:8080` in your browser.

> Opening `index.html` directly as a `file://` URL will not work because `app.js` uses ES modules (`import`/`export`), which require an HTTP context.

---

## Project structure

```
poem-palette-painting/
├── index.html          # Markup and layout
├── style.css           # All styles (custom properties, responsive grid)
├── app.js              # Application logic and API calls
└── data/
    └── sentiment.js    # Nine emotional clusters with keyword weights and anchor colours
```

The project is intentionally zero-dependency — pure HTML, CSS, and vanilla JS with ES modules. No framework, no bundler, no `node_modules`.

---

## License

[MIT](LICENSE)
