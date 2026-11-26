# Project Legion — Static Companion Website

Static, zero-dependency companion website for **Project Legion** (an unofficial, community-built GPL-3.0 fork of Lenovo Legion Toolkit).

## Files

- `index.html` — Single-page semantic HTML document.
- `styles.css` — Vanilla CSS with the 5 theme palettes, responsive layout (1440 / 1024 / 768 / 390 px), `tabular-nums`, focus rings, and `prefers-reduced-motion` / `prefers-color-scheme` support.
- `app.js` — Vanilla JS for theme switching, interactive app window preview, telemetry policy simulator, lid-open keyboard reset demo, and `downloads.json` loading with a `file://` fallback.
- `downloads.json` — Release version, package filenames, download URLs, and SHA-256 placeholders.
- `favicon.svg` — Original vector mark.

## Updating Release Metadata (`downloads.json`)

You do not need to edit `index.html` to publish a new build or fill in download links and checksums. Edit `downloads.json`:

```json
{
  "version": "0.1.5.0",
  "channel": "pre-release",
  "signed": false,
  "statusLabel": "0.1.5.0 (pre-release, unsigned)",
  "packages": {
    "standard": {
      "id": "standard",
      "name": "Standard",
      "subtitle": "Framework-dependent — requires .NET 9 Desktop Runtime",
      "filename": "ProjectLegion-win-x64-framework-dependent.zip",
      "url": "https://example.invalid/releases/ProjectLegion-win-x64-framework-dependent.zip",
      "sha256": "<64-char-hex-sha256>",
      "size": "18.4 MB"
    },
    "standalone": {
      "id": "standalone",
      "name": "Standalone",
      "subtitle": "Self-contained — bundles Windows x64 .NET 9 Desktop Runtime",
      "filename": "ProjectLegion-win-x64-self-contained.zip",
      "url": "https://example.invalid/releases/ProjectLegion-win-x64-self-contained.zip",
      "sha256": "<64-char-hex-sha256>",
      "size": "84.2 MB"
    }
  }
}
```

Notes:
- Compute the SHA-256 checksum on Windows with:
  ```powershell
  Get-FileHash .\ProjectLegion-win-x64-self-contained.zip -Algorithm SHA256
  ```
- When `url` is `"#"`, the download control indicates that the release asset is still pending rather than triggering a broken download. Once `url` points to a real archive URL, the Download button becomes an active download link.
- If users also open `index.html` directly from disk via `file://`, browsers block `fetch('downloads.json')` due to local origin restrictions. `app.js` includes an inline fallback (`FALLBACK_DOWNLOADS`) so the page still renders cleanly offline; update `FALLBACK_DOWNLOADS` in `app.js` if you want `file://` previews to mirror new release metadata as well.

## Hosting Statically (e.g., GitHub Pages)

No build step or package manager is required.

1. **Local preview**:
   - Open `index.html` directly in any browser (`file://`), or
   - Serve the folder with any static server, e.g. `python -m http.server 8080` inside `website/`.
2. **GitHub Pages**:
   - Push the contents of `website/` to a `gh-pages` branch or configure **Settings → Pages → Deploy from a branch** pointing to the folder containing `index.html`.
   - No Jekyll or bundler configuration is needed (add an empty `.nojekyll` file if desired).
3. **Any static host** (Cloudflare Pages, Netlify, S3, nginx):
   - Set the publish/root directory to this folder with no build command.
