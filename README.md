# Amar KC — personal website and technical blog

A personal portfolio, project showcase, and technical blog built with
[Jekyll](https://jekyllrb.com/) and hosted for free on GitHub Pages. All
content is written in Markdown; there is no database, server, or JavaScript
framework.

**Contents**

1. [Technologies](#1-technologies)
2. [Project structure](#2-project-structure)
3. [First-time configuration (do this first)](#3-first-time-configuration-do-this-first)
4. [Editing the home and About pages](#4-editing-the-home-and-about-pages)
5. [Adding a project](#5-adding-a-project)
6. [Adding a blog post](#6-adding-a-blog-post)
7. [Math, code, and images](#7-math-code-and-images)
8. [Adding your CV](#8-adding-your-cv)
9. [Previewing locally](#9-previewing-locally)
10. [Publishing on GitHub Pages](#10-publishing-on-github-pages)
11. [Troubleshooting](#11-troubleshooting)
12. [Using a custom domain later](#12-using-a-custom-domain-later)

---

## 1. Technologies

| Piece | What it does |
|---|---|
| Jekyll 4 | Turns Markdown + templates into static HTML |
| Markdown + YAML front matter | Your content (posts, projects, pages) |
| Liquid | Template language in `_layouts/` and `_includes/` |
| Custom CSS (`assets/css/style.css`) | All styling, light and dark themes |
| Vanilla JS (`assets/js/main.js`) | Optional extras: theme toggle, mobile menu, project filter, blog search, copy buttons. The site works without it. |
| MathJax 3 (CDN) | Renders LaTeX; loaded only on pages with `math: true` |
| Rouge | Syntax highlighting at build time (no JavaScript) |
| jekyll-feed, jekyll-seo-tag, jekyll-sitemap | RSS feed, meta/Open Graph tags, sitemap |
| GitHub Actions | Builds and deploys the site on every push |

No analytics or tracking scripts are included.

## 2. Project structure

```
.
├── _config.yml              ← site settings, your name, links, CV path
├── _data/
│   ├── navigation.yml       ← header menu
│   ├── profile.yml          ← education, experience, skills (About + CV pages)
│   └── project_categories.yml ← project categories and their order
├── _includes/               ← reusable HTML pieces (header, cards, …)
├── _layouts/                ← page templates (default, home, page, post, project)
├── _posts/                  ← blog posts: YYYY-MM-DD-title.md
├── _projects/               ← one Markdown file per project
├── assets/
│   ├── css/style.css
│   ├── js/main.js
│   ├── images/              ← images for posts and projects
│   └── cv/                  ← put your CV PDF here
├── blog/index.html          ← blog listing (+ search)
├── blog/topics.html         ← posts grouped by category and tag
├── index.md                 ← home page introduction text
├── about.md                 ← About page
├── cv.md                    ← CV page
├── projects.html            ← project listing (+ category filter)
├── 404.html
├── search.json              ← search index generated at build time
├── Gemfile / Gemfile.lock   ← Ruby dependencies
└── .github/workflows/pages.yml ← deployment workflow
```

You will mostly edit `_config.yml`, `_data/profile.yml`, `index.md`,
`about.md`, and the files in `_posts/` and `_projects/`.

## 3. First-time configuration (do this first)

Open `_config.yml`. Every setting you are likely to change is at the top and
commented. In particular:

```yaml
url: "https://amarbkc.github.io"   # https://YOUR-USERNAME.github.io
github_username: "amarbkc"          # your GitHub username
email: ""                           # shown publicly — leave "" to hide
linkedin_url: ""                    # full URL, or ""
cv_pdf: ""                          # e.g. "/assets/cv/Amar_KC_CV.pdf"
```

> The GitHub username `amarbkc` was taken from the git remotes of other
> projects on this computer. Confirm it is the account you want to publish
> from.

Any link left as `""` is hidden everywhere on the site. Nothing is filled in
with invented values.

Then review `_data/profile.yml` (education, research experience, skills). The
skills list is deliberately minimal; once it is accurate, set
`skills_reviewed: true` to remove the "please review" note.

Restart the local server after editing `_config.yml`; other files reload
automatically.

## 4. Editing the home and About pages

- **Name and one-line tagline:** `author.name` and `author.tagline` in
  `_config.yml`.
- **Home-page introduction paragraphs:** `index.md` (plain Markdown).
- **Interests list** (home sidebar, About, CV): `research_interests` in
  `_data/profile.yml`.
- **Featured projects** on the home page: any project with `featured: true`
  (up to `home.featured_projects` in `_config.yml`).
- **Recent writing** on the home page: the latest posts, automatically.
- **About page prose:** `about.md`. The Education, Experience, and Skills
  sections come from `_data/profile.yml`, so edit those facts there once.
- **Publications:** add entries under `publications:` in `_data/profile.yml`
  when you have them; the section appears automatically.
- **Header menu:** `_data/navigation.yml`.

## 5. Adding a project

Create a file in `_projects/`, e.g. `_projects/k-means-clustering.md`. The file
name becomes the URL: `/projects/k-means-clustering/`.

```markdown
---
title: "k-Means Clustering from Scratch"
description: "One-sentence summary shown on the card."
category: "Machine Learning"        # must match a name in _data/project_categories.yml
technologies: [Python, NumPy]
github_url: "https://github.com/USERNAME/k-means"   # or ""
demo_url: ""                        # optional
status: "Completed"                 # In progress | Completed | Draft (optional)
featured: false                     # true = show on home page
order: 4                            # lower numbers are listed first
---

## Overview
## Motivation and problem statement
## Mathematical foundations
## Algorithm and implementation
## Experiments and results
## Limitations and future improvements
## Source code and resources
```

All sections are optional. The card on the Projects page and the detail page
are generated automatically. To add a new category, add it to
`_data/project_categories.yml`; categories with no projects show an empty
state.

The three starter projects contain clearly marked **"Starter content — please
review"** notices. Replace the content with your own work and delete each
notice (the `<div class="notice notice--todo" …>…</div>` block) when done.

## 6. Adding a blog post

Create `_posts/YYYY-MM-DD-short-title.md`. The date in the filename is the
publication date; the URL becomes `/blog/YYYY/MM/short-title/`.

```markdown
---
title: "Understanding Binary Search Trees"
summary: "One or two sentences used on listing pages, in search, and for link previews."
categories: [Algorithms]            # broad topics (keep the set small)
tags: [trees, data-structures]      # specific keywords
related_projects: []                # optional: project file names without .md
math: true                          # default; set false to skip loading MathJax
---

Opening paragraph…

<!--more-->

The rest of the article…
```

- Posts with a future date are not published until that date (use
  `bundle exec jekyll serve --future` to preview them).
- To keep a draft out of the site, put it in a `_drafts/` folder (no date in
  the filename) and preview with `bundle exec jekyll serve --drafts`.
- Link to another post or project in a way that is checked at build time:

  ```markdown
  [Dijkstra's algorithm]({% raw %}{% link _posts/2026-06-18-dijkstras-algorithm.md %}{% endraw %})
  [Neural network project]({% raw %}{% link _projects/neural-network-from-scratch.md %}{% endraw %})
  ```

  If the target file is renamed or deleted, the build fails with a clear
  error instead of publishing a broken link.

Category and tag pages are combined at `/blog/topics/`. Related posts (sharing
a category or tag) are shown at the end of each post automatically.

The five starter posts are complete drafts. Read them carefully before
publishing under your name: edit the wording, check every derivation, and run
the code examples yourself. Examples marked *illustrative* are not
experimental results.

## 7. Math, code, and images

### LaTeX

MathJax is configured for these delimiters:

| Type | Write | Notes |
|---|---|---|
| Inline | `$O(n \log n)$` | Fine for most expressions |
| Inline (safest) | `$$\lVert w \rVert_2$$` in the middle of a sentence | Use when the expression contains `\{`, `\|`, `\\`, or `*` |
| Display | `$$` on its own line, equation, `$$` on its own line | Leave a blank line before and after |

Display example:

```markdown
The gradient of the loss is

$$
\nabla_\theta L(\theta) = \frac{1}{n} \sum_{i=1}^{n} \nabla_\theta \ell(f_\theta(x_i), y_i)
$$

which we compute by backpropagation.
```

Why the "safest" form? The Markdown processor (kramdown) treats a backslash
before some punctuation as an escape, so inside single `$…$` it turns `\{`
into `{` and `\|` into `|`. Text inside `$$…$$` is passed to MathJax
untouched. Alternatives that always work: `\lbrace … \rbrace` for braces,
`\lVert … \rVert` for norms, `\cdot` or `\times` instead of `*`.

Multi-line equations work with `aligned`:

```latex
$$
\begin{aligned}
a &= b + c \\
  &= d
\end{aligned}
$$
```

To write a literal dollar sign in a page with math, use `\$`.

### Code

Use fenced code blocks with a language name for highlighting:

````markdown
```python
def gcd(a, b):
    while b:
        a, b = b, a % b
    return a
```
````

Long lines scroll horizontally; a "Copy" button appears on hover. Supported
language names include `python`, `cpp`, `java`, `javascript`, `bash`, `latex`,
`yaml`, and [many more](https://rouge-ruby.github.io/docs/file.Languages.html).

### Images and figures

Put images in `assets/images/` (e.g. `assets/images/posts/dijkstra/graph.png`).
Simple image:

```markdown
![Shortest-path tree after running Dijkstra from A]({{ "/assets/images/posts/dijkstra/graph.png" | relative_url }})
```

Image with a caption:

```html
<figure>
  <img src="{{ '/assets/images/posts/dijkstra/graph.png' | relative_url }}"
       alt="Shortest-path tree rooted at A" loading="lazy" width="800" height="450">
  <figcaption>Figure 1. The shortest-path tree after the algorithm finishes.</figcaption>
</figure>
```

Always write meaningful `alt` text. Keep images reasonably sized (under ~300 KB;
SVG for diagrams where possible). Always use `relative_url` so images also
work if the site is served from a sub-path.

### Callout boxes

```markdown
<div class="callout" markdown="1">
<span class="callout__title">Theorem</span>
Every comparison sort needs $\Omega(n \log n)$ comparisons in the worst case.
</div>
```

## 8. Adding your CV

1. Copy your PDF into `assets/cv/`, e.g. `assets/cv/Amar_KC_CV.pdf`
   (avoid spaces in the filename).
2. In `_config.yml`, set `cv_pdf: "/assets/cv/Amar_KC_CV.pdf"`.
3. Restart the local server. The CV and About pages now show a download link
   instead of the placeholder notice.

Before publishing a PDF, check that it contains only information you want
public (for example, you may not want your phone number or home address on
the internet). The `/cv/` page itself is also print-friendly — your browser's
Print → Save as PDF produces a clean copy.

## 9. Previewing locally

You need Ruby 3.1 or newer. macOS ships an old Ruby (2.6) that is **too old
for Jekyll 4**; do not use it or `sudo gem install`.

**macOS (Homebrew):**

```bash
brew install ruby@3.3
```

```bash
echo 'export PATH="/opt/homebrew/opt/ruby@3.3/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc
```

(On Intel Macs the path is `/usr/local/opt/ruby@3.3/bin`.) Confirm with
`ruby -v` — it should print 3.3.x.

**Windows:** install Ruby+Devkit 3.3 from [rubyinstaller.org](https://rubyinstaller.org/).
**Linux:** install `ruby-full` and `build-essential` with your package manager.

Then, in this folder:

```bash
bundle config set --local path vendor/bundle
```

```bash
bundle install
```

```bash
bundle exec jekyll serve --livereload
```

Open <http://127.0.0.1:4000>. Pages rebuild when you save; restart after
editing `_config.yml`. Stop the server with `Ctrl+C`.

To test that everything works under a sub-path (as a project site would):

```bash
bundle exec jekyll serve --baseurl /test
```

and open <http://127.0.0.1:4000/test/>.

## 10. Publishing on GitHub Pages

### a. Create the repository

For a site at `https://USERNAME.github.io`, the repository **must** be named
exactly `USERNAME.github.io` (for you, likely `amarbkc.github.io`).

1. Sign in to GitHub and go to <https://github.com/new>.
2. Repository name: `USERNAME.github.io`. Visibility: **Public** (Pages on
   private repositories requires a paid plan).
3. Do **not** add a README, .gitignore, or license (this folder already has
   them). Click **Create repository**.

### b. Push this folder

From this folder:

```bash
git add -A
```

```bash
git commit -m "Initial site"
```

```bash
git branch -M main
```

```bash
git remote add origin https://github.com/USERNAME/USERNAME.github.io.git
```

```bash
git push -u origin main
```

(If this folder is not yet a git repository, run `git init` first.)

### c. Turn on GitHub Pages

1. In the repository, open **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Open the **Actions** tab. The "Deploy site to GitHub Pages" workflow runs
   on every push to `main` (re-run it from the Actions tab if it ran before
   step 2). When it shows a green check, the site is live at
   `https://USERNAME.github.io` — the first deployment can take a few minutes.

From now on, publishing is just: edit → commit → push.

### Project site instead of a user site

If you use a repository with another name (e.g. `website`), the site is served
at `https://USERNAME.github.io/website/`. Nothing needs to change: the
workflow passes the correct `--baseurl` automatically, and every template uses
`relative_url`. (Optionally set `baseurl: "/website"` in `_config.yml` so local
previews match.)

## 11. Troubleshooting

| Problem | Fix |
|---|---|
| `bundle: command not found` or Ruby 2.6 errors | Your shell is using macOS's system Ruby. Re-check the PATH step in section 9 and open a new terminal. |
| `Could not find gem …` | Run `bundle install`. |
| Build fails with `Could not find document '…' in tag 'link'` | A `{% raw %}{% link %}{% endraw %}` points to a renamed or deleted file — fix the path. |
| Workflow fails at "Set up Ruby" / bundler | Make sure `Gemfile.lock` is committed. If you changed gems, run `bundle lock --add-platform x86_64-linux` and commit the lockfile. |
| Workflow fails at "Deploy" with a permissions/environment error | Settings → Pages → Source must be **GitHub Actions**; Settings → Environments → `github-pages` must allow the `main` branch. |
| Site shows the README or a 404 | Pages source is set to "Deploy from a branch". Switch it to **GitHub Actions**. |
| Styles missing on the live site | `url`/`baseurl` mismatch. For a user site use `baseurl: ""`. Hard-refresh the browser. |
| A new post does not appear | Check the filename format (`YYYY-MM-DD-title.md`), that the front matter starts and ends with `---`, and that the date is not in the future. |
| Equations show as raw LaTeX | Check `math: true` (default for posts/projects; add it to other pages), blank lines around display math, and the browser console for a blocked CDN. |
| Changes to `_config.yml` not visible | Restart `jekyll serve`. |

## 12. Using a custom domain later

1. Buy a domain from any registrar.
2. In the repository: **Settings → Pages → Custom domain**, enter
   `www.yourdomain.com`, save, and wait for the DNS check.
3. At your registrar, create DNS records:
   - `www` → **CNAME** → `USERNAME.github.io`
   - For the bare domain (`yourdomain.com`), **A** records to
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`,
     `185.199.111.153` (check GitHub's
     [current documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
     in case these change).
4. In `_config.yml`, set `url: "https://www.yourdomain.com"` and `baseurl: ""`,
   then commit and push.
5. Once the certificate is issued, tick **Enforce HTTPS** in Settings → Pages.

With GitHub Actions deployment the custom domain is stored in the repository
settings, so you do not need a `CNAME` file.
