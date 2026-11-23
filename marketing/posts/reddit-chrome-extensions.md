# r/chrome_extensions (week 2)

Check the sidebar rules and use the "Self Promotion" flair if the subreddit has one. I could not
verify the rules from here.

**Title:** I built an extension that puts a number on every image on a page, so reviews can say "image 7"

**Body:**

I'm the developer. I made Image Number Helper because every design review or QA call I was in
turned into "no, the one on the left... the other left."

Press Alt+Shift+N and every image on the page gets a numbered badge. Click a badge to copy
"Image 7" for Slack or a ticket; type a number and the page scrolls to that image.

Free numbers the first 8 images on any page. Pro is $2.99 once (no subscription) and adds
unlimited numbering, a report with alt text/size/file name, and numbered screenshots. No account,
no analytics; the licence key is checked offline in the extension.

Things I'd love feedback on, since you know this space:
1. Is 8 free images the right line, or does it make the free version feel useless?
2. Where would you expect an extension like this to break? (Lazy loading and infinite scroll were the hard parts.)
3. Anything in the permissions you'd push back on? It asks for `activeTab`, `scripting`, `storage` and `contextMenus`, plus http/https host access so the always-on option can run on sites you choose.

Store link: https://chromewebstore.google.com/detail/image-number-helper-pro/oblgohgggijhcpaaimpcnkajklhfkelf

Reply in the thread to every question for the first day or two. Do not ask anyone to rate it.
