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
| Font files (Chewy, Nunito; self-hosted) | `fonts/` |
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

- **Short clips (under ~15 seconds):** send them to Claude, or export as MP4 (plus a WebM copy if you can), compress to under ~1 MB (e.g. with HandBrake or
  an online MP4 compressor), put it in `videos/`, and add a tile like this to `gallery/index.html`:

  ```html
  <figure class="tile photo" data-video="{{ '/videos/my-clip.mp4' | relative_url }}">
    <img src="{{ '/images/gallery/my-clip-cover.webp' | relative_url }}" alt="Guests pulling prints at a wedding" loading="lazy">
    <figcaption>▶ Rachel &amp; Brian's Wedding</figcaption>
  </figure>
  ```

  The image is the cover shown in the grid; tapping it plays the video in the viewer.

  If you encode videos yourself (e.g. with ffmpeg), keep them in the standard format phones can play:
  H.264 **Main** profile, `yuv420p`, for the MP4, and VP9 **profile 0**, `yuv420p`, for the WebM. Colour filters
  can silently switch the output to 4:4:4, which iPhones can't play, so always pass `-pix_fmt yuv420p`.
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

## Security

Each page sets a Content-Security-Policy (in `_layouts/default.html`): scripts, styles, fonts and media
may only come from this site, and forms may only post to our Google Form. If you ever add an outside
service (an embed, analytics, a payment link widget), its domain needs to be added there.

## New designs from Google Drive (weekly)

Every Monday morning a scheduled Claude task checks the **Art Library** folder in the business Google Drive
(shared with the Google account connected to Claude):

- Any new drawing gets a white background, is centred like the other designs, and gets a name and a
  description. You get a notification with screenshots, and **nothing goes live until you reply to approve it**
  in that task's session.
- Personalised pieces (client names, dates, event titles) are never added on their own; it asks you first.
- Files it has already handled are listed in `_data/gallery-sources.yml`. Delete a line there to have it look
  at that file again.
- Event photos and videos aren't part of this; send those over as before.
- The Gallery shows the first 12 designs in `_data/designs.yml`, with "Show all" and theme buttons (animals,
  food, flowers & plants, places & things) for the rest. Each design has a `category`; move a design higher
  in the list to feature it in the first 12.

## Keeping it running (checklist)

The inquiry form sends answers straight to Google Forms, and the browser can't see whether Google accepted
them, so the site always shows "Thank you!". If the Google Form changes, inquiries could stop arriving
without any error. These checks catch that and the other things the site depends on.

**Once a month (5 minutes)**
- [ ] Send a test inquiry from inamemento.com/contact/ and check it shows up in Google Forms responses
      (and that the confirmation email arrives). Delete the test response afterwards.
- [ ] Open the site on your phone and tap through each page.

**Whenever you edit the Google Form**
- [ ] Don't rename, reorder the answer choices of, or delete a question without updating `contact/index.html`
      too: each `entry.…` number and each answer's text must match the form exactly.
- [ ] If you make a question required in Google Forms, make it required on the site too, or Google will
      reject inquiries that skip it. ("How did you hear about us?" is required in Google Forms; the site
      fills in "Not answered" when it's skipped.)
- [ ] Send a test inquiry right after.

**Settings to keep on**
- [ ] Google Forms → Responses → ⋮ → "Get email notifications for new responses" (we promise a reply
      within 2 business days).
- [ ] Cloudflare → inamemento.com → auto-renew on, and a card on file that won't expire before the renewal date.
- [ ] Two-step login on GitHub, Cloudflare and Google.

**Once a year**
- [ ] Check prices, travel rules and the deposit policy still match on Pricing, the FAQ (`_data/faq.yml`)
      and How it works.
- [ ] Update the reply time everywhere if it changes ("within 2 business days" is on the booking page,
      How it works, the FAQ and in the confirmation email script).

## Previewing locally (optional)

```sh
gem install jekyll
jekyll serve
```

Then open http://localhost:4000/.
