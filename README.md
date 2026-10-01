# in a memento — website

Website for **in a memento**, a sticker & temporary tattoo vending machine rental business in Seattle, WA.

It's a plain static site hosted free on **GitHub Pages**. GitHub builds it automatically with Jekyll,
so there is no server to run and nothing to install.

## Going live (one-time setup, ~2 minutes)

1. The repository needs to be **public** (GitHub Pages is free for public repos; private repos need a paid plan).
   *Settings → General → Danger Zone → Change visibility.*
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Source: Deploy from a branch**, pick the `main` branch and the `/ (root)` folder, and click **Save**.
4. After a minute or two the site is live at **https://inamemento.com** (once the DNS records below are in place).

Any change pushed to `main` goes live automatically a minute or so later.

### Custom domain: inamemento.com (registered with Cloudflare)

The `CNAME` file in this repo tells GitHub Pages to serve the site at `inamemento.com`.
DNS records in Cloudflare (**Websites → inamemento.com → DNS → Records**), all set to
**Proxy status: DNS only** (grey cloud):

| Type | Name | Content |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `andrew-hy-kim.github.io` |

Then in **Settings → Pages**, the custom domain should read `inamemento.com`; tick **Enforce HTTPS**
once GitHub finishes issuing the certificate (can take up to a day).
See [GitHub's guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

The domain renews yearly in Cloudflare; keep auto-renew on so the site doesn't go down.

## Where things live

| What | File |
| --- | --- |
| Home page | `index.html` |
| How It Works | `how-it-works/index.html` |
| Pricing | `pricing/index.html` |
| Gallery | `gallery/index.html` |
| FAQ questions & answers | `_data/faq.yml` (the page and Google's FAQ markup both read from it) |
| Book Us / inquiry form | `contact/index.html` (sends answers to our Google Form; if you add, remove or rename a question or answer choice in Google Forms, update it here too) |
| Menu (top of every page) | `_includes/header.html` |
| Footer (bottom of every page) | `_includes/footer.html` |
| Event photos | `images/gallery/` |
| Sticker / tattoo / print designs | `images/designs/` |
| Design names & descriptions (Gallery + home page machine) | `_data/designs.yml` |
| Colors, fonts, layout | `css/style.css` (colors are at the top) |
| Instagram link, Google Form link, location | `_config.yml` |

You can edit any of these straight on github.com (open the file → pencil icon → *Commit changes*).

### Adding photos

Put event photos in `images/gallery/` and designs in `images/designs/`, then add a tile to `gallery/index.html` like:

```html
<div class="tile"><img src="{{ '/images/gallery/my-photo.jpg' | relative_url }}" alt="What's in the photo" loading="lazy"></div>
```

Keep photos under ~500 KB each (resize to ~1200px wide) so the site stays fast.

### Adding videos

Tapping any photo or design opens it bigger in a viewer, and videos work the same way.

- **Short clips (under ~15 seconds):** export as MP4, compress to under ~10 MB (e.g. with HandBrake or
  an online MP4 compressor), put it in `videos/`, and add a tile like this to `gallery/index.html`:

  ```html
  <figure class="tile photo" data-video="{{ '/videos/my-clip.mp4' | relative_url }}">
    <img src="{{ '/images/gallery/my-clip-cover.webp' | relative_url }}" alt="Guests pulling prints at a wedding" loading="lazy">
    <figcaption>▶ Rachel &amp; Brian's Wedding</figcaption>
  </figure>
  ```

  The image is the cover shown in the grid; tapping it plays the video in the viewer.
- **Longer videos:** upload to YouTube (unlisted is fine) and embed them, rather than storing big files here.
  GitHub Pages works best when the whole site stays under about 1 GB.

## Search engines (SEO)

- Page titles and descriptions for Google live at the top of each page file (`title:` / `description:`).
- `jekyll-seo-tag` adds link previews (image: `images/share.jpg`) and canonical URLs;
  `jekyll-sitemap` builds `/sitemap.xml` and `/robots.txt` automatically.
- Business details for Google are in `_includes/schema-business.html`.
- Off-site to do: Google Business Profile, Google Search Console (submit `https://inamemento.com/sitemap.xml`),
  link inamemento.com in the Instagram bio, and list on wedding directories.

## Inquiry confirmation email

`extras/inquiry-confirmation-email.gs` is a small Google Apps Script that emails everyone who submits the
inquiry form ("We got your inquiry! 💌"). It runs inside the Google Form, not the website. Setup steps are at the
top of the file. Google allows about 100 of these emails per day on a personal account.

## Previewing locally (optional)

```sh
gem install jekyll
jekyll serve
```

Then open http://localhost:4000/.
