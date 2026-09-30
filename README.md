# in a memento — website

Website for **in a memento**, a sticker & temporary tattoo vending machine rental business in Seattle, WA.

It's a plain static site hosted free on **GitHub Pages**. GitHub builds it automatically with Jekyll,
so there is no server to run and nothing to install.

## Going live (one-time setup, ~2 minutes)

1. The repository needs to be **public** (GitHub Pages is free for public repos; private repos need a paid plan).
   *Settings → General → Danger Zone → Change visibility.*
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Source: Deploy from a branch**, pick the `main` branch and the `/ (root)` folder, and click **Save**.
4. After a minute or two the site is live at `https://andrew-hy-kim.github.io/in.a.memento/`.

Any change pushed to `main` goes live automatically a minute or so later.

### Getting your own domain (optional, about $10–12/year)

A domain is the web address, like `inamemento.com`. You rent it yearly from a "registrar".
GitHub hosting stays free, so the domain is the only cost.

1. **Buy it** from **Cloudflare Registrar** or **Porkbun**. Both sell `.com` domains at close to cost
   (about $10–12/year) with no upsells, and renewals stay about the same price.
   Skip the add-ons (hosting, email, "privacy" upgrades; privacy is already free at both).
   Avoid "$1 first year" deals elsewhere, since renewals often jump to $20+.
2. In this repo, go to **Settings → Pages → Custom domain**, type your domain (e.g. `www.inamemento.com`) and save.
3. At the registrar, open the domain's **DNS** settings and add the records from
   [GitHub's guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site):
   - a `CNAME` record: name `www` → `andrew-hy-kim.github.io`
   - four `A` records: name `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
4. In `_config.yml`, change `baseurl: "/in.a.memento"` to `baseurl: ""`.
5. Wait up to a day, then tick **Enforce HTTPS** in Settings → Pages.

## Where things live

| What | File |
| --- | --- |
| Home page | `index.html` |
| How It Works | `how-it-works/index.html` |
| Pricing | `pricing/index.html` |
| Gallery | `gallery/index.html` |
| FAQ | `faq/index.html` |
| Book Us / contact form | `contact/index.html` |
| Menu (top of every page) | `_includes/header.html` |
| Footer (bottom of every page) | `_includes/footer.html` |
| Photos & design images | `images/gallery/` |
| Colors, fonts, layout | `css/style.css` (colors are at the top) |
| Instagram link, Google Form link, location | `_config.yml` |

You can edit any of these straight on github.com (open the file → pencil icon → *Commit changes*).

### Adding photos

Put images in `images/gallery/` and replace a placeholder tile in `gallery/index.html` with:

```html
<div class="tile"><img src="{{ '/images/gallery/my-photo.jpg' | relative_url }}" alt="What's in the photo" loading="lazy"></div>
```

Keep photos under ~500 KB each (resize to ~1200px wide) so the site stays fast.

## Previewing locally (optional)

```sh
gem install jekyll
jekyll serve
```

Then open http://localhost:4000/in.a.memento/.
