# Clear Trade Logistics — Website

Five-page static corporate website for Clear Trade Logistics, a South African customs clearing and trade compliance consultancy.

- **Stack:** HTML5, CSS3, vanilla JavaScript. No frameworks, no build step.
- **Hosting:** GitHub Pages → https://xolanimgube.github.io/clear-trade-logistics/
- **Developer:** Lumina Cube Consulting

## Structure

```text
index.html        Home
about.html        About Us
services.html     Our Services   (#customs-clearance, #itac-permits, #sars-compliance)
industries.html   Industries     (#petroleum, #automotive, #solar-batteries)
contact.html      Contact & consultation form (#consultation, #faq, #privacy)
style.css         All styles (design tokens in :root)
script.js         Mobile menu, scroll reveals, consultation form
assets/           Images and logo (WebP used on the site; original JPG/PNG kept as sources)
robots.txt, sitemap.xml
```

All links are relative, so the site works under the GitHub Pages `/clear-trade-logistics/` subpath. Don't use root-relative paths such as `/assets/...`.

The header and footer are repeated in every page. If you change navigation, update all five files.

### Pre-selecting form fields from links

CTAs can link to `contact.html?service=customs#consultation` or `contact.html?industry=petroleum#consultation`.
Service keys: `customs`, `itac`, `sars`, `general`. Industry keys: `petroleum`, `automotive`, `solar`, `other`.

## Connecting the contact form

GitHub Pages can't process form submissions. The form is ready for a third-party form service (e.g. Formspree, Basin, Getform) or a serverless function:

1. Create the form endpoint with the service and point it at the client's approved inbox.
2. In `contact.html`, set the endpoint URL on the form: `<form id="consultation-form" ... data-endpoint="https://...">`.
3. Enable the provider's spam protection. A honeypot field (`website`) is already included.
4. Test a real submission end to end.

The script sends a `POST` with `FormData` and `Accept: application/json`. It shows the success message **only** when the endpoint returns a 2xx response. Until an endpoint is set, submitting shows the error message with the email address. Never put API secrets or SMTP passwords in frontend code.

## Pre-launch checklist: items needing client confirmation

**Contact details**
- [ ] Email `hello@cleartradelogistics.co.za` and phone `062 149 2996`: confirm both are correct and monitored.
- [ ] Once confirmed, optionally add `email`/`telephone` to the JSON-LD in `index.html`. It currently lists only name, URL, logo and area served.

**Proposed copy (drafted from the brief, not yet approved)**
- [ ] Mission and vision statements (About)
- [ ] Brand values: Integrity, Accuracy, Reliability, Client focus (About)
- [ ] "Why work with us" benefit descriptions (About)
- [ ] Working process steps (About "How we work", Services "Our process")
- [ ] FAQ answers: review for regulatory accuracy
- [ ] Hero eyebrow "Customs & Trade Compliance Experts": confirm the client is comfortable with "experts"
- [ ] Short factual notes under services, e.g. "Permit approval decisions remain with the relevant regulatory authorities"

**Privacy and legal (POPIA)**
- [ ] The privacy notice on `contact.html#privacy` is a **draft**. Get the final wording approved, or replace it with a full privacy policy page.
- [ ] Choose and approve the form-processing provider (data location, retention).

**Consultation form**
- [ ] DMRE certificate field: confirm its purpose, format and whether it's needed. The DMRE was restructured in 2024, and petroleum regulation now sits with the Department of Mineral and Petroleum Resources (DMPR), so the label may need updating.

**Claims deliberately NOT made** (add only with evidence): SARS accreditation, AEO status, ITAC/SARS partnership or endorsement, guaranteed clearance times or approvals, statistics (years, clients, shipments), testimonials, freight/warehousing/transport services.

**Images**
- [ ] `vessel.jpg` has a watermark in the bottom-right corner. The site uses `vessel.webp`, which is cropped to remove it, but confirm the photo's licence or replace it.
- [ ] Confirm licences for `hero-ship.jpg`, `containers.jpg` and `trade-consultation.jpg`.
- [ ] `industry-automotive.webp` and `industry-solar.webp` are from Unsplash (Unsplash licence, no attribution required).
- [ ] `industry-petroleum.webp`: "Refinery Tanks 6" by Carl Young, [CC BY-SA 4.0](https://commons.wikimedia.org/wiki/File:Refinery_Tanks_6.jpg). The credit is shown on the Industries page. Replace it with a licensed stock photo if the client prefers no visible credit.
- [ ] `hero-ship.jpg` is only 736px wide. A higher-resolution version would look sharper on large screens.
- [ ] `assets/cleartrade-mark.png` (old logo) is no longer used and can be deleted.

**Before going live**
- [ ] Update `sitemap.xml` and canonical/OG URLs if a custom domain is configured.
- [ ] Run Lighthouse (performance, accessibility, SEO) on the deployed site.
