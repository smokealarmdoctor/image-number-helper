---
title: "How to audit image alt text on any web page (with a copy-paste snippet)"
published: false
description: "A ten-minute alt text audit: list every image's alt status with one console snippet, sort the findings, and write a report someone can act on."
tags: a11y, webdev, seo, tutorial
canonical_url: https://image-number-helper-site-hecb.onrender.com/guides/audit-image-alt-text-on-a-page.html
---

<!-- DRAFT NOTE: publish only after the site guide is live (the canonical URL must resolve). Delete this comment. -->

An alt text audit answers one question for every image on a page: *does a person who can't see
this image get what they need?* Here is the routine I use.

## 1. List every image and its alt status

Scroll the page to the bottom so lazy-loaded images load, open the Console, and run:

```js
console.table([...document.images].map((img, i) => ({
  n: i + 1,
  alt: !img.hasAttribute('alt') ? 'MISSING' : img.alt === '' ? '(empty)' : img.alt,
  shown: img.width + '×' + img.height,
  file: (img.currentSrc || img.src).split('/').pop().split('?')[0].slice(0, 40)
})))
```

One row per `<img>`: position, alt text (or `MISSING` / `(empty)`), displayed size, file name.

Limits: numbers follow source order, and it only sees `<img>` elements. CSS background images,
inline SVG and `<canvas>` need a manual check.

## 2. Sort each row into four groups

- **MISSING**: no `alt` attribute. The real failure; screen readers may read the file name.
- **(empty)**: `alt=""` is correct for decoration and wrong for anything meaningful. Review each.
- **File name as alt**: `IMG_2041.jpg`, `hero-final-v3`. Present, but useless.
- **Weak alt**: "image", "photo", the same sentence on every image, a paragraph for a simple icon.

## 3. Decide what each image needs

Ask what the image is *for*:

- **Informs** (photo, chart): a short description of the point it makes. For a chart, the takeaway
  in the alt and the data in nearby text.
- **Acts** (logo linking home, icon button): the destination or action: "Home", "Search".
- **Decorates**: `alt=""`.

The W3C's [alt decision tree](https://www.w3.org/WAI/tutorials/images/decision-tree/) walks
through the same questions. Missing text alternatives fall under WCAG 1.1.1, Non-text Content.

## 4. Report it so someone can fix it

For each finding record: page URL, image number, what it shows, the problem, suggested alt text.
"Which image?" is where audits stall in meetings, so give every image a number you can point at.

## A shortcut for the "which image?" problem

I built a small Chrome extension, [Image Number Helper](https://chromewebstore.google.com/detail/image-number-helper-pro/oblgohgggijhcpaaimpcnkajklhfkelf),
that draws a numbered badge on every image so you can say "image 12 has no alt text" on a call.
Its report button exports number, alt text, size and file name as Markdown or CSV. Disclosure: I'm
the developer. The free version numbers the first 8 images per page; the report and unlimited
numbering are Pro ($2.99 once). The snippet above works without it.

What does your alt text audit look like, and what do you flag that I missed?
