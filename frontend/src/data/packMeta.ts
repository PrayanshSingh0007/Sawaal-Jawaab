/**
 * Just the pack labels.
 *
 * The full catalogue lives in `packs.ts`, which is only loaded by the screens
 * that display it. Keeping these few strings separate stops 120 phrases from
 * being bundled into the first thing anyone downloads.
 */
export const PACK_TITLES: Record<string, string> = {
  hospital: 'Hospital',
  chemist: 'Chemist',
  bank: 'Bank',
  police: 'Police',
  travel: 'Railway / Bus',
  school: 'School',
  shop: 'Shop',
  office: 'Office',
  rent: 'Rent / Landlord',
  emergency: 'Emergency',
}

/** Sensible first phrases, before anyone has used the app enough to have their own. */
export const STARTER_PHRASES: string[] = [
  'Where do I submit this form?',
  'How much does this cost?',
  'Please write it down for me.',
]
