/**
 * The privacy policy is too long for the flat key/value dictionaries the rest of the
 * i18n uses, so it is modelled as structured content and rendered generically.
 * `text` may contain inline HTML (links only); it is rendered through Angular's
 * sanitizer, which strips anything executable.
 */
export type PrivacyBlock =
  | { type: 'p'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'table'; head: string[]; rows: string[][] };

export interface PrivacySection {
  id: string;
  heading: string;
  blocks: PrivacyBlock[];
}

export interface PrivacyContent {
  title: string;
  updated: string;
  tocHeading: string;
  cookieSettingsIntro: string;
  sections: PrivacySection[];
}
