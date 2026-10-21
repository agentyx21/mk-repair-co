# MK Repair Co. — website

Static marketing site for **MK Repair Co.**: repairs, maintenance and small improvements for homes, rental properties and small business premises. Plain HTML, one stylesheet, one small script. No framework, no build step. Ready for GitHub Pages or any static host.

## Brand in brief

- **Positioning:** the dependable, tidy, straightforward team for the jobs that pile up. Homeowners, small landlords and small businesses with premises.
- **Tagline:** *Fix the list.* Hero line: *Sticking doors. Running toilets. Cracked grout. Fixed.*
- **Voice:** direct, practical, plain-spoken, a little dry. Short sentences, second person, verbs first, concrete nouns ("running toilets", not "plumbing solutions"). No jargon, no claims we can't back up.
- **Look:** utilitarian-modern, like a tool brand's spec sheet. Paper, ink and one signal color, visible rules and grid lines, mono "job codes" (PLB, DOR, WAL…), black-and-white documentary photography with cobalt as the only color.
- **Palette:** Ink `#111216` · Paper `#F3F2EE` · White `#FFFFFF` · Signal cobalt `#1F3BFF` (6.7:1 on white) · Cobalt on dark `#8C9BFF` (7.4:1 on ink) · Muted text `#5A5C63` (6.7:1 on white, 6.0:1 on paper). Every text pairing meets WCAG AA.
- **Type:** Archivo (variable; 87.5% width, weight 800 for display, 100% width for body) + IBM Plex Mono (labels, codes, the email address). Google Fonts, `display=swap`.
- **Mark:** an "MK" ligature (the M and K share a stem) in a square tile. `favicon.svg` is the cobalt version.

## Page map

| File | Purpose |
|---|---|
| `index.html` | Home: typographic hero + "What needs fixing?" problem picker, the three service lines, how a visit runs, process, who we work for, maintenance teaser, quick answers |
| `repairs.html` | The repairs list, indexed by category with anchors (`#plumbing`, `#doors`, `#walls`, `#carpentry`, `#floors`, `#fixtures`, `#exterior`, `#appliances`) + what we don't do (`#not-for-us`) |
| `maintenance.html` | Maintenance visits: what a visit covers, example visit summary, interactive seasonal checklist (`#checklist`), rentals, business premises, pricing approach |
| `improvements.html` | Six small-improvement types with scope / decisions / good-to-know |
| `how-it-works.html` | Five-step process (you / MK), "Keep it from getting worse" stop-gaps by job code (`#until-we-arrive`), FAQ (`#faq`) |
| `request.html` | Four-step request form. Accepts `?job=` to preselect the job type |
| `privacy.html` | Plain-English privacy notice |
| `404.html` | Not-found page (uses root-relative links; see below) |
| `css/styles.css`, `js/main.js`, `favicon.svg`, `robots.txt` | Assets |

`?job=` values: `plumbing`, `doors`, `walls`, `carpentry`, `floors`, `fixtures`, `exterior`, `appliances`, `maintenance`, `improvement`, `other`.

## Preview locally

Any static server works. From this folder, for example:

```
npx serve .            # or
python -m http.server  # if Python is installed
```

Open `http://localhost:<port>/`. Opening the HTML files straight from disk also works, apart from the 404 page.

## The request form

The form works in three modes:

1. **No form service configured (default).** The form's `action` is `mailto:`. On submit, the script validates every step, then opens the visitor's email app with a formatted request addressed to the business email. The confirmation screen says plainly that nothing has been sent until they press send, and shows the full request with a copy button as a fallback.
2. **Form service configured (recommended).** Set the form's `action` in `request.html` to an http(s) endpoint, for example Formspree:

   ```html
   <form id="request-form" action="https://formspree.io/f/your-form-id" method="post" ...>
   ```

   The script then POSTs the fields (plus a plain-text `summary`) with `fetch` and `Accept: application/json`. The "Request sent" screen only appears when the service returns a 2xx response; anything else shows a "didn't go through" screen with an email fallback and the answers kept. Netlify Forms, Basin, Getform and similar services that accept a standard POST work the same way. Turn on the service's spam protection.
3. **No JavaScript.** All four steps show on one page and the form posts to `mailto:` directly.

Maintenance checklist ticks are kept in `sessionStorage` for the visit and added to the request description.

Developers: before the email app opens, the form dispatches a cancelable `mk:mailto` event (with `detail.href`). Call `preventDefault()` on it in tests so a browser never hands off to a real email app.

## Pre-launch checklist

**Contact details:**
- Email `info@mkrepairco.com` is the only contact listed: every page, `EMAIL` at the top of `js/main.js`, the form `action` in `request.html` and the JSON-LD on `index.html`. Make sure the mailbox receives mail before launch.
- **No phone listed; add one later.** There's no phone line yet, so the site has no number, no `tel:` links and no phone field on the form (replies are by email). When there is a real number, add it to: the header (`.header__actions`, next to the email), the hero buttons on `index.html`, the blue CTA band on each page, the footer "Get in touch" list, the menu sheet (`.sheet__contact`), the mobile action bar (`.actionbar`), the request page's "Prefer email?" card and its status screens, the "What if it's urgent?" FAQ and the FAQ intro on `how-it-works.html`, the "Asking about your details" paragraph in `privacy.html`, and `"telephone"` in the JSON-LD on `index.html`.
- **Service area: Virginia and Florida** (states only). It appears in the home hero line, the footer ("Service area"), the request page intro and step 3, the "Do you cover my area?" FAQ, and `areaServed` in the JSON-LD. Don't list cities or claim coverage beyond that; the form still asks for a ZIP so we can confirm we can get to someone.
- [ ] Don't add an address, cities, opening hours or social links until they're real.

**Domain and hosting:**
- [x] Domain `mkrepairco.com` (GoDaddy), served by GitHub Pages via the `CNAME` file. Canonical URLs, `og:url`, `sitemap.xml` and the `robots.txt` sitemap line are in place.
- [ ] Email inbox: mail to `info@mkrepairco.com` is not delivered until Google Workspace (or another provider) is set up for the domain and its MX records are added in GoDaddy.
- `404.html` uses root-relative URLs (`/css/styles.css`); this works because the site is served from the domain root. Update them if the site ever moves under a sub-path.

**Form:**
- [ ] Connect a form service (see above) and send a test request end to end.

**Photography:**
- [ ] All photos are representative Unsplash images (free license, hotlinked, desaturated with `sat=-100`). Replace them with MK Repair Co.'s own photos of real jobs as they become available. Keep the black-and-white treatment for consistency. Photo IDs: `photo-1594072282386-915fadf1a2d6`, `photo-1772338537689-056082f100a9`, `photo-1567361808976-260065224468`, `photo-1623161551727-54c918bdcec1`, `photo-1768839725085-829e6ac7ac26`, `photo-1584265549731-fc0d5434ff76`, `photo-1625559424722-7b7d1199ad6e`, `photo-1520554704788-a6a2e7854290`, `photo-1786204697642-328c597b6f05`, `photo-1523413363574-c30aa1c2a516`, `photo-1615974679958-e095f0617925`, `photo-1638718260002-18bdc8082608`.
- [ ] The "Fig." captions describe the type of work shown, not specific jobs. Keep it that way for stock images.

**Content to confirm with the business:**
- [ ] The working practices described ("How a visit runs", the five-step process, written summaries with photos, arranging access with tenants, planning around opening hours, old parts taken away) match how MK Repair Co. actually works. Edit anything that doesn't.
- [ ] The repairs list and "What we don't take on" match the trades and permits the business actually holds in its state. Add licensing, insurance or warranty wording **only** once verified, and only if accurate.
- [ ] Add genuine testimonials or reviews only once you have real ones, with the customer's permission.
- [ ] The maintenance "Visit summary" is labeled as an example. Keep the label, or replace it with a real (anonymized) one.
- [ ] Update the privacy notice's "Last updated" date and add the legal business name once it exists. Have it reviewed if the business has specific legal obligations.

## Engineering notes

- Mobile-first CSS with custom properties for color, type (fluid `clamp()` scale), space, radius and motion (160/200 ms). Breakpoints: 600, 768, 900, 1024, 1100 (full nav), 1280.
- Icons are inline SVG symbols in each page (Lucide-style, ISC-licensed shapes plus a few drawn for this site). No icon fonts.
- Accessibility: skip link, landmarks, one `h1` per page, `aria-current` in navigation, sheet menu with focus trap, Escape and focus return, accordions as real buttons with `aria-expanded`/`aria-controls` (open without JS), visible `:focus-visible`, 44px+ touch targets, form errors tied with `aria-describedby`, an error summary that takes focus, and focus moved to each new step.
- Motion is limited to the hero strike-through, press states and menu/accordion transitions. All disabled under `prefers-reduced-motion`, and nothing is hidden without JavaScript.
- The mobile action bar (Email / Request) reserves its own space at the bottom of the footer, so it never covers content, and steps aside while a field is focused. The request page has no action bar (the form is the page) and its footer (`.site-footer--no-bar`) reserves no space.
