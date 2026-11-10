#!/usr/bin/env python3
"""Generates the policy/support pages of the website from one template.
Run: python3 site/build-pages.py"""
import os, re, html
HERE = os.path.dirname(os.path.abspath(__file__))
CWS = "https://chromewebstore.google.com/detail/image-number-helper-pro/oblgohgggijhcpaaimpcnkajklhfkelf"
ISSUES = "https://github.com/smokealarmdoctor/image-number-helper/issues"
UPDATED = "November 10, 2026"

HEAD = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{title} – Image Number Helper</title>
  <meta name="description" content="{desc}" />
  <link rel="canonical" href="https://image-number-helper-site-hecb.onrender.com/{file}" />
  <link rel="icon" type="image/png" sizes="32x32" href="assets/icon32.png" />
  <link rel="stylesheet" href="assets/site.css" />
</head>
<body>
  <header class="nav"><div class="wrap">
    <a class="brand" href="./"><img src="assets/icon48.png" alt="" width="32" height="32" />Image Number Helper</a>
    <nav><a class="hide-sm" href="./#pricing">Pricing</a><a class="hide-sm" href="support.html">Support</a><a class="btn primary small" href="{cws}" rel="noopener">Add to Chrome</a></nav>
  </div></header>
  <main class="doc">
    <h1>{title}</h1>
    <p class="meta">Last updated: {updated}</p>
{body}
  </main>
  <footer><div class="wrap"><span>© 2026 Image Number Helper</span><nav>
    <a href="support.html">Support</a><a href="refund.html">Refunds</a><a href="terms.html">Terms</a><a href="privacy.html">Privacy</a><a href="{cws}" rel="noopener">Chrome Web Store</a>
  </nav></div></footer>
</body>
</html>
"""

PAGES = {
"support.html": ("Support", "Get help with Image Number Helper: lost license keys, refunds, bugs and questions.", f"""
    <div class="box"><p style="margin:0"><b>Fastest way to reach us:</b> <a href="{ISSUES}">open a support request</a> (free GitHub account). We usually reply within 2 business days.</p></div>
    <h2>Lost your Pro license key?</h2>
    <p>Open a support request that says “lost key”. Don’t post your email publicly; we’ll reply with a private way to confirm your purchase and send the key. Within 30 days of buying you can also simply ask for a refund and buy again.</p>
    <h2>Refunds</h2>
    <p>Refunds are available within 30 days of purchase. See the <a href="refund.html">refund policy</a>.</p>
    <h2>Using the extension</h2>
    <ul>
      <li><b>Turn numbers on or off:</b> press <b>Alt + Shift + N</b>, or click the extension icon and use the switch.</li>
      <li><b>Copy a reference:</b> click any number badge to copy “Image 7”, or right-click an image → <i>Copy image number</i>.</li>
      <li><b>Jump to an image:</b> type its number in the popup and press <i>Show</i>.</li>
      <li><b>Activate Pro on another Chrome profile:</b> open the extension → <i>Upgrade</i> → paste your license key → <i>Activate</i>.</li>
      <li><b>Numbers don’t appear?</b> Chrome blocks extensions on browser pages (<code>chrome://</code>) and on the Chrome Web Store. Try any normal website.</li>
    </ul>
    <h2>Billing questions</h2>
    <p>Payments are processed by Stripe, which acts as merchant of record and handles sales tax and VAT. Your receipt comes from Stripe and includes a link to manage your order.</p>
"""),

"refund.html": ("Refund policy", "Image Number Helper Pro refund policy: full refund within 30 days.", """
    <div class="box"><p style="margin:0"><b>30-day money-back guarantee.</b> If Image Number Helper Pro isn’t right for you, ask for a refund within 30 days of purchase and you’ll get the full amount back. No questions asked.</p></div>
    <h2>How to request a refund</h2>
    <p>Open a request on our <a href="support.html">support page</a>, or use the link in your Stripe receipt email to contact the seller. Tell us the email you used at checkout. Refunds go back to your original payment method, usually within 5–10 business days depending on your bank.</p>
    <h2>After a refund</h2>
    <p>Your Pro license is deactivated. The free version of the extension keeps working.</p>
    <h2>Statutory rights</h2>
    <p>This policy doesn’t limit any rights you have under consumer protection law where you live, including any statutory withdrawal period for digital content.</p>
"""),

"terms.html": ("Terms of service", "Terms for using the Image Number Helper Chrome extension and buying Pro.", """
    <p>These terms apply to the Image Number Helper browser extension (“the extension”) and the optional Pro license (“Pro”). By installing the extension or buying Pro you agree to them.</p>
    <h2>1. The extension</h2>
    <p>The extension is free to install and use. It adds numbered labels to images on web pages you visit. It does not modify page content or send page content to us.</p>
    <h2>2. Pro license</h2>
    <ul>
      <li>Pro is a one-time purchase that unlocks additional features of the extension for the purchaser, on all Chrome profiles they personally use.</li>
      <li>The license is personal and non-transferable. Please don’t share or publish your license key; keys that are clearly shared publicly may be deactivated.</li>
      <li>“Lifetime” means for as long as we continue to offer the extension. If we ever discontinue it, we’ll give a final version that keeps working for existing Pro users where technically possible.</li>
      <li>Users who installed the extension before Pro was introduced (“founding users”) receive Pro at no charge.</li>
    </ul>
    <h2>3. Payment</h2>
    <p>Payments are processed by Stripe, which acts as merchant of record and is responsible for calculating and remitting applicable sales tax, VAT and GST. Prices are shown at checkout. Refunds are covered by our <a href="refund.html">refund policy</a>.</p>
    <h2>4. Acceptable use</h2>
    <p>Don’t reverse engineer the license system to bypass payment, resell the extension, or use it in a way that breaks the law or the terms of the websites you visit.</p>
    <h2>5. No warranty</h2>
    <p>The extension is provided “as is”. We work hard to keep it reliable, but we don’t guarantee it will work on every website or be free of errors.</p>
    <h2>6. Limitation of liability</h2>
    <p>To the extent the law allows, our total liability for any claim related to the extension or Pro is limited to the amount you paid for Pro.</p>
    <h2>7. Changes</h2>
    <p>We may update these terms. Material changes will be noted on this page with a new “last updated” date. Continued use after a change means you accept the updated terms.</p>
    <h2>8. Contact</h2>
    <p>Questions? See the <a href="support.html">support page</a>.</p>
"""),
}

def privacy_body():
    md = open(os.path.join(HERE, "..", "PRIVACY.md"), encoding="utf-8").read()
    md = md.split("\n", 1)[1]                     # drop H1 (page title comes from template)
    md = re.sub(r"^Last updated:.*\n", "", md, flags=re.M)
    out, in_list = [], False
    def inline(s):
        s = html.escape(s, quote=False)
        s = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", s)
        s = re.sub(r"`(.+?)`", r"<code>\1</code>", s)
        s = re.sub(r"\[(.+?)\]\((.+?)\)", r'<a href="\2">\1</a>', s)
        return s
    for line in md.splitlines():
        if line.startswith("- "):
            if not in_list: out.append("    <ul>"); in_list = True
            out.append(f"      <li>{inline(line[2:])}</li>")
            continue
        if in_list: out.append("    </ul>"); in_list = False
        if line.startswith("## "): out.append(f"    <h2>{inline(line[3:])}</h2>")
        elif line.strip(): out.append(f"    <p>{inline(line)}</p>")
    if in_list: out.append("    </ul>")
    return "\n".join(out)

PAGES["privacy.html"] = ("Privacy policy", "Image Number Helper privacy policy: no accounts, no analytics, no tracking.", privacy_body())

for file, (title, desc, body) in PAGES.items():
    with open(os.path.join(HERE, file), "w", encoding="utf-8") as f:
        f.write(HEAD.format(title=title, desc=desc, file=file, cws=CWS, updated=UPDATED, body=body.rstrip()))
print("wrote", ", ".join(PAGES))
