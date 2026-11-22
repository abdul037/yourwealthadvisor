/**
 * Details shown on the Privacy Policy and Terms of Service pages.
 *
 * BEFORE PUBLISHING (web or app stores):
 *   1. Fill in the empty fields below.
 *   2. Have both documents reviewed by a lawyer for the markets you launch in.
 *   3. Set `isDraft` to false — this removes the "Draft" banner from both pages.
 */
export const LEGAL = {
  isDraft: true,
  appName: 'Tharwa Net',
  /** Registered legal entity that operates the app, e.g. "Example FZ-LLC". */
  entityName: '',
  /** Registered address of that entity. */
  entityAddress: '',
  /** Address users can write to about privacy, support and account questions. */
  contactEmail: '',
  /** Governing law / courts for the Terms, e.g. "the laws of the United Arab Emirates". */
  governingLaw: '',
  /** How long deleted data can remain in backups, e.g. "30 days". */
  backupRetention: '',
  lastUpdated: '22 November 2026',
};

/** Shows the value, or a visible placeholder while the field is still empty. */
export const legalValue = (value: string, label: string): string =>
  value.trim() ? value : `[${label}: to be added]`;
