# Waypoint

A plain-English, mobile-first guide to Irish immigration: what each stamp allows, whether you can work, how to register for an IRP card, and where to get help.

It is a static website with no framework and no dependencies. Pages are built from the JSON files in `content/` and hosted free on GitHub Pages.

## Run it locally

Needs Node.js 20 or newer.

```bash
npm run dev
```

Open http://localhost:8080. The site rebuilds when you save a file (refresh the browser to see it).

## Project layout

| Path | What it is |
| --- | --- |
| `content/*.json` | All the facts on the site. **Edit these to change what the site says.** |
| `content/sources.json` | The official pages every fact comes from. |
| `src/pages.mjs`, `src/layout.mjs` | Page templates. |
| `src/assets/` | CSS, the small JavaScript file, fonts and images. |
| `scripts/build.mjs` | Builds the site into `dist/`. Refuses to build if a fact has no source. |
| `scripts/check-sources.mjs` | Twice-weekly check: has an official page changed? Is a review due? |
| `scripts/check-links.mjs` | Checks every link on the site. |
| `monitor/state.json` | A fingerprint of each official page, used to spot changes. |
| `.github/workflows/` | Deploys the site, and runs the source check. |

## Editing content: the rules

Every block of facts in `content/` has two required fields:

```json
"sources": ["isd-stamps"],
"reviewed": "2026-10-12"
```

- **`sources`**: ids from `content/sources.json`. Only use official sources (irishimmigration.ie, enterprise.gov.ie, citizensinformation.ie, gov.ie, garda.ie, 112.ie). The build fails if a source is missing or unknown.
- **`reviewed`**: the date you last compared the block with its sources. Each page shows the oldest of these dates as "Checked against official sources on…".
- **`reviewBy`** (optional): a date when you know the facts will change, such as a new minimum wage on 1 January. Add `reviewReason` to explain. The source check opens an issue on that date.

The build also fails if it finds leftover placeholders such as `[CURRENT FEE]`.

Write like the rest of the site: short sentences, everyday words, one idea per line. Many readers are not native English speakers.

## How the information stays up to date

1. **Every Monday and Thursday**, the `Check official sources` workflow reads each page in `content/sources.json` and compares it with the last check. If the wording changed, it opens an issue that shows the change and lists the Waypoint pages and files that rely on it.
2. **Review dates**: when a block's `reviewed` date is older than 90 days (`reviewIntervalDays` in `site.config.mjs`), or a `reviewBy` date passes, it opens a "Review due" issue.
3. **Links**: the same workflow checks every link, and opens an issue if an official page has moved.
4. **Readers** can report a mistake from any page, using the form in `.github/ISSUE_TEMPLATE/`.

GitHub emails you when an issue opens. Your routine:

1. Open the issue and read the change on the official page.
2. Fix the content file it names (or decide nothing on Waypoint is affected).
3. Set `reviewed` to today on every block you checked.
4. Commit with `Fixes #<issue number>`. The site redeploys in about a minute.

You can run the checks yourself at any time:

```bash
npm run check:sources
```

```bash
npm run check:links
```

Add `-- --dry-run` to either one to preview the issues it would open.

If you change how pages are read (`scripts/lib/extract.mjs`) or add many sources at once, run the workflow by hand with **Actions → Check official sources → Run workflow** and tick **rebaseline**. It records every page as it is now without opening issues.

Some websites show slightly different pages to GitHub's servers than to your computer. Treat the fingerprints in `monitor/state.json` as GitHub's view. Running the check on your own computer may report changes that are only that difference.

Only a fingerprint of each official page is committed (`monitor/state.json`). The full text, used to show exactly what changed, stays in the workflow's private cache, so the public repository does not republish other organisations' pages. If the cache expires, changes are still caught, just without the exact wording.

The workflow also commits `monitor/last-run.txt` every time it runs. This keeps the repository active: GitHub turns off scheduled workflows in repositories with no activity for 60 days.

The check is deliberately not automatic in the other direction. It tells you *what* changed but never rewrites the site by itself, because immigration rules are high-stakes and a person should read every change before it goes live.

## Publishing on GitHub Pages

1. Create a public repository, for example `waypoint`, and push this folder to its `main` branch.
2. In the repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. The `Deploy to GitHub Pages` workflow builds and publishes the site on every push to `main`. It will be at `https://<your-username>.github.io/waypoint/`.

## SEO after launch

The site does the technical work already: one URL per topic, real HTML that search engines can read without JavaScript, descriptive titles and meta descriptions, structured data (`WebPage` with `lastReviewed`, `BreadcrumbList`), a sitemap with last-checked dates, social sharing images, and fast pages on mobile.

What you need to do:

1. **Google Search Console** (https://search.google.com/search-console): add the site as a "URL prefix" property, choose the "HTML tag" method, and paste the `content` value into `googleSiteVerification` in `site.config.mjs`. Push, verify, then submit `sitemap.xml` under **Sitemaps**.
2. **Bing Webmaster Tools** (https://www.bing.com/webmasters): you can import from Search Console, or put the code in `bingSiteVerification`. Bing results also feed DuckDuckGo.
3. **Get a custom domain if you can.** A short domain such as `waypoint.ie` ranks and is trusted far better than `github.io/waypoint`. Set it under **Settings → Pages → Custom domain**. Also set a repository variable `SITE_URL` (**Settings → Secrets and variables → Actions → Variables**) to `https://your-domain`, so issue links point to the right place. On a `github.io/waypoint` address, `robots.txt` is ignored (it only works at the root of a domain), so submitting the sitemap in Search Console matters even more.
4. **Get linked.** Search ranking for topics like immigration depends heavily on trust. Ask student unions, college international offices, migrant support groups and community forums to link to it.

Be realistic: the government sites will always rank first for broad searches such as "Irish immigration". Waypoint can win the specific questions people actually type, such as "stamp 2 work hours holidays", "what is stamp 1g" and "irp card burgh quay appointment". Each of those has its own page, written to answer exactly that question.

## Images

The icons and the social sharing image (`src/assets/img/`) are made by `npm run images` with headless Google Chrome. Run it again if you change the logo or tagline.

## Licences

Fonts: [Atkinson Hyperlegible](https://brailleinstitute.org/freefont) and [Source Serif 4](https://github.com/adobe-fonts/source-serif), both under the SIL Open Font License (see `src/assets/fonts/`).
