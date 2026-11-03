# Raghavendra Kirana & General Store

A responsive, bilingual (English/Telugu), mobile-first static storefront built with HTML, CSS and vanilla JavaScript.

## Files
- `index.html` — page structure and content
- `style.css` — responsive visual design
- `script.js` — catalogue, search, filters, cart and WhatsApp order message

## Before publishing
1. Open `script.js`.
2. Replace `91XXXXXXXXXX` in `SHOP_WHATSAPP_NUMBER` with the shop's WhatsApp number, including India's country code `91`, with no `+`, spaces or punctuation. Example format: `919876543210`.
3. Review the shop location, phone and hours placeholders in `index.html`.
4. Verify the actual product list, current prices, sizes/units and stock with the shop. The starter catalogue intentionally does not invent prices or stock.
5. Replace the illustrative letter-based product tiles with genuine product photos if desired.

## How orders work
Customers add catalogue items to the cart and choose **Continue to WhatsApp**. The site prepares a bilingual item list and asks the customer to confirm prices, availability, pickup/delivery and address directly with the shop. No payment is collected on the website.

If the WhatsApp number is still a placeholder, the order message is copied to the clipboard (where supported) so the flow can be tested. Add the real number before launch.

## Run locally
Open `index.html` in a browser. No build step or dependencies are required. Google Fonts are optional; the page falls back to system fonts if offline.

## Deploy with GitHub + Cloudflare Pages
1. Create a GitHub repository, for example `raghavendra-kirana`.
2. Upload all four project files (`index.html`, `style.css`, `script.js`, `README.md`) to the repository root.
3. In Cloudflare, open **Workers & Pages → Create application → Pages → Connect to Git**.
4. Select the repository and use:
   - Framework preset: **None**
   - Build command: leave blank (or `exit 0` if the dashboard requires a command)
   - Build output directory: `/` or `.` (the repository root, depending on the dashboard field)
5. Deploy. Cloudflare Pages will provide a `pages.dev` preview URL.
6. Add a custom domain later from the Pages project's **Custom domains** section.

## Important operational notes
- This is a static first version. Cart contents live in the current browser session and are not saved to a server.
- Product prices and stock are intentionally marked for confirmation. Update catalogue data only after the shop verifies it.
- Delivery is not promised automatically. Confirm service area, delivery partner, fee and timing with the customer.
- Do not put private customer information, API keys or passwords in a public GitHub repository.
