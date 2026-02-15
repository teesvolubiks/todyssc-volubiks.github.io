Manual test plan — Checkout & Payment features

1) Quantity controls (Checkout)
  - Add several products to the cart (Shop -> Add).
  - Go to /checkout.
  - Click + on an item and confirm quantity increases and line total updates.
  - Click - and confirm quantity decreases; when it reaches 0 the item should be removmed.
  - Confirm Subtotal, VAT (10%), and Total update accordingly.
  - Confirm header cart badge updates when quantities change.

2) Shipping info (Payment)
  - From Checkout click "Proceed to Payment".
  - Confirm the shipping form is pre-filled if you previously saved shipping info.
  - Try submitting with missing fields — errors should appear and payment should not proceed.
  - Enter valid shipping info, check "Save shipping info", and complete (simulate) a payment; confirm `rv_shipping` is stored in localStorage.

3) Payment flow
  - On Payment, click the simulated "Pay" button; confirm it clears cart, shows success message, and header cart count updates to 0.
  - Click "Pay with Stripe (test)" — if there is no backend configured you should see a helpful alert directing you to PAYMENT_INTEGRATION.md.

4) Edge cases
  - Empty cart navigation to /checkout should show an empty message and link back to shop.
  - Large quantities / large totals should correctly calculate VAT and totals.

If you want automated tests (unit/integration), I can add a lightweight test runner (Vitest + React Testing Library) and write tests for these behaviors.