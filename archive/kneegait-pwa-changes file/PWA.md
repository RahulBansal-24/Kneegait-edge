# KneeGait-Edge as a PWA

## What was added
| File | Change |
|---|---|
| `vite.config.ts` | Adds `vite-plugin-pwa`: manifest, service worker (Workbox `generateSW`), caching rules |
| `src/components/PwaStatus.tsx` (new) | Registers the service worker; offline banner, "new version" prompt, Install button |
| `src/pwa.d.ts` (new) | TypeScript types for `virtual:pwa-register/react` |
| `src/App.tsx` | Imports and renders `<PwaStatus />` (2 lines) |
| `index.html` | `theme-color`, description, `apple-touch-icon` (manifest link is injected at build) |
| `public/icons/*.png` (new) | 192, 512, maskable 512, Apple touch icon, drawn from `favicon.svg` |
| `.gitignore` | `!public/icons/*.png` so the icons are not ignored by the existing `*.png` rule |

Nothing was removed. No pages, routes, BLE code or settings logic were touched.

## Install and run
```bash
npm install -D vite-plugin-pwa workbox-window
npm run build        # tsc --noEmit && vite build  (also generates dist/sw.js and dist/manifest.webmanifest)
npm run preview      # serves dist/ at http://localhost:4173 - test the PWA here, not in `npm run dev`
```

## How it behaves
- **Manifest:** name, short name, `start_url`/`scope` `/`, standalone, theme `#14213D`, background `#F5F8F9`, 192/512 + maskable icons.
- **Precache:** all built JS, CSS, HTML, SVG, PNG. The cached `index.html` is the offline fallback for every route (`navigateFallback`), so reloading `/analytics` offline works after the first visit.
- **Runtime cache:** Google Fonts only (stylesheet stale-while-revalidate, font files cache-first).
- **No API caching:** the app has no backend API calls. Gait data comes over Bluetooth and is never cached.
- **Updates:** `registerType: 'prompt'`. A new deploy shows a "Reload" banner and never reloads on its own (a reload ends the Bluetooth session). Old caches are cleaned up automatically. The app checks for updates hourly.
- **Offline:** a banner shows when the browser goes offline. Settings stay available (they are in `localStorage`). There is no offline write queue, since nothing is sent to a server.
- **Install:** the Install button appears only when the browser fires `beforeinstallprompt` and the app is not already installed.

## Known limitations
- **Web Bluetooth is not available on iOS/iPadOS (any browser) or Firefox.** The PWA installs on iOS via Share -> Add to Home Screen, but live sensor connection will not work there. Chrome/Edge on Android, Windows, macOS, ChromeOS and Linux are the supported targets.
- Web Bluetooth and service workers need HTTPS (or `localhost`).
- The install prompt is Chromium-only; Safari and Firefox use their own menus.
- Fonts from Google are cached only after they have loaded once online. Offline before that, the app falls back to `system-ui`.
- Assumes the site is served from the domain root (`/`). If it is hosted in a sub-path (e.g. GitHub Pages project site), set `base` in `vite.config.ts` and change `start_url`, `scope`, `navigateFallback` and icon paths.

## SPA routing on the host (needed for first visit / direct links)
The service worker only handles routes after the first load. The host must also return `index.html` for unknown paths:
- **Vercel** `vercel.json`: `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`
- **Netlify** `public/_redirects`: `/*  /index.html  200`
- **Firebase** `firebase.json`: `"rewrites": [{ "source": "**", "destination": "/index.html" }]`
- **Cloudflare Pages:** works by default for SPAs without a top-level 404.html.
Also make sure `/sw.js` is not served with a long cache lifetime (`Cache-Control: no-cache` for `sw.js` and `index.html`).

## Test checklist (run these yourself)
1. `npm run build` completes with no TypeScript errors.
2. `npm run preview`, open in Chrome. DevTools -> Application -> Manifest shows no errors and the icons load.
3. Application -> Service Workers: `sw.js` is "activated and running".
4. Tick "Offline" in the Network tab and reload `/`, `/analytics` and `/settings`. All three should load.
5. Install from the address-bar icon or the in-app Install button. The app opens in its own window.
6. Rebuild after a small text change, reload the page: the "new version" banner appears. Click Reload.
7. Lighthouse -> Progressive Web App / Installable checks.
8. On the deployed HTTPS URL, repeat steps 2-5 and test Bluetooth connect on Android Chrome.

## Troubleshooting
- **No Install button:** use `npm run preview` or the HTTPS site, not `npm run dev`. Check Manifest errors in DevTools. It also stays hidden if the app is already installed.
- **Old version keeps showing:** DevTools -> Application -> Service Workers -> "Update" or "Unregister", then Storage -> "Clear site data".
- **Blank page offline:** the site was never loaded online with the new service worker active. Load it once online first.
- **Icons missing after `git push`:** confirm `public/icons/*.png` shows up in `git status` (see the `.gitignore` change).
- **Build error "virtual:pwa-register/react" not found:** `npm install -D vite-plugin-pwa workbox-window` was not run.
