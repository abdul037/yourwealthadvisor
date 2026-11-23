/**
 * Build-time switches. These are fixed when the app is built, not at run time,
 * so anything behind a switched-off flag is left out of the shipped app entirely.
 *
 * DEMO_FLOWS covers everything that pretends to be real but is not:
 *   - the simulated bank / platform connection ("any 6-digit OTP")
 *   - the mock checkout for paid plans
 *   - made-up change percentages and net worth history
 *
 * On for `npm run dev`; off for `npm run build` and `npm run build:store`.
 * See docs/STORE_READINESS.md ("Demo flows").
 */
export const DEMO_FLOWS: boolean = __DEMO_FLOWS__;
