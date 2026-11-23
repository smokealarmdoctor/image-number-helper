# r/webdev Showoff Saturday (week 3)

I could not verify the rule from here, but project posts there are reportedly limited to the
Showoff Saturday thread. Post as a **comment in that week's thread**, not as a new post. Read the
thread's pinned rules first.

**Comment:**

**Image Number Helper**: Chrome extension that numbers every image on a page, so "image 7" replaces "the one on the left" in design reviews and QA calls.

I'm the developer. Alt+Shift+N turns it on; click a badge to copy "Image 7" for a ticket. The
Pro report lists number, alt text, size and file name (Markdown/CSV) and flags missing alt.

Technical bits people might care about: badges render in shadow DOM so page CSS can't break them
and clicks pass through; numbers are stable while lazy images load; Manifest V3 with no build step.
Free for the first 8 images per page; Pro is $2.99 once.

Link: https://chromewebstore.google.com/detail/image-number-helper-pro/oblgohgggijhcpaaimpcnkajklhfkelf

Happy to hear where it breaks on your sites.
