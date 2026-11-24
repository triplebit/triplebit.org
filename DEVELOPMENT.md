# Development notes

This repository is the static site for www.triplebit.org. This file is the handoff for whoever works on it next, person or agent. It holds what the pages do not: how to work here, the conventions, how the pages are put together, how the site deploys, where things come from, and what is still open. Keep it current when any of that changes.

The owner's global git ignore excludes `CLAUDE.md` and `AGENTS.md`, so this file is the committed copy of the working notes.

## How to work here

- **Who does what.** Work is generally done by Opus agents, orchestrated by the main session. Planning, decisions, and discussion with the owner happen in the main session. It briefs Opus subagents to do the coding, sets each one's reasoning effort to fit the task (medium for scaffolding, UI, and renames; high for sign-in, concurrency, extension APIs, and device-only bugs), reviews what they return, tests it, and commits. Subagents do not commit.
- Commit only when asked, and push only when asked. A push to `main` deploys, and each deploy deletes whatever is in the bucket but not in the build (see Deployment). `commit.gpgsign` is on with SSH signing, and the Transparency page tells readers to check those signatures, so do not turn signing off. On the Larvatus repository, signing goes through the owner's 1Password SSH agent, which a sandboxed shell cannot reach, so `git commit` and `git push` run outside the sandbox; expect the same here.
- Run `npm install` once, then `npm start` to preview at http://localhost:8766 with live reload, or `npm run build` to write `_site/`. npm's cache in `~/.npm` is not writable from the sandbox, so sandboxed npm commands need `npm_config_cache=$TMPDIR/npm-cache`. Change dependencies with `npx npm@10 install …`, not npm 11: npm 11 writes Nunjucks's optional `chokidar` 3 into `package-lock.json` as a required package, and `npm ci` then fails on the Linux runner on its macOS-only `fsevents`.
- The dev server adds a live-reload script to every page; `npm run build` does not, so check `_site/` for the real output. The browser caches `assets/site.css`, so reload with the cache bypassed after editing it.
- Check layout changes at 375px, around 960px, and at 1280px, in the light and dark themes, with no sideways scroll. The owner reads the site on a phone. Headless Chrome only starts outside the sandbox.
- The sibling site is the Larvatus website (`../../ChatGPT/maskedemail-website` on the owner's machine, live at https://larvat.us). Treat it as read-only from here.

## Copy and design conventions

These are the owner's conventions from the Larvatus website (2026-11-24), and they apply to every Triplebit site.

- The wording of an existing page is the owner's. Changing Markdown syntax is fine; changing what a page says is not, without being asked. Ask before inventing copy. The typos and stale facts listed under Open are still there for that reason.
- A heading names its section. No eyebrow label, badge, or pill above a heading, no slogan with a subline under it, and no word of a heading set in a second color.
- No run of short declarative sentences. Join related clauses, often with just a comma.
- Put the best option first and fallbacks after it.
- American spelling and the Oxford comma.
- The site is informational and uses few graphics: no hero, no decorative imagery, no cards, apart from the project cards on `/projects/`.
- https://slopstrap.mikelacher.com is the owner's reference for page furniture to avoid: announcement pills, status dots, gradient text, cards inside cards, stat counters, logo marquees, testimonials.
- The Privacy Notice, the Legal FAQ, and the Transparency report are legal or evidentiary texts. Their dates and statements change only with the owner.

## How the pages are put together

Eleventy 3 builds `docs/` into `_site/`; `eleventy.config.js` has the settings. The input folder is `docs/`, where Larvatus uses `src/`, so that every page kept its git path when the site left MkDocs: the Transparency page links to the signed-commit history of `docs/transparency.md`.

- **`docs/_includes/base.njk`** holds everything the pages share: the head, the header band with its nav, the title band, and the footer.
  - Paths are relative (the `root` filter gives `""` at the root and `"../"` a folder down), except on `404.html`, which the server returns at any depth and so uses root-absolute paths.
  - The home page alone gets `_includes/jsonld.html`, a schema.org JSON-LD block carried over verbatim from the MkDocs site. It is data, not JavaScript, and it is the only `<script>` element on the site.
  - A page gets the title band (`title` as the heading, `subtitle` under it if set) and its content inside `<main class="wrap prose">`. The `<title>` is "`title` · Triplebit" unless a page sets `pageTitle`. The band heading has the id MkDocs gave it; pages whose MkDocs heading had none set `titleAnchor: false`.
- **`docs/_data/nav.json`** is the one list of sections and pages. It drives the header links, their dropdowns, the phone menu, the footer columns, and `sitemap.xml`. A new page goes here.
  - **Header**: the lockup, then About, Services, and Projects (each to its section's first page; they hide below 860px, as on Larvatus), then the Donate button. A section with more than one page shows its pages in a panel on hover and on keyboard focus (`:hover` and `:focus-within`, no JavaScript). On a touch screen wider than 860px a tap goes to the section's first page, and the other pages are reached from the footer.
  - **Phone menu**: below 860px a hamburger sits to the left of the Donate button. It is a `<details>` element whose panel lists every section and page; the icon becomes a close mark while it is open. There is no Escape-to-close, which would need JavaScript.
  - **Section headings are links.** In the dropdowns, the phone menu, and the footer, a section's heading links to its first page, and the list under it leaves that page out when its label is the same as the section's (the `subpages` filter). So About lists People, Transparency, and Donate, Projects is a heading alone, and Services keeps What We Do.
  - **Packing on phones**: where sections sit two across (the phone menu, and the footer at 760px and below), a section starts right after the one above it in its column, so Projects sits under About beside the long Services list. The grid has small fixed rows, and each section spans a number of them (`--rows`, set in `base.njk`) worked out from its page count, plus one for each label long enough to wrap (the `longLabels` filter, over 16 characters). A much longer label would need that threshold looked at again.
  - The dropdowns and the phone menu are Triplebit's own, by the owner's choice (2026-11-24); Larvatus only hides its links on phones. They replaced a row of section links under the page title, which the owner did not want.
  - **Footer**: black in both themes, and columns where Larvatus has one row, both by the owner's choice (2026-11-24). The first column is the lockup with the line "A Delaware 501(c)(3) public charity (EIN 42-3053859)" and the Candid seal under it, kept wide enough on desktop that the line does not wrap, then a compact group of section columns at the right. Columns wrap below earlier ones when there are more sections than fit. At 760px and below the lockup column moves under the section columns (CSS `order`; it stays first in the HTML).
- **The pages** are Markdown in `docs/` with `base.njk` as their layout, written to `people/index.html` and so on. The Markdown is not run through a template engine, typographer and linkify are off, and `"` stays as typed. What `eleventy.config.js` adds for this site:
  - Attributes in braces (markdown-it-attrs), limited to `class`, `width`, `height`, `loading`, `rel`, `target`, and `title`. The classes in use are `.button` and `.button .outline`, `.float` (an image floated right on wide screens), `.note` (the list after a `(1)` marker), and `.on-light` (a white surface in the dark theme behind a picture made for a white page).
  - Heading ids made the way Python-Markdown made them, so links such as `/bridges/#private-bridges` still land.
  - A fenced block with the info string `include <path>` shows that file from `docs/`. The relay and bridge pages use it for the fingerprint lists in `docs/.well-known/tor-relay/`.
- **`docs/index.njk`** is the home page. It replaces the `band` and `main` blocks: the opening paragraph sits in the black band where other pages have their title (the `<h1>` "Triplebit" is there but visually hidden), and below it is a full-width layout with each section as a row with its heading in a narrow left column and its content on the right, Programs as a two-by-two grid, and Organization as two columns. Rows stack below 860px. It was `docs/index.md` until 2026-11-24, so its earlier history is under that path. The wording is the Markdown page's, and the heading ids are written by hand to match.
- **The network map** on the home page is an inline SVG. The land is a 200×99 grid of dots in `docs/_includes/map-land.svg`, sampled from the owner's original graphic (`docs/public/triplebit-map.webp`) by `tools/make-map.mjs`, so no outside map data is involved. The build does not run the generator; it needs Puppeteer and a Chrome outside the sandbox. The pins and the dashed links between core locations come from `docs/_data/locations.json` (x and y in the SVG's coordinates, and a kind: `core`, `edge`, or `soon`). Nothing on the map is labeled, because the original named no places. The links flow slowly in a loop (lower United States pin to Europe, to the upper United States pin, and back down; a link runs from its first pin to its second in `locations.json`), and stand still under `prefers-reduced-motion`. The legend is HTML text with the original's three labels.
- **`docs/projects.njk`** has its own markup too: a card per project in that project's colors, with its mark faintly behind, shaped like the donation card on the Larvatus home page. A card's colors come from its class in `site.css` (`.project.larvatus`), not from this site's palette. To add a project, copy a card and add a class. The sentence on the Larvatus card is larvat.us's own, and its text is solid white here for contrast, where Larvatus uses 92% white.
- **Copied as they are**, at the URLs they had under MkDocs: `docs/public/` (logos, the charity's documents, friends' logos), `docs/images/`, `docs/geofeed.csv`, and `docs/.well-known/`. `docs/assets/` holds the stylesheet, and the build copies the fonts into `assets/fonts/`.
- **`docs/404.md` and `docs/sitemap.njk`** build `/404.html` and `/sitemap.xml`.

### Shared with Larvatus, kept in step by hand

There is no shared package. Triplebit's sites use the same font, navbar layout, and footer lockup, and each has its own colors. A change to a shared part on one site has to be made on the others.

- In `docs/assets/site.css`, the blocks marked `SHARED` came from Larvatus's `src/assets/site.css`: the token names on `:root`, the Montserrat `@font-face` rules, the base elements and body type (17px/1.55), `.wrap`, `.button`, `.band` and `.nav`, the footer's padding and type, `footer .lockup` with its `--mark` arithmetic, `.tb-back` and `.tb-front`, `.title`, and `.prose`. The blocks marked `TRIPLEBIT` are this site's own.
- `docs/_includes/base.njk` came from Larvatus's `src/_includes/base.njk`.
- **The footer lockup** is Triplebit's mark beside a line of text, in the same place on every site, and only the text changes. Here it reads "TRIPLEBIT" (written "Triplebit" in the HTML and set in capitals by CSS, so screen readers say the word), and the mark links to this site's home page; on other sites it links to https://www.triplebit.org. The font size is `calc(var(--mark) * 22 / 64 / .7)` in 900 italic, with the mark lowered by 21/64, which makes a capital T exactly as tall as the mark's middle bar. On 2026-11-24 it measured the same as Larvatus's at 960 and 1280px: the mark 32×32 at x 24 and 64, 41px below the footer's top, the text starting at x 67 and 107, and the font size 15.71px. On phones the size and x are the same, but the lockup sits under the section columns here. The footer mark is the white square with black bars in both themes, since the footer is always black.
- Not shared: Larvatus's footer is a single row in the page's own colors, and its header has no dropdowns or phone menu; its hero, callouts, facts, steps, diagram, and cards are its own.

### Colors

Every color is a token at the top of `site.css`, one block per theme. The owner chose the "Black" palette on 2026-11-24 over a deep teal and a light "paper" band: a black band as on the MkDocs site, red links, and the mark's cyan for the focus ring and list markers. The MkDocs site's `#f00` links were 4.0:1 on white, so the link red is `#cc0000` (5.6:1) in the light theme and `#ff6b6b` (6.7:1) in the dark. The footer has its own tokens (`--footer-bg` and the like), and so do the map (`--map-land`, `--pin-core`, `--pin-edge`, `--pin-soon`) and the dropdown panels. The edge pins are a darker teal than the mark's cyan in the light theme, to reach 3:1 against the page. The filled button has a shadow under it, red-tinted in the light theme and plain in the dark, and on hover the buttons stay red or take a red tint, never gray (the owner's choice, 2026-11-24); those rules are in a `TRIPLEBIT` block, and the shared `.button` rule is as on Larvatus. `theme-color` in `base.njk` is written by hand and has to follow `--band`.

## Deployment

triplebit.org is served by Caddy from a bucket on Triplebit's own Garage (S3-compatible) cluster. `.github/workflows/deploy.yml` runs on each push to `main`, and by hand.

- It installs Node from `.node-version` (22), runs `npm ci` and `npm run build`, and refuses to go on unless `_site/index.html` exists and `_site/` holds at least 20 files.
- It uploads with the MinIO client: `mc mirror --overwrite --remove` of `_site/` to the bucket root with `Cache-Control: public, max-age=600`, then the fonts again with `max-age=2592000`. Nothing on the site is fingerprinted, so everything but the fonts stays short-lived.
- **`--remove` deletes every object in the bucket that is not in the build.** The owner chose this on 2026-11-24. Anything put in the bucket by hand is removed on the next deploy, so a file that should be served has to be in `docs/`.
- `mc` sets content types from file extensions. On 2026-11-24 the live site served `.woff2` as `font/woff2`, `.svg` as `image/svg+xml`, and `.csv` as `text/csv`. The workflow's last step checks the live home page and one font.
- `mc` is pinned to one release by checksum. It is MinIO's AIStor build, because the community client's downloads now return 410 Gone; it is the source the previous upload action (`hkdobrev/minio-deploy-action`) pulled its unpinned copy from. Its license terms have not been checked.
- **URLs.** `/people/` serves `people/index.html`, and `/people` redirects to `/people/` (checked with curl on 2026-11-24). An unknown path returns `404.html` with status 404. `triplebit.org` redirects to `www.triplebit.org`.
- The bucket name, endpoint, and keys are repository variables and secrets (`GARAGE_ENDPOINT`, `GARAGE_BUCKET`, `GARAGE_TRIPLEBIT_STATIC_HOMEPAGE_ID`, `GARAGE_TRIPLEBIT_STATIC_HOMEPAGE_KEY`). The checkout step still passes `submodules: true` and a `PAT`, though the repository has no submodules.

## Where things come from

- **The pages**: the MkDocs Material site this replaced on 2026-11-24. The text of all twelve pages was compared with the live site that day, and the only differences were the home heading (the word "Triplebit" where the wide logo image with the alt text "AS401332" was), the Power Up Privacy logo, which the owner had unlinked, the map's legend (text where it was part of the image), and the Candid seal, which moved from the home and Donate pages to the footer. The owner then took the Delaware Certificate of Incorporation off the home page and out of the site, and shortened the footer line, which had begun "© Triplebit Corporation, a Delaware". The nav went from five tabs (About, Services, Tor, Monero, Network) to three sections.
- **The layout, stylesheet, and conventions**: the Larvatus website, as above.
- **Font**: Montserrat, from `@fontsource/montserrat` (SIL Open Font License), pinned in `package.json`. The build copies the Latin subset of the six weights and styles the stylesheet uses (400, 400 italic, 500, 600, 700, and 900 italic). Every character on the site is in the Latin subset; check before adding text in another script.
- **The mark**: `docs/public/triplebit-logo-square.svg`, inlined in `base.njk` for the header and footer.
- **The Larvatus card**: the icon, the gradient, the mask watermark, the sentence, and the "Get Larvatus" label are all from the Larvatus website.
- **Fingerprint lists**: `docs/.well-known/tor-relay/`, served for Tor Proposal 326 and shown on the relay and bridge pages.

## Open

- **First deploy.** Nothing has been deployed from the new workflow. On the first run, read the upload log (object keys with no `_site/` prefix, the old MkDocs objects removed, the fonts under `assets/fonts/`), and the Cache-Control lines the last step prints: whether Garage's web endpoint and Caddy pass that header through is not yet known.
- **`/history/` and `/blog/` will return 404 after the first deploy.** Both were only old objects in the bucket: History was removed from the repository earlier (it is in git history as `docs/history.md`), and the blog was an empty index.
- **Projects**: only Larvatus so far. The owner will add others.
- **Left as found, for the owner**:
  - `monero.md` writes the domain once as `xmr.tiplebit.org` and says "We will support I2P by the end of 2024."
  - `privacy.md` calls Triplebit "a nonprofit corporation in Minnesota", and the site description says "Minnesota, USA-based"; the home page and footer say Delaware.
  - The Privacy Notice says this website uses Umami Statistics. No page loads it, before or after the redesign.
  - The JSON-LD block points to a logo that does not exist (`/public/triplebit-social-pic.png`) and to a Twitter account.
- **Unused files still served**: `public/globe-cover.svg`, `public/purple-globe.svg`, `public/triplebit-logo.svg`, and `public/triplebit-logo-white.svg`. They stay because their URLs existed before.
- **Leftovers from MkDocs**: `.devcontainer/` (a Privacy Guides MkDocs image), `CNAME`, and the `upstream` git remote. The ignored `site/` and `.cache/` folders in a checkout are old MkDocs output.
- **No checks in the repository.** The text diff, link check, and screenshot scripts used for the redesign were scratch files and were not kept. `tools/make-map.mjs` is the only tool here.
- The About dropdown lists Donate beside the Donate button, since both come from `nav.json`.
- No link previews: the pages have no Open Graph tags, as on the live MkDocs site.
