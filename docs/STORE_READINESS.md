# App Store / Google Play readiness

Where the iOS and Android apps stand, what is already in the code, and what still
needs an account, a credential or a decision. Update this file as items close.

## Done in code

| Area | What changed | Verified how |
|---|---|---|
| Sign-in return path | Google sign-in opens the system browser in the native app and returns through `com.tharwanet.app://auth-callback/...`. Email confirmation and password-reset links use the same route. Handled in `src/components/NativeAppBridge.tsx`, helpers in `src/lib/native.ts`. | Link parser tested against sample return URLs. **Not yet run on a device.** |
| Android back button | Goes back in history; exits at the root. | **Not yet run on a device.** |
| Account deletion | Settings → Data → Delete account. Edge function `delete-account` + SQL function `delete_user_account`. | SQL tested on a local Postgres with all migrations applied and two seeded users. |
| Legal pages | `/privacy` and `/terms`, linked from sign-up, the landing page and Settings. | Rendered at phone width. Content is a **draft** (see below). |
| Phone navigation | Bottom bar "More" menu now mirrors the desktop sidebar (`src/lib/navigation.ts` is the single source). "Install App" is hidden inside the native app. | Rendered at phone width. |
| Phone layout | Membership no longer renders two headers; floating buttons no longer overlap; bottom bar respects the iOS home indicator. | Rendered at phone width. |
| iOS project | Camera / photo purpose strings and the `com.tharwanet.app` URL scheme in `Info.plist`. | File parses. |
| Android project | `allowBackup="false"`, intent filter for `com.tharwanet.app://` links. | File parses. |
| Icons and splash | Generated from `src/assets/logo-icon.png` by `scripts/generate-native-assets.sh`. | Viewed. Source is 512px, so the 1024px store icon is upscaled. |
| Demo flows switch | The simulated bank connection, the mock checkout and made-up change figures are compiled out unless the build switches them on (see "Demo flows" below). | Built in all three modes; `scripts/check-store-build.mjs` passes on the store build and fails on the demo build. Every affected screen compared in both modes at phone width. |
| Challenge trigger bug | `update_challenge_progress()` read a non-existent `date` column, so anyone in an active challenge could not add, edit or delete a transaction. Fixed in migration `20261122085900`. | Reproduced and fixed on local Postgres. |

## Demo flows

Some screens only pretend: nothing real is behind them yet. They are controlled by
one build-time switch, `DEMO_FLOWS` (`src/lib/buildFlags.ts`, set in `vite.config.ts`).

| Command | Demo flows | Use for |
|---|---|---|
| `npm run dev` | on | Local development |
| `npm run build` | off, unless `VITE_DEMO_FLOWS=true` is set | The website |
| `npm run build:store` | always off, then checked | App Store / Google Play builds |
| `npm run build:demo` | always on | A demo copy of the site |

`npm run build:store` finishes by running `scripts/check-store-build.mjs`, which fails
if any demo screen is still inside the build. Do not ship a build that fails it.

What the switch covers, and what the app shows when it is off:

| Demo flow | When off |
|---|---|
| Simulated bank / platform connection (Home card, Settings → Banking, onboarding step 2) | Not shown. Onboarding is one step. `/admin?tab=banking` opens the first tab. |
| Mock checkout for paid plans | Not shown. Membership shows the current plan and "Paid plans are not available yet". "View Plans" links are removed from the landing page. |
| Made-up change percentages (net worth, asset classes, portfolio rows) | Not shown. |
| Made-up 12-month net worth history on Trends | Chart shows the projection from today's real figure; "Monthly change" shows "—". |

Left on in every build, on purpose: "Load demo data" (Settings → Data). It adds sample
entries to the user's own account at their request and says so.

The mock checkout is also switched off on the server. The `mock-checkout` function
refuses every request unless the secret `ALLOW_MOCK_CHECKOUT` is set to `true` on the
Supabase project. Leave it unset in production: without that, any signed-in person
could give themselves a paid plan for free by calling the function directly.

To keep the demo flows on the public website for now, add `VITE_DEMO_FLOWS="true"` to
the website's environment and set `ALLOW_MOCK_CHECKOUT=true` on the backend. Store
builds ignore the first setting.

Still open, because they are product decisions:
- Features locked to a paid plan have no way to be unlocked while there is no real
  checkout. Before a store release, either set those modules to the free plan or
  finish in-app purchase.
- Bank accounts added through the simulated connection are still counted in net
  worth, but there is no screen to edit them when the switch is off.

## Needs you (accounts, credentials, decisions)

### Backend
- [ ] Apply the two new migrations (`20261122085900_…`, `20261122090000_…`) and deploy the `delete-account` function to the production backend.
- [ ] In Supabase Auth → URL configuration, add `com.tharwanet.app://auth-callback/**` to **Redirect URLs**. Without it, sign-in and email links open the website instead of the app.
- [ ] Confirm which Supabase project is production (the repo points at `vmpenssdavqqhmhdejok`).
- [ ] Redeploy the `mock-checkout` function so the server-side switch takes effect, and leave `ALLOW_MOCK_CHECKOUT` unset in production.

### Legal
- [ ] Fill in the company fields in `src/lib/legal.ts`, have both documents reviewed, then set `isDraft: false`.
- [ ] Host the privacy policy at a public URL for the store listings (`https://tharwanet.com/privacy` once deployed).

### Apple
- [ ] Enrol as an **organisation** (finance apps are expected to come from the legal entity).
- [ ] Add **Sign in with Apple** (required alongside Google sign-in): enable the capability, configure the provider in Supabase, add the button.
- [ ] Push: enable the Push Notifications capability and create an APNs key.
- [ ] In-app purchase for paid plans. (The mock checkout no longer ships in store builds.)
- [ ] App Privacy answers, screenshots (iPhone, and iPad unless iPad support is removed).

### Google
- [ ] Create an upload keystore and add the release signing config in `android/app/build.gradle`.
- [ ] Add `android/app/google-services.json` from Firebase for push.
- [ ] Play Console: Data safety form, financial-features declaration, account-deletion URL.
- [ ] Play Billing for paid plans.

### Product decisions before submission
- [x] Demo bank connection ("any 6-digit OTP") and mock checkout are left out of store builds (see "Demo flows").
- [ ] Decide what paid-plan-only features do until real billing exists (see "Demo flows").
- [ ] Voice input uses the browser speech API, which in-app web views generally lack. Needs a native speech plugin, the microphone/speech purpose strings on iOS and `RECORD_AUDIO` on Android.
- [ ] Replace `src/assets/logo-icon.png` with 1024px+ artwork and re-run `scripts/generate-native-assets.sh`.

## Testing on a device

```sh
npm run build:store && npx cap sync
npx cap open ios        # or: npx cap open android
```

Check, in order: Google sign-in returns to the app; a password-reset email opens the
reset form in the app; Android back button; Settings → Data → Delete account on a
throwaway account.
