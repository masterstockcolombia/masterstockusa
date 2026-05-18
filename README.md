# MasterStock USA - Website

Production website for MasterStock USA Inc., a Delaware-incorporated principal buyer of US excess inventory.

**Live site:** https://masterstockunitedstates.com/

## Stack

Pure HTML/CSS/JS - no build step, no framework. Tailwind via CDN for utility classes plus custom `home.css` / `styles.css` for design system tokens, animations, and component styles.

## Pages

- `index.html` - Home (hero slider, industry pulse, what we buy, USA coverage map, comparison table, FAQ)
- `how-it-works.html` - Process explanation (5-step flow, 3 offer structures, AI pricing factors)
- `about.html` - Founders, credentials, contact
- `resources.html` - Insights blog, sample NDA, sample Bill of Sale, IRS §165 primer

## Local development

Open `index.html` directly in a browser. No server required for basic navigation. For accurate behavior on relative paths, run a local HTTP server:

```bash
python -m http.server 8000
# then visit http://localhost:8000
```

## Deployment

Hosted on GitHub Pages. The `CNAME` file at the root binds the site to `masterstockunitedstates.com`. Pushes to `main` trigger automatic deployment.

## Contact

- General: info@masterstockunitedstates.com
- Partnerships: partnerships@masterstockunitedstates.com
- Legal: legal@masterstockunitedstates.com
