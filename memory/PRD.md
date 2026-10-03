# Hearth — Product Requirements & Progress

## Problem statement
A "MySpace-reborn" platform: a sovereign, private, family/friends-only space anyone can link to from a Facebook/Instagram/YouTube/TikTok bio. Videos & media are NEVER hosted — only linked by source (Google Photos, iCloud, Spotify, etc.) so the platform carries zero media-storage liability. People share personal recipes, photo-album links, scripture, journal thoughts, and a daily planner in a space they can deeply personalize. Goal: improve on what social media was meant for (genuine private connection), not replace or copy it.

## Stack (migrated into Emergent layout)
- Frontend: Vite + React 19 + TypeScript + Tailwind v4 (`/app/frontend`, port 3000). Firebase (Firestore + Google sign-in) for content sync with localStorage fallback.
- Backend: FastAPI + MongoDB (`/app/backend`, port 8001, routes under `/api`). Replaced the old Express server; holds the tenant registry + Stripe.
- Payments: REAL Stripe (claimable sandbox, test mode, Flow A). Plans: $5/mo (`hearth_monthly`), $40/yr (`hearth_yearly`). Tax mode = **full** (Stripe Managed Payments / SMP) with automatic_tax fallback. Sandbox account country: US.

## User personas
- Owner (family creator): claims an `@slug`, customizes theme/modules, sets a family PIN, shares the bio link.
- Guest (family/friends): opens the bio link, enters the 4-digit Front Porch PIN, views the space (read-only).

## Core requirements (static)
- Multi-tenant sovereign spaces at `/@slug`, PIN-gated "Front Porch".
- Modules: recipes, shared photo albums (outbound links only), scripture, thoughts/journal, daily planner + reminders, music links.
- Deep personalization: themes, fonts, flower wallpapers.
- No media hosting — outbound links only.
- Paid subscription to provision a new sanctuary.

## Implemented (2026-06)
- Re-fit Google-AI-Studio app → Emergent frontend+backend; runs & previews here. (keeping Firebase)
- FastAPI tenant API: list/get/create/update tenants, PIN verify (POST + GET), seeded tenants adriana/miller/lofi-nest.
- REAL Stripe subscription flow: `/api/payments/checkout` → hosted checkout → `/payment/success` polls `/api/payments/status/{id}` → provisions sanctuary (idempotent; also via webhook `/api/stripe/webhook`).
- Bug fixes: guest PIN unlock (switched verify to reliable GET); "Adriana's" apostrophe across title/nav/home/notification.
- **Space Personalization**: added Accent Color picker (8 presets + custom) applied via `--accent` CSS var; existing themes/fonts/flowers/layouts retained.
- **Original Music Library**: 8 royalty-free starter tracks (`data/musicLibrary.ts`) with inline preview + add-to-shelf in the Personalize → Music tab.
- **Guided Onboarding** (`OwnerOnboarding.tsx`): first-run owner checklist (space live → customize look → add music → copy bio link) with progress + persistence.
- **Mobile polish**: TenantBar owner top-strip now wraps (flex-wrap) to avoid horizontal overflow at 390px.
- Tested: backend 15/15; PIN unlock verified for all 3 tenants; Stripe checkout+redirect+status verified; all 4 new features verified end-to-end by testing agent (iteration_3).

## Known limitations / notes
- Stripe sandbox hosted "Pay" page can't be automated (Link signup + unclaimed-sandbox banner) — real customers pay normally; owner should claim the sandbox via the Payments tab to go live.
- Firebase/Firestore may be unreachable in preview (google domains blocked) → app uses localStorage fallback.
- `FrontPorchView.handleQuickUnlock` hardcodes 1984 (only affects @adriana's demo quick-button); keypad works for all tenants.

## Backlog / Next
- P1: Deep personalization polish (themes, fonts, layouts, custom music library of original tracks) — the user's #1 "wow".
- P1: Mobile responsiveness pass + onboarding flow refinement (claim @name → customize → share).
- P2: Make the guest-PIN quick button tenant-aware (or hide on non-demo tenants).
- P2: Owner-authored royalty-free music selection users can choose from.
- P2: Claim Stripe sandbox + go live; consider payment_method_types tuning.
