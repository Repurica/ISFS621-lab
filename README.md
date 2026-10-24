# CDC Vouchers 2027 — Scan to Pay

A working React prototype of the CDC Vouchers scan-to-pay flow, rebuilt from the Figma screens.

## Screens

1. Singpass login
2. Household claim confirmation
3. Voucher dashboard
4. SGQR scanner
5. Bill review and voucher selection
6. Retailer payment confirmation

Every visible control works, including the live scanner camera and torch, offline code, editable bill, voucher-count picker, report-issue sheet, prototype menu, sound toggle, and demo reset.

## Live camera

The Scan to pay screen requests the rear camera automatically and shows a live preview behind the SGQR frame.

- Camera access needs HTTPS or `localhost`. A phone opening a local `http://192.168.x.x` address cannot use the camera; use the deployed HTTPS URL.
- The feed stays on the device. There is no recording or upload.
- There is no QR decoding: “Simulate SGQR Scan” still advances the prototype to review.
- Torch uses the device torch where the browser supports it and falls back to the visual torch effect elsewhere.
- If permission is denied or no camera is available, simulation and the offline code still work. Tap the preview to retry camera access.

## Run locally

```bash
npm install
npm run dev
```

Open the printed local URL. The app is designed for a 390 × 844 phone viewport; wider screens show it inside a phone shell.

## Checks

```bash
npm test
npm run build
```

- 23 unit tests cover the payment math and state transitions.
- Production output is written to `dist/`.

## Demo behaviour

- Seed balances match the design: $500 claimed, $320 used, $180 left.
- A $12.50 hawker payment spends six $2 vouchers and leaves $0.50 cash.
- Demo state persists in `localStorage`.
- “Where to spend” intentionally shows a prototype-only toast.
- Restart demo clears balances from the prototype menu and returns to login.
