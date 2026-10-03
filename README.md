# The Slate website

One-page marketing site for The Slate, served with GitHub Pages.

Plain HTML, CSS and JavaScript. No build step.

## Structure

```
index.html                    Page markup (hero, Take a closer look, Privacy & Terms)
assets/css/styles.css         Styles
assets/js/main.js             Hero animation, closer-look switcher, disclosures
assets/images/hero/           Hero screenshots: iPhones (favourites, your-slate, in-production), iPad, MacBook
assets/images/closer-look/    One image per app state and appearance: <state>-light.svg / <state>-dark.svg
assets/images/badges/         Official App Store and Mac App Store badges (SVG)
assets/images/devices/        Device bezel PNGs (iPhone 18 Pro Black/Glacier/Burgundy, MacBook Neo, iPad Pro)
.github/workflows/pages.yml   Deploys the site to GitHub Pages on every push to main
```

## Replacing images

Device frames are bezel PNGs layered over a screen image. Each screen image is
the screen only. iPhone screens are portrait, in a 9:19.5 ratio (an iPhone
screenshot at 1179 × 2556 works as-is). The MacBook screen is 16:10 and the
iPad screen about 1.45:1; screenshots are cropped to fill if the ratio differs.

If a bezel PNG is replaced with one of a different layout, update the screen
position variables (`--sx`, `--sy`, `--sw`, `--sh`, `--sr`) for that device in
`assets/css/styles.css`.

- Hero: replace the files in `assets/images/hero/` (left iPhone `favourites.jpg`,
  centre `your-slate.jpg`, right `in-production.jpg`, plus `ipad-favourites.jpg`
  and `mac-your-slate.jpg`), or update the `src` attributes in `index.html`.
- Take a closer look: the states are the `data-state` values on the buttons in
  `index.html` (`favourites`, `your-slate`, `in-development`, `project-pages`,
  `talent-pages`, `siri-ai`, `add-to-calendar`). Each needs a light and a dark
  image named `<state>-light.svg` and `<state>-dark.svg`. For PNG or JPG files,
  add `data-ext="png"` (or `"jpg"`) to that button.
  Video: add `data-ext="mp4"` and supply `<state>-light.mp4` and
  `<state>-dark.mp4`. Videos play muted on a loop and fade in once the first
  frame is ready. Recommended: H.264 MP4, 590 × 1278 (half an iPhone screen
  recording), 30 fps, no audio track, 10 to 20 seconds, about 1 to 3 MB each,
  exported with "fast start" (`ffmpeg -i in.mov -vf scale=590:-2 -c:v libx264
  -crf 26 -preset slow -an -movflags +faststart out.mp4`).
  A screenshot taller than the screen (for example a full-length scrolling
  capture, 1179 px wide) pans slowly down and back up inside the frame, and
  pauses on hover.

## Local preview

```
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Deployment

One-time setup: repository Settings → Pages → Build and deployment → Source:
**GitHub Actions**. After that, every push to `main` publishes the site.
