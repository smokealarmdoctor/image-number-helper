#!/usr/bin/env python3
"""Generates the guides section (/guides/) and sitemap.xml. Called from build-pages.py,
so Render's existing build command (python3 site/build-pages.py) builds everything."""
import os, html

HERE = os.path.dirname(os.path.abspath(__file__))
ORIGIN = "https://image-number-helper-site-hecb.onrender.com"
CWS = "https://chromewebstore.google.com/detail/image-number-helper-pro/oblgohgggijhcpaaimpcnkajklhfkelf"
PUBLISHED = "2026-11-12"

TEMPLATE = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{title} – Image Number Helper</title>
  <meta name="description" content="{desc}" />
  <link rel="canonical" href="{origin}/guides/{file}" />
  <link rel="icon" type="image/png" sizes="32x32" href="../assets/icon32.png" />
  <link rel="stylesheet" href="../assets/site.css" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="{title}" />
  <meta property="og:description" content="{desc}" />
  <meta property="og:image" content="{origin}/assets/og.jpg" />
{jsonld}</head>
<body>
  <header class="nav"><div class="wrap">
    <a class="brand" href="../"><img src="../assets/icon48.png" alt="" width="32" height="32" />Image Number Helper</a>
    <nav><a class="hide-sm" href="./">Guides</a><a class="hide-sm" href="../#pricing">Pricing</a><a class="btn primary small" href="{cws}" rel="noopener">Add to Chrome</a></nav>
  </div></header>
  <main class="doc">
    <h1>{title}</h1>
    <p class="meta">{meta}</p>
{body}
  </main>
  <footer><div class="wrap"><span>© 2026 Image Number Helper</span><nav>
    <a href="./">Guides</a><a href="../support.html">Support</a><a href="../refund.html">Refunds</a><a href="../terms.html">Terms</a><a href="../privacy.html">Privacy</a><a href="{cws}" rel="noopener">Chrome Web Store</a>
  </nav></div></footer>
</body>
</html>
"""

CTA = f"""
    <div class="box" style="margin-top:32px">
      <p style="margin:0 0 10px"><b>Try it free.</b> Image Number Helper puts a numbered badge on every image of the page you're looking at. The first 8 images on any page are free; Pro ($2.99, one time) removes the limit and adds the meeting report and numbered screenshots.</p>
      <a class="btn primary" href="{CWS}" rel="noopener">Add to Chrome</a>
    </div>"""

GUIDES = [
    {
        "file": "number-images-on-a-web-page.html",
        "title": "How to number images on a web page",
        "desc": "Three ways to put numbers on the images of a web page so everyone can say “image 7”: screenshots, browser developer tools, and a free Chrome extension.",
        "blurb": "Three ways to label the images on any page so a whole team can point at the same one.",
        "body": """
    <p>When several people look at the same page, “the second one on the right” quickly turns into a guessing game. Numbering the images fixes it: everyone says “image 7” and means the same thing. Here are three ways to do it, from slowest to fastest.</p>

    <h2>1. Annotate a screenshot</h2>
    <p>Take a screenshot, add numbers in an image editor or whiteboard tool, and share it. It works anywhere, but it is a snapshot: it goes stale as soon as the page changes, and it only covers what was on screen. Long pages need several screenshots.</p>

    <h2>2. Use your browser’s developer tools</h2>
    <p>Developer tools can list the images on a page, but they don’t label them visually. In the Console, <code>document.images.length</code> tells you how many <code>&lt;img&gt;</code> elements the page has, and <code>[...document.images].map((img, i) =&gt; (i + 1) + ': ' + img.currentSrc)</code> prints a numbered list of their addresses. That is handy for a QA checklist, but nobody in a meeting can see those numbers on the page itself.</p>

    <h2>3. Put the numbers on the page</h2>
    <p>A browser extension can draw a numbered badge over every image, so you can share your screen and say “look at image 7.” <a href="../">Image Number Helper</a> does this in one keystroke:</p>
    <ol>
      <li><a href="{cws}">Install it from the Chrome Web Store</a>.</li>
      <li>Open any page and press <b>Alt + Shift + N</b>. Numbers appear on the images.</li>
      <li>Click a number to copy “Image 7”, ready to paste into chat or a ticket.</li>
      <li>Type a number in the extension popup and the page scrolls to that image and highlights it.</li>
    </ol>

    <h2>Tips for clean numbering</h2>
    <ul>
      <li><b>Numbers follow the order images are found on the page.</b> Images that load later (lazy loading) get the next number instead of shifting everything else. If the page changes a lot, use <i>Renumber</i> to start again from the top.</li>
      <li><b>Tiny images are skipped</b> so icons and tracking pixels don’t clutter the page. The minimum size is adjustable.</li>
      <li><b>Only <code>&lt;img&gt;</code> elements are numbered.</b> Images set as CSS backgrounds are not.</li>
      <li><b>Pick a style that suits your team:</b> 1 2 3, A B C, 01 02 03 or I II III.</li>
    </ul>
    <p>Related: <a href="reference-images-in-a-design-review.html">how to reference images in a design review</a> and <a href="find-images-with-missing-alt-text.html">how to find images with missing alt text</a>.</p>
""",
    },
    {
        "file": "reference-images-in-a-design-review.html",
        "title": "How to reference images in a design review",
        "desc": "A simple process for precise feedback on pages full of images: number them, write feedback as a list, and share evidence everyone can see.",
        "blurb": "A four-step process for design-review feedback that lands on the right image every time.",
        "body": """
    <p>Design reviews go wrong in a predictable way: someone says “the photo on the left needs to be bigger,” and three people look at three different photos. A little structure removes the confusion.</p>

    <h2>Step 1: Number the images before the meeting</h2>
    <p>Open the page and switch numbering on, so every image has a visible number. With <a href="../">Image Number Helper</a> that is <b>Alt + Shift + N</b>. Share your screen with the numbers showing, and nobody has to describe where an image is.</p>

    <h2>Step 2: Write feedback as a numbered list</h2>
    <p>Keep each comment short and start with the image number:</p>
    <div class="box"><p style="margin:0">Image 3: crop tighter, the subject is cut off on mobile.<br />
    Image 7: swap for the product shot with the white background.<br />
    Image 9: alt text is missing.<br />
    Image 12: too heavy, compress before launch.</p></div>
    <p>Anyone reading the list later can find each image without a screenshot.</p>

    <h2>Step 3: Attach evidence</h2>
    <ul>
      <li><b>A numbered screenshot</b> shows exactly what the reviewer saw. The Pro version captures one in a single click.</li>
      <li><b>A report</b> lists every number with its alt text, size and file name, which turns “fix the images” into concrete tickets.</li>
    </ul>

    <h2>Step 4: Turn comments into tickets</h2>
    <p>Click a badge to copy “Image 7” and paste it into the ticket title. The number, plus the page address, identifies the image.</p>

    <h2>Avoid these traps</h2>
    <ul>
      <li><b>Numbers belong to one page view.</b> They follow the order images are found, so they can differ between pages, screen sizes and after the content changes. Name the page and the screen size in your feedback.</li>
      <li><b>Agree on one numbering style</b> for the team, so “image 7” and “image G” aren’t mixed.</li>
      <li><b>Renumber after big changes</b> and say so in the thread.</li>
    </ul>
    <p>Related: <a href="number-images-on-a-web-page.html">how to number images on a web page</a>.</p>
""",
    },
    {
        "file": "find-images-with-missing-alt-text.html",
        "title": "How to find images with missing alt text",
        "desc": "Why alt text matters, how to find images without it using developer tools, and how to list every image's alt text on a page in one click.",
        "blurb": "Why alt text matters and two quick ways to find the images that don’t have it.",
        "body": """
    <p>Alt text describes an image for people who can’t see it: screen-reader users, anyone whose images fail to load, and search engines. Pages with missing alt text are harder to use, and easy to fix once you know where they are.</p>

    <h2>Missing is not the same as empty</h2>
    <ul>
      <li><b>No <code>alt</code> attribute at all:</b> a problem. Screen readers may read out the file name instead.</li>
      <li><b>An empty <code>alt=""</code>:</b> intentional for purely decorative images, and correct for those. Review these case by case.</li>
    </ul>

    <h2>Find them with developer tools</h2>
    <p>Open the Console on any page and run:</p>
    <div class="box"><p style="margin:0"><code>document.querySelectorAll('img:not([alt])').length</code> counts images with no alt attribute.<br />
    <code>document.querySelectorAll('img[alt=""]').length</code> counts images with an empty alt attribute.</p></div>
    <p>Add <code>.forEach(img =&gt; console.log(img.currentSrc))</code> to print their addresses. It works, but the list has no connection to what you see on the page.</p>

    <h2>Find them on the page, with numbers</h2>
    <p><a href="../">Image Number Helper</a> numbers every image on the page. The Pro <b>Copy report</b> button lists each number with its alt text, displayed size, original size and file name, as a Markdown table, plain text or CSV, and marks images without alt text. Paste it into a ticket or spreadsheet and the whole audit is in one place. The report flags images with empty alt text as well as missing ones, so check the decorative images before you “fix” them.</p>

    <h2>Writing good alt text</h2>
    <ul>
      <li>Describe what the image is for, not every detail.</li>
      <li>Keep it short, usually a phrase or one sentence.</li>
      <li>Skip “image of” and “picture of”. Screen readers already announce it’s an image.</li>
      <li>If the image is a link or button, describe where it goes or what it does.</li>
      <li>Leave decorative images with <code>alt=""</code>.</li>
    </ul>
    <p>Related: <a href="reference-images-in-a-design-review.html">how to reference images in a design review</a>.</p>
""",
    },
]


def render(g):
    jsonld = (
        '  <script type="application/ld+json">\n'
        '  {"@context":"https://schema.org","@type":"Article","headline":%s,"description":%s,'
        '"datePublished":"%s","dateModified":"%s","image":"%s/assets/og.jpg",'
        '"author":{"@type":"Organization","name":"Image Number Helper"},'
        '"publisher":{"@type":"Organization","name":"Image Number Helper"},'
        '"mainEntityOfPage":"%s/guides/%s"}\n  </script>\n'
    ) % (
        __import__("json").dumps(g["title"]), __import__("json").dumps(g["desc"]),
        PUBLISHED, PUBLISHED, ORIGIN, ORIGIN, g["file"],
    )
    body = g["body"].replace("{cws}", CWS) + CTA
    return TEMPLATE.format(
        title=html.escape(g["title"]), desc=html.escape(g["desc"], quote=True), file=g["file"],
        origin=ORIGIN, cws=CWS, jsonld=jsonld, meta="Published November 12, 2026", body=body.rstrip(),
    )


def render_index():
    items = "\n".join(
        f'    <div class="box" style="margin-bottom:14px"><h2 style="margin:0 0 6px;font-size:20px"><a href="{g["file"]}">{html.escape(g["title"])}</a></h2><p style="margin:0">{html.escape(g["blurb"])}</p></div>'
        for g in GUIDES
    )
    return TEMPLATE.format(
        title="Guides", desc="Practical guides to numbering, referencing and auditing images on web pages.",
        file="", origin=ORIGIN, cws=CWS, jsonld="", meta="Practical guides for teams that review web pages",
        body=items + CTA,
    )


def build():
    d = os.path.join(HERE, "guides")
    os.makedirs(d, exist_ok=True)
    for g in GUIDES:
        with open(os.path.join(d, g["file"]), "w", encoding="utf-8") as f:
            f.write(render(g))
    with open(os.path.join(d, "index.html"), "w", encoding="utf-8") as f:
        f.write(render_index())
    pages = ["", "support.html", "refund.html", "terms.html", "privacy.html", "guides/"] + [f"guides/{g['file']}" for g in GUIDES]
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    xml += "".join(f"  <url><loc>{ORIGIN}/{p}</loc><lastmod>{PUBLISHED}</lastmod></url>\n" for p in pages) + "</urlset>\n"
    with open(os.path.join(HERE, "sitemap.xml"), "w", encoding="utf-8") as f:
        f.write(xml)
    print("wrote guides/ (" + str(len(GUIDES)) + " guides + index) and sitemap.xml")


if __name__ == "__main__":
    build()
