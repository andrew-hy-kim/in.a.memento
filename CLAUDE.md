# in a memento: website

Website for in a memento (https://inamemento.com), our Seattle sticker, temporary tattoo and mini print vending machine rental business for weddings, parties and corporate events. Audience: couples, families and event planners deciding whether to book. The site should feel warm, playful and trustworthy and make inquiring easy. README.md has the full map of where everything lives; read it before larger changes.

## Stack
- Plain static site built by GitHub Pages with Jekyll (`_config.yml`, `_layouts/`, `_includes/`, `_data/`). No build step or server of our own.
- Domain is registered in Cloudflare; `CNAME` points GitHub Pages at inamemento.com. Don't touch `CNAME` or DNS.
- Styles in `css/style.css` (colors at the top); self-hosted fonts in `fonts/`; scripts in `js/`.
- FAQ content in `_data/faq.yml`; designs in `_data/designs.yml` + `images/designs/`; event photos in `images/gallery/`.
- Inquiries: `contact/index.html` posts to our Google Form. Every `entry.…` number and answer choice must match the Google Form exactly, or inquiries silently stop arriving.
- Google Apps Scripts for inquiry emails live in `extras/` (they run inside the Google Form, not the site).
- Content-Security-Policy is in `_layouts/default.html`; any new outside service needs its domain added there.

## Branches and going live
- `main` is the live site: whatever is on `main` is public at inamemento.com about a minute later. It's locked: changes reach it only through a pull request from `staging`.
- `staging` is the default branch where all work happens. Commit and push to `staging` freely; it never affects the live site.
- Going live = open a pull request `staging` → `main` and merge it only after I say so.
- Previewing `staging`: https://in-a-memento.kimhwayong0918.workers.dev (Cloudflare Workers project `in-a-memento`, rebuilds ~5 min after each push to `staging`; noindex), or `jekyll serve` locally. Don't submit the Book us form on a preview; it sends to the real Google Form.

## Commands
- Preview locally: `jekyll serve`, then open http://localhost:4000/ (needs `gem install jekyll` once).

## Business rules
- Pricing = hourly rental fee for the machine + a per-memento charge. Keep prices, travel rules and deposit policy consistent across Pricing, How it works and `_data/faq.yml`.
- Reply time promise ("within 2 to 3 business days") appears in several places; change all of them together.
- Never publish client names, private event details or personalised designs (names, dates, monograms) without my approval.
- New designs from the Art Library are added "awaiting approval"; nothing goes live until I approve.

## How I want you to work
- I'm not a full-time developer. Explain changes in plain language and keep diffs small.
- Preview visual changes locally and check them at phone width; most visitors are on phones.
- Keep photos under ~500 KB (~1200px wide) and short videos under ~1 MB (H.264 Main, yuv420p) so the site stays fast.
- Keep the site accessible (WCAG 2.2 AA).
- Commit with clear messages after each working change.
