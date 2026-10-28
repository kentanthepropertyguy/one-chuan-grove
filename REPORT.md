# One Chuan Grove · framework 1.5.2 quick calculator · 28 Oct 2026

**Status: prepared, not uploaded or deployed.** Built from the live Release C source (framework 1.5.1), which still rebuilds the live page byte for byte. Only the calculator change is added.

## Changes
- **New Affordability section, directly after Pricing.** It has three inputs and five figures, and the figures update as you type:
  - inputs: purchase price (starts blank), interest rate (4.0, illustrative) and loan tenure (up to 30 years);
  - figures: monthly instalment on the fully drawn loan, bank loan (75%, illustrative), minimum cash (5%), remaining downpayment (20%, cash or CPF) and Buyer's Stamp Duty.
- **Wording:**
  - Directly under the monthly instalment: "Full-loan illustration over the selected tenure. After TOP, repayments may be higher if the loan tenure began during construction." The detail stays in "How this is worked out". The lower line no longer repeats "The instalment assumes the loan is fully drawn" (shared template, same on all three sites).
  - One line under the results: "The 75% loan is an illustration: your actual loan depends on any other home loans, your age and the tenure." The detail sits in a closed "How this is worked out" section.
  - The section's opening line reads: "Prices aren't released yet. Enter any price you're considering."
  - The psf estimates are never used as a price.
- **"Need a more detailed calculation?"** It has "Explore detailed calculations ›" to Groundwork's "What will this home cost me?" in a new tab. Attribution is added on click; no figures are passed.
- **Navigation:** "Affordability" is added to the header and the section buttons.
- **Groundwork section:** the separate "Payment timeline (for when prices are out)" link is removed, so the same Groundwork page isn't listed twice.
- **Section backgrounds:** later sections swap white and grey so they keep alternating. Their content is unchanged.
- **Footer:** reads "Microsite framework 1.5.2".

## Unchanged
Pricing and its reference points, every other section's text, evidence labels, images, WhatsApp links and campaign codes, other Groundwork links, analytics, URLs and SEO tags. The development registry (homepage listing) is not touched.

## Checks: 127 pass, 0 fail (details in VALIDATION.txt)
- The figures match Groundwork's engine: 6,874 of 6,874 parity checks pass.
- Invalid input gets a plain message: wrong or negative price, rate outside 0–20%, tenure 0, blank fields, and more than 30 years (which resets to 30).
- Inputs sit beside the results on desktop and above them on mobile.
- The Groundwork link opens the right page in a new tab, with the price blank, and a typed price works there.
- The design is the same as on the other two sites, including the new line under the instalment.
- No sideways scroll and no script errors. Layout check 16/16 and framework suite 66/66.
