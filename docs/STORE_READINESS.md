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
| Challenge trigger bug | `update_challenge_progress()` read a non-existent `date` column, so anyone in an active challenge could not add, edit or delete a transaction. Fixed in migration `20261122085900`. | Reproduced and fixed on local Postgres. |

## Needs you (accounts, credentials, decisions)

### Backend
- [ ] Apply the two new migrations (`20261122085900_…`, `20261122090000_…`) and deploy the `delete-account` function to the production backend.
- [ ] In Supabase Auth → URL configuration, add `com.tharwanet.app://auth-callback/**` to **Redirect URLs**. Without it, sign-in and email links open the website instead of the app.
- [ ] Confirm which Supabase project is production (the repo points at `vmpenssdavqqhmhdejok`).

### Legal
- [ ] Fill in the company fields in `src/lib/legal.ts`, have both documents reviewed, then set `isDraft: false`.
- [ ] Host the privacy policy at a public URL for the store listings (`https://tharwanet.com/privacy` once deployed).

### Apple
- [ ] Enrol as an **organisation** (finance apps are expected to come from the legal entity).
- [ ] Add **Sign in with Apple** (required alongside Google sign-in): enable the capability, configure the provider in Supabase, add the button.
- [ ] Push: enable the Push Notifications capability and create an APNs key.
- [ ] In-app purchase for paid plans; the mock checkout must not ship.
- [ ] App Privacy answers, screenshots (iPhone, and iPad unless iPad support is removed).

### Google
- [ ] Create an upload keystore and add the release signing config in `android/app/build.gradle`.
- [ ] Add `android/app/google-services.json` from Firebase for push.
- [ ] Play Console: Data safety form, financial-features declaration, account-deletion URL.
- [ ] Play Billing for paid plans.

### Product decisions before submission
- [ ] Demo bank connection ("any 6-digit OTP") and mock checkout must be removed or hidden in store builds.
- [ ] Voice input uses the browser speech API, which in-app web views generally lack. Needs a native speech plugin, the microphone/speech purpose strings on iOS and `RECORD_AUDIO` on Android.
- [ ] Replace `src/assets/logo-icon.png` with 1024px+ artwork and re-run `scripts/generate-native-assets.sh`.

## Testing on a device

```sh
npm run build && npx cap sync
npx cap open ios        # or: npx cap open android
```

Check, in order: Google sign-in returns to the app; a password-reset email opens the
reset form in the app; Android back button; Settings → Data → Delete account on a
throwaway account.
