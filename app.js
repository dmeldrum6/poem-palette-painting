import { clusters, fallbackColor } from './data/sentiment.js';

// ============================================================
// DOM REFERENCES
// ============================================================

const generateBtn    = document.getElementById('generateBtn');
const loadingOverlay = document.getElementById('loadingOverlay');
const contentGrid    = document.getElementById('contentGrid');
const poemTitle      = document.getElementById('poemTitle');
const poemAuthor     = document.getElementById('poemAuthor');
const poemLines      = document.getElementById('poemLines');
const paintingFrame  = document.getElementById('paintingFrame');
const paintingImage  = document.getElementById('paintingImage');
const paintingTitle  = document.getElementById('paintingTitle');
const paintingArtist = document.getElementById('paintingArtist');
const clusterLabel   = document.getElementById('clusterLabel');
const paletteSwatches= document.getElementById('paletteSwatches');
const errorMessage   = document.getElementById('errorMessage');

// ============================================================
// 1. ENTRY POINT
// ============================================================

async function generate() {
  setLoading(true);
  hideError();

  try {
    // Step 1: fetch poem
    const poem = await fetchPoem();

    // Step 2: score poem text → anchor color
    const fullText = [poem.title, ...poem.lines].join(' ');
    const scoreResult = scorePoemText(fullText);
    const anchorHSL = deriveAnchorColor(scoreResult);

    // Step 3: render poem immediately (fast, no API)
    renderPoem(poem);
    renderClusterLabel(scoreResult.winner, scoreResult.runnerUp);

    // Step 4: fetch palette + painting in parallel, independently so a
    // painting failure doesn't prevent the palette from rendering
    const [paletteResult, paintingResult] = await Promise.allSettled([
      fetchPalette(anchorHSL),
      fetchPainting(anchorHSL)
    ]);

    if (paletteResult.status === 'fulfilled') {
      renderPalette(paletteResult.value);
    }

    if (paintingResult.status === 'fulfilled') {
      renderPainting(paintingResult.value, anchorHSL);
    } else {
      throw paintingResult.reason;
    }

  } catch (err) {
    console.error('Generate error:', err);
    showError(err.message || 'Something went wrong — please try again.');
  } finally {
    setLoading(false);
  }
}

// ============================================================
// 2. FETCH POEM
// ============================================================

async function fetchPoem() {
  const res = await fetch('https://poetrydb.org/random');
  if (!res.ok) throw new Error("Couldn't reach the poetry library — try again.");
  const data = await res.json();
  const poem = Array.isArray(data) ? data[0] : data;
  if (!poem || !poem.lines) throw new Error('Unexpected response from poetry library.');
  return {
    title: poem.title || 'Untitled',
    author: poem.author || 'Anonymous',
    lines: poem.lines
  };
}

// ============================================================
// 3. SCORE POEM TEXT
// ============================================================

function scorePoemText(text) {
  const words = tokenize(text);
  const scores = {};

  for (const [clusterName, cluster] of Object.entries(clusters)) {
    let total = 0;
    for (const word of words) {
      if (cluster.keywords[word]) {
        total += cluster.keywords[word];
      }
    }
    scores[clusterName] = total;
  }

  // Find winner
  let winnerName = null;
  let winnerScore = 0;
  for (const [name, score] of Object.entries(scores)) {
    if (score > winnerScore) {
      winnerScore = score;
      winnerName = name;
    }
  }

  // No matches — use fallback
  if (!winnerName || winnerScore === 0) {
    return { winner: null, runnerUp: null, scores };
  }

  // Find runner-up (≥40% of winner's score, different cluster)
  let runnerUpName = null;
  let runnerUpScore = 0;
  const threshold = winnerScore * 0.4;

  for (const [name, score] of Object.entries(scores)) {
    if (name === winnerName) continue;
    if (score >= threshold && score > runnerUpScore) {
      runnerUpScore = score;
      runnerUpName = name;
    }
  }

  return {
    winner: { name: winnerName, cluster: clusters[winnerName], score: winnerScore },
    runnerUp: runnerUpName
      ? { name: runnerUpName, cluster: clusters[runnerUpName], score: runnerUpScore }
      : null,
    scores
  };
}

// ============================================================
// 4. DERIVE ANCHOR COLOR
// ============================================================

function deriveAnchorColor(scoreResult) {
  if (!scoreResult.winner) return { ...fallbackColor };

  const primary = scoreResult.winner.cluster.color;

  if (!scoreResult.runnerUp) return { ...primary };

  const secondary = scoreResult.runnerUp.cluster.color;
  return blendHSL(primary, secondary, 0.3);
}

// ============================================================
// 5. FETCH PALETTE
// ============================================================

async function fetchPalette(anchorHSL) {
  const rgb = hslToRgb(anchorHSL.h, anchorHSL.s, anchorHSL.l);

  // Try HTTPS first, fall back to algorithm if unavailable
  try {
    const res = await fetch('https://colormind.io/api/', {
      method: 'POST',
      body: JSON.stringify({
        model: 'default',
        input: [rgb, 'N', 'N', 'N', 'N']
      })
    });
    if (!res.ok) throw new Error('Colormind returned non-OK status');
    const data = await res.json();
    if (!data.result || !Array.isArray(data.result)) throw new Error('Unexpected Colormind response');
    return data.result; // array of 5 [r, g, b]
  } catch (err) {
    // Fallback: generate harmonious palette algorithmically
    console.warn('Colormind unavailable, using generated palette:', err.message);
    return generateFallbackPalette(anchorHSL);
  }
}

// Algorithmic fallback palette: 5 colors by rotating hue ±30/60 from anchor
function generateFallbackPalette(anchorHSL) {
  const { h, s, l } = anchorHSL;
  const offsets = [
    { dh: -60, ds: 0,   dl: +10 },
    { dh: -30, ds: +5,  dl: -5  },
    { dh:   0, ds:  0,  dl:  0  }, // anchor itself
    { dh: +30, ds: -5,  dl: +8  },
    { dh: +60, ds: +10, dl: -10 }
  ];
  return offsets.map(({ dh, ds, dl }) => {
    const nh = ((h + dh) % 360 + 360) % 360;
    const ns = Math.min(100, Math.max(0, s + ds));
    const nl = Math.min(95,  Math.max(10, l + dl));
    return hslToRgb(nh, ns, nl);
  });
}

// ============================================================
// 6. FETCH PAINTING
// ============================================================

async function fetchPainting(anchorHSL) {
  const { h } = anchorHSL;
  const range = 20;

  // Handle hue wraparound
  const minH = h - range;
  const maxH = h + range;

  let url;
  if (minH < 0 || maxH > 360) {
    // Hue wraps around — use a wider search to avoid complex dual-query logic
    const wrappedMin = ((minH % 360) + 360) % 360;
    const wrappedMax = ((maxH % 360) + 360) % 360;

    if (minH < 0) {
      // e.g. anchor=10, range wraps: search 350-360 OR 0-30
      // Fetch two sets and merge
      const [resA, resB] = await Promise.all([
        fetchArticResults(wrappedMin, 360),
        fetchArticResults(0, wrappedMax)
      ]);
      const combined = [...resA, ...resB];
      if (combined.length === 0) throw new Error("Couldn't reach the museum — try again.");
      return pickRandom(combined);
    } else {
      // maxH > 360
      const [resA, resB] = await Promise.all([
        fetchArticResults(minH, 360),
        fetchArticResults(0, wrappedMax)
      ]);
      const combined = [...resA, ...resB];
      if (combined.length === 0) throw new Error("Couldn't reach the museum — try again.");
      return pickRandom(combined);
    }
  } else {
    const results = await fetchArticResults(minH, maxH);
    if (results.length === 0) {
      // Widen search if nothing found
      const wider = await fetchArticResults(
        Math.max(0, h - 40),
        Math.min(360, h + 40)
      );
      if (wider.length === 0) throw new Error("Couldn't reach the museum — try again.");
      return pickRandom(wider);
    }
    return pickRandom(results);
  }
}

async function fetchArticResults(minH, maxH) {
  // Use POST with JSON body so Elasticsearch query brackets aren't percent-encoded
  const res = await fetch('https://api.artic.edu/api/v1/artworks/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: 'painting',
      query: {
        bool: {
          filter: [
            { range: { color_h: { gte: Math.round(minH), lte: Math.round(maxH) } } },
            { exists: { field: 'image_id' } }
          ]
        }
      },
      fields: ['id', 'title', 'artist_display', 'date_display', 'image_id', 'color'],
      limit: 10
    })
  });
  if (!res.ok) throw new Error("Couldn't reach the museum — try again.");
  const data = await res.json();
  // Filter to only artworks that actually have an image_id
  return (data.data || []).filter(a => a.image_id);
}

// ============================================================
// 7. RENDER FUNCTIONS
// ============================================================

function renderPoem(poem) {
  poemTitle.textContent = poem.title;
  poemAuthor.textContent = poem.author;
  poemLines.innerHTML = poem.lines
    .map(line => `<p>${escapeHtml(line) || '&nbsp;'}</p>`)
    .join('');
}

function renderPalette(colors) {
  paletteSwatches.innerHTML = '';
  colors.forEach(rgb => {
    const hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
    const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
    const textColor = brightness > 128 ? '#1a1814' : '#faf8f5';

    const swatch = document.createElement('div');
    swatch.className = 'swatch';
    swatch.style.background = hex;

    const hexLabel = document.createElement('span');
    hexLabel.className = 'swatch__hex';
    hexLabel.textContent = hex;
    hexLabel.style.color = textColor;

    swatch.appendChild(hexLabel);
    paletteSwatches.appendChild(swatch);
  });
}

function renderPainting(painting, anchorHSL) {
  // Set placeholder background color while image loads
  const { h, s, l } = anchorHSL;
  paintingFrame.style.background = `hsl(${h}, ${s}%, ${Math.min(l + 20, 90)}%)`;

  paintingTitle.textContent = painting.title || 'Untitled';
  paintingArtist.textContent = [painting.artist_display, painting.date_display]
    .filter(Boolean).join(' · ');

  // Build IIIF image URL
  const imgUrl = `https://www.artic.edu/iiif/2/${painting.image_id}/full/843,/0/default.jpg`;

  paintingImage.classList.remove('loaded');
  paintingImage.alt = painting.title || 'Museum painting';

  paintingImage.onload = () => paintingImage.classList.add('loaded');
  paintingImage.onerror = () => {
    paintingFrame.style.background = `hsl(${h}, ${s}%, ${Math.min(l + 20, 90)}%)`;
    paintingImage.alt = 'Image unavailable';
  };
  paintingImage.src = imgUrl;
}

function renderClusterLabel(winner, runnerUp) {
  if (!winner) {
    clusterLabel.innerHTML = '';
    return;
  }

  const { cluster } = winner;
  // Dot color = the cluster's color
  const { h, s, l } = cluster.color;
  const dotColor = `hsl(${h}, ${s}%, ${l}%)`;

  let labelText = `${cluster.label} &mdash; ${cluster.poet}`;
  if (runnerUp) {
    labelText += ` <span style="opacity:0.6">× ${runnerUp.cluster.label}</span>`;
  }

  clusterLabel.innerHTML = `
    <span class="cluster-label__dot" style="background:${dotColor}"></span>
    ${labelText}
  `;
}

// ============================================================
// 8. UTILITIES
// ============================================================

function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

function blendHSL(primary, secondary, secondaryWeight) {
  let hueDiff = secondary.h - primary.h;
  if (hueDiff > 180)  hueDiff -= 360;
  if (hueDiff < -180) hueDiff += 360;
  return {
    h: Math.round(primary.h + hueDiff * secondaryWeight),
    s: Math.round(primary.s + (secondary.s - primary.s) * secondaryWeight),
    l: Math.round(primary.l + (secondary.l - primary.l) * secondaryWeight)
  };
}

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 0);
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ============================================================
// UI STATE HELPERS
// ============================================================

function setLoading(isLoading) {
  generateBtn.disabled = isLoading;
  if (isLoading) {
    loadingOverlay.classList.add('visible');
    contentGrid.classList.remove('visible');
  } else {
    loadingOverlay.classList.remove('visible');
    contentGrid.classList.add('visible');
  }
}

function showError(msg) {
  errorMessage.textContent = msg;
  errorMessage.classList.add('visible');
  generateBtn.disabled = false;
}

function hideError() {
  errorMessage.textContent = '';
  errorMessage.classList.remove('visible');
}

// ============================================================
// BOOT
// ============================================================

generateBtn.addEventListener('click', generate);
generate(); // Load on page open
