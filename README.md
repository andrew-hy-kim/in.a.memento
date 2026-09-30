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

### Using your own domain (optional, e.g. `inamemento.com`)

1. Buy a domain from any registrar (Namecheap, Cloudflare, Porkbun, Google/Squarespace Domains …) — usually $10–20/year. **This is the only cost.**
2. In **Settings → Pages → Custom domain**, enter the domain and save (this adds a `CNAME` file).
3. At the registrar, add the DNS records GitHub shows you ([GitHub's guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)).
4. In `_config.yml`, change `baseurl: "/in.a.memento"` to `baseurl: ""`.
5. Tick **Enforce HTTPS** once it becomes available.

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
| Colors, fonts, layout | `css/style.css` (colors are at the top) |
| Instagram link, Google Form link, location | `_config.yml` |
| Vending machine illustration | `_includes/machine.svg` |

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
