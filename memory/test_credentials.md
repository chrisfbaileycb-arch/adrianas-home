# Hearth — Test Credentials

## Front Porch PINs (guest gate per tenant)
- @adriana  → PIN 1984
- @miller   → PIN 2024
- @lofi-nest → PIN 1234

## URLs
- Default/home tenant: /@adriana
- Owner mode: append ?role=owner  (e.g. /@adriana?role=owner)

## Stripe (TEST sandbox - Flow A claimable)
- Test card: 4242 4242 4242 4242, any future expiry, any CVC, any ZIP
- Plans: monthly ($5, lookup hearth_monthly), yearly ($40, lookup hearth_yearly)

## Firebase
- Google sign-in via Firebase (client-side). Content (recipes/albums/etc.) sync to Firestore,
  with graceful localStorage fallback if Firestore is unreachable.
