# r/seogrowth (week 4)

Reportedly posts whose aim is selling get removed and a self-post with a single link is allowed.
Read the rules first. If in doubt, post the audit steps only and put the link in a reply when
someone asks.

**Title:** The 10-minute image alt text audit I run on every page (free console snippet)

**Body:**

Alt text is one of the few on-page SEO and accessibility fixes you can audit in minutes. My routine:

1. Scroll to the bottom (so lazy images load), open the Console, and paste:

```js
console.table([...document.images].map((img, i) => ({
  n: i + 1,
  alt: !img.hasAttribute('alt') ? 'MISSING' : img.alt === '' ? '(empty)' : img.alt,
  shown: img.width + '×' + img.height,
  file: (img.currentSrc || img.src).split('/').pop().split('?')[0].slice(0, 40)
})))
```

2. Sort rows: MISSING (real failure), (empty) (fine for decoration, wrong for meaningful images),
   file name used as alt (`IMG_2041.jpg`), and weak alt ("image", the same sentence everywhere).
3. Decide per image: does it inform (describe the point), act (describe the destination), or
   decorate (`alt=""`)?
4. Report page URL + image number + problem + suggested alt, so whoever fixes it can find it.

Limits: only `<img>` elements; CSS backgrounds and inline SVG need a manual look.

Full write-up with the decision questions: https://image-number-helper-site-hecb.onrender.com/guides/audit-image-alt-text-on-a-page.html

(Disclosure: I build a small extension that numbers images on the page for exactly this kind of
review. It's linked from the write-up, not needed for the snippet.)

What do you check that I'm missing?
