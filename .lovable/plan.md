## Diagnosis

`ReadingModeScreen.tsx` builds a 5-layer stack:

- **Root** `<div>`: `position: fixed; background: bg` (paints theme `colors[0]`).
- **Layer 1** (`zIndex: 0`): `backgroundImage: url(${bgSrc})` — the village SVG.
- **Layer 2** (`zIndex: 1`): 12% black tint.
- **Layers 3–5** (`zIndex: 2–4`): transparent particle/bird overlays.
- **Content** (`zIndex: 10`).

The asset map in `src/lib/readingBackgrounds.ts` and the theme IDs in `useTheme.tsx` line up exactly (`idanha`, `marialva`, `piodao`, `almeida`, `trancoso`, `castelo-rod`, `belmonte`, `monsanto`, `sortelha`, `castelo-mendo`, `castelo-novo`, `linhares`, `claro`). `getReadingBackground` therefore always returns a valid Vite-imported URL, and the picker thumbnail in `SessionSetupSheet.tsx` proves those URLs resolve (`<img src={getReadingBackground(s.id)} />` renders fine).

So the SVGs exist, the URL resolves, and nothing opaque is layered on top. The only remaining explanation for "only particles, no village" is that **Layer 1's CSS `backgroundImage` never actually paints**. The most likely root causes, in order of probability:

1. **The `sceneBreathe` animation strips the image on the very first frame.** Layer 1 has `animation: sceneBreathe 18s ease-in-out infinite` and only `transformOrigin` set inline — no initial `transform`. On some Chromium/WebKit builds, an `animation` running on a `position:absolute; inset:0; zIndex:0` div with only `backgroundImage` (no width/height in pixels) can render at zero painted size until the first keyframe tick, and the SVG never appears at all because the box is treated as 0×0 by the compositor. Reproduces especially on Capacitor/Android WebView and in some desktop Chromium versions.
2. **`url(${bgSrc})` without quotes** — Vite produces hashed asset URLs that may contain characters (e.g. `?import`, `&`) that break unquoted `url(...)`. The picker uses `<img src=...>` so it bypasses this, which is why thumbnails work but the background doesn't.
3. **No fallback `backgroundColor` on Layer 1** — if the SVG ever fails to decode (slow asset, CSP block in Capacitor, etc.) the layer is fully transparent and the dark theme `bg` shows through unchanged, matching exactly what the user reports.

## Fix

Edit only `src/components/reading/ReadingModeScreen.tsx`, Layer 1 (lines ~187–201):

1. Swap the `<div>` with `backgroundImage` for an explicit `<img>` element (same approach as the working picker thumbnails). This guarantees the asset is requested and painted regardless of URL quoting or animation quirks.
2. Apply `position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; pointer-events: none` to the `<img>`.
3. Move the `sceneBreathe` / `reading-bg-pulse` animation onto the `<img>` itself with `transform: scale(1)` as the base style, so the first frame is defined before the animation starts.
4. Keep the `bg` colour on the root as a fallback while the SVG loads.

This removes both the CSS `url()` parsing risk and the zero-size-box risk, and matches the rendering technique already proven to work in `SessionSetupSheet.tsx`.

No other files need to change — the SVGs, the theme mapping, and the asset map are all correct.

### Verification

After the edit, open a reading session on any theme (e.g. Sortelha or Monsanto). The village silhouette, sun and gradient sky must appear behind the book cover and timer, with particles/birds animating on top.
