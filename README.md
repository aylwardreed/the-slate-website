# The Slate website

One-page marketing site for The Slate, served with GitHub Pages.

Plain HTML, CSS and JavaScript. No build step.

## Structure

```
index.html                    Page markup (hero, Take a closer look, Privacy & Terms)
assets/css/styles.css         Styles
assets/js/main.js             Hero animation, closer-look switcher, disclosures
assets/images/hero/           Screens shown in the three hero iPhones (screen-1 is the front phone)
assets/images/closer-look/    One image per app state and appearance: <state>-light.svg / <state>-dark.svg
assets/images/badges/         Official App Store and Mac App Store badges (SVG)
assets/images/devices/        Device bezel PNGs (iPhone 18 Pro Black/Glacier/Burgundy, MacBook Neo, iPad Pro)
.github/workflows/pages.yml   Deploys the site to GitHub Pages on every push to main
```

## Replacing placeholder images

Device frames are bezel PNGs layered over a screen image. Each screen image is
the screen only. iPhone screens are portrait, in a 9:19.5 ratio (an iPhone
screenshot at 1179 × 2556 works as-is). The MacBook and iPad screens in the
hero are plain black; to add screenshots, place an `<img>` inside their
`.device__screen` element in `index.html`.

If a bezel PNG is replaced with one of a different layout, update the screen
position variables (`--sx`, `--sy`, `--sw`, `--sh`, `--sr`) for that device in
`assets/css/styles.css`.

- Hero: replace `assets/images/hero/screen-1.svg` to `screen-3.svg`. PNG or JPG
  files also work; update the `src` attributes in `index.html` if the file
  extension changes.
- Take a closer look: the states are the `data-state` values on the buttons in
  `index.html` (`home`, `detail`, `editing`, `search`, `settings`). Each needs a
  light and a dark image. If the extension changes, update `srcFor` in
  `assets/js/main.js`.

## Local preview

```
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Deployment

One-time setup: repository Settings → Pages → Build and deployment → Source:
**GitHub Actions**. After that, every push to `main` publishes the site.
