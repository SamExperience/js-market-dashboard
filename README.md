# JS Market Dashboard

A lightweight, single-page cryptocurrency market dashboard built with vanilla JavaScript, Vite, and Tailwind CSS. It pulls live market data from the CoinGecko API, lets users search and filter coins, and drill into a detail view for price, market cap, and volume.

## 1. Overview

JS Market Dashboard is a small, dependency-light web app that demonstrates how far you can get with plain JavaScript and the DOM API before reaching for a framework. There is no React, Vue, or state management library involved — the entire UI is driven by a handful of functions that fetch data, filter it, and render it as HTML strings.

The project is intentionally scoped as a learning and portfolio exercise: it shows a clean separation between the API layer and the rendering layer, careful handling of loading/error/empty states, and defensive rendering against XSS, all without any build-time abstraction beyond Vite and Tailwind.

## 2. Features

- **Live market list** — fetches real-time coin data (price, market cap, 24h volume) from CoinGecko.
- **Search/filter** — instant, client-side filtering of the coin list by symbol as the user types.
- **Asset detail view** — click any coin to see an expanded view with formatted price, market cap, and volume.
- **Auto-refresh** — market data is re-fetched automatically every 60 seconds.
- **Volume filtering** — coins with less than $1,000,000 in 24h volume are filtered out to reduce noise from illiquid assets.
- **Currency formatting** — all monetary values are formatted with `Intl.NumberFormat` (`en-US`, USD).
- **XSS-safe rendering** — all API-sourced text is escaped before being injected into the DOM.
- **Responsive layout** — header and list layouts adapt from a stacked mobile view to a horizontal desktop view.

## 3. Tech Stack

| Layer         | Choice                                                        |
| ------------- | --------------------------------------------------------------|
| Build tool    | [Vite](https://vitejs.dev/) `^8.3.0`                           |
| Language      | Vanilla JavaScript (ES modules, `"type": "module"`)            |
| Styling       | [Tailwind CSS](https://tailwindcss.com/) `^4.3.3` via `@tailwindcss/vite` |
| Data source   | [CoinGecko API](https://www.coingecko.com/en/api) (public, no key required) |
| Documentation | [JSDoc](https://jsdoc.app/) `^4.0.5`                            |

No UI framework, router, state management library, charting library, or HTTP client is used — data fetching relies on the native `fetch` API.

## 4. Architecture

The app is deliberately framework-free and flat: there is no `components/`, `pages/`, or `hooks/` directory. Instead, responsibilities are split by concern into a small number of files:

- **`src/main.js`** — the application entry point and orchestrator. It renders the header/search UI, wires up event listeners, coordinates data fetching, filtering, and re-rendering, and toggles between the market list and asset detail views.
- **`src/services/marketApi.js`** — the API boundary. Encapsulates the single `fetch` call to the CoinGecko endpoint so the rest of the app never talks to `fetch` directly.
- **`src/market-data.js`** — a static sample dataset shaped like the CoinGecko response, useful as an offline reference or fallback during development (currently not wired into the app).
- **`src/style.css`** — Tailwind entry point (`@import "tailwindcss";`) plus a minimal reset.

This structure keeps the API layer swappable (a future migration to a different data provider only touches `marketApi.js`) while keeping the rendering logic simple enough not to need a component abstraction.

> This project started against the static dataset in `src/market-data.js` (Pass 1)
> and later moved to a live `fetch` call in `src/services/marketApi.js` (Pass 2) —
> the rendering code didn't need to change, which is the point of the split.

## 5. Data Flow

```
on load / every 60 seconds
        │
        ▼
 fetchCoins()  ──────►  CoinGecko /coins/markets endpoint
        │
        ▼
 filter: total_volume > 1,000,000
        │
        ▼
 renderMarketList(data)  ──► DOM (#market-list)
        │
        ▼
 user types in search box
        │
        ▼
 applyFilterAndRender(filteredData)  ──► client-side symbol match, no extra requests
        │
        ▼
 user clicks a coin
        │
        ▼
 renderAssetsDetail(coin)  ──► DOM (#asset-detail), list hidden until "Back" is pressed
```

Key points:

- Only one network round trip is made per refresh cycle; search and navigation are handled entirely in memory.
- There is no client-side router — the market list and asset detail views are two DOM sections toggled via the `hidden` attribute.
- There is no caching layer beyond the in-memory array held by `main.js` between refresh cycles.

## 6. API

The app consumes a single CoinGecko REST endpoint:

```
GET https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd
```

This is a public endpoint and does not require an API key. The request is wrapped by a single function:

```js
// src/services/marketApi.js
export async function fetchCoins() { ... }
```

`fetchCoins()` throws an `Error("API error: <status>")` on any non-2xx response and otherwise resolves with the parsed JSON array of coin objects. There is no retry logic, so a transient network failure surfaces directly as an error state in the UI (see below).

> **Note:** CoinGecko's public API is rate-limited. If you refresh the page rapidly during development, you may hit `429 Too Many Requests`.

## 7. Error Handling

The app treats loading, error, and empty-results as distinct UI states, each backed by its own DOM element toggled via `hidden`:

| State       | Element        | Trigger                                                             |
| ----------- | -------------- | -------------------------------------------------------------------- |
| Loading     | `#loading`     | Shown while `fetchCoins()` is in flight                              |
| Error       | `#error`       | Shown when the response is falsy ("No data available") or the fetch throws ("Unable to load market data.") |
| No results  | `#no-results`  | Shown when the search/filter yields an empty list                    |

`filterMarketData()` wraps the fetch in a `try/catch/finally` block so the loading indicator is always cleared regardless of outcome. Since this is a plain DOM app there are no error boundaries — errors are handled procedurally and reflected directly in the UI state.

All coin fields interpolated into HTML templates are passed through an `escapeHtml()` helper before being injected via `innerHTML`, protecting against XSS from unexpected API content.

## 8. Development

**Prerequisites:** Node.js 18+ (Node 20+ recommended) and npm.

```bash
# install dependencies
npm install

# copy the environment template and set your API URL
cp .env.example .env

# start the dev server
npm run dev

# build for production
npm run build

# preview the production build locally
npm run preview

# generate JSDoc HTML documentation into ./docs
npm run docs
```

There is currently no automated test suite or linter configured — see [Known Limitations](#11-known-limitations--next-steps).

## 9. Environment Variables

| Variable        | Required | Description                                                            | Example                                                                    |
| ---------------- | -------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------|
| `VITE_API_URL`   | Yes      | Full CoinGecko markets endpoint, including query params, read via `import.meta.env.VITE_API_URL` | `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd` |

Copy `.env.example` to `.env` and set `VITE_API_URL` before running the app. No API key is required for this endpoint.

## 10. Project Structure

```
js-market-dashboard/
├── index.html                  # Vite entry point, mounts #app, loads src/main.js
├── public/                     # Static assets (favicon, etc.)
├── src/
│   ├── main.js                 # App orchestrator: rendering, fetching, filtering, events
│   ├── market-data.js          # Static sample dataset (offline reference, currently unused)
│   ├── style.css               # Tailwind entry point + minimal reset
│   └── services/
│       └── marketApi.js        # API layer — fetchCoins()
├── docs/                       # Generated JSDoc output (gitignored, via `npm run docs`)
├── dist/                       # Production build output (gitignored)
├── .env.example                # Environment variable template
├── vite.config.js              # Vite + Tailwind plugin configuration
└── package.json
```

## 11. Known Limitations / Next Steps

This project favors simplicity over completeness. Current gaps that would be the natural next steps for a production-grade version:

- **No automated tests** — no unit or integration test suite is configured yet (e.g. Vitest would fit naturally with Vite).
- **No linting/formatting setup** — no ESLint/Prettier configuration.
- **No pagination or virtualization** — the full filtered coin list is rendered at once.
- **No historical data or charts** — only current snapshot values are shown; a charting library (e.g. Chart.js) could add price history.
- **Single-currency support** — only USD is supported (`vs_currency=usd` is hardcoded in the API URL).
- **No offline/retry resilience** — a failed fetch shows an error state rather than retrying with backoff.

These are deliberate scope cuts for a project focused on demonstrating clean vanilla JS architecture, not omissions born of oversight — but they're the logical roadmap if the project grows further.
