/**
 * NomadLedger — Currency Formatter Utility
 *
 * ─────────────────────────────────────────────────────────────────────────
 * THE BUG THAT WAS FIXED:
 * The previous version derived the locale from the USER'S HOME COUNTRY
 * (e.g. 'de-DE' for Germany, 'nl-NL' for Netherlands). This caused amounts
 * in OTHER currencies (like INR) to be formatted with European number style
 * (dots as thousands separators): ₹25,000 → "250.000 ₹" ❌
 *
 * THE RULE:
 * The locale must come from the CURRENCY being displayed, not the user's
 * home country. A ₹25,000 INR amount is ALWAYS formatted as "₹25,000"
 * regardless of whether the user is based in Germany, Netherlands, or India.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Always use this instead of raw `new Intl.NumberFormat(...)`.
 *
 * @param amount      - The numeric amount to format
 * @param currency    - ISO 4217 currency code (e.g. 'USD', 'INR', 'EUR')
 * @param _countryCode - Kept for API compatibility but NO LONGER USED for locale.
 *                      Locale is derived from the currency itself.
 */

/**
 * Maps each supported currency to the correct Intl locale for formatting.
 *
 * Key decisions:
 * - INR → 'en-IN'  : Indian lakh comma system  ₹25,000 / ₹2,50,000
 * - All others     : 'en-US' or English variant  $25,000 / €25,000
 *
 * We deliberately use English-based locales for EUR, GBP etc. to avoid
 * European dot-separators (e.g. "2.500 €") which are unfamiliar to users
 * coming from an international freelancing context.
 */
const CURRENCY_LOCALE_MAP: Record<string, string> = {
  INR: 'en-IN',  // ₹25,000 — Indian lakh system
  USD: 'en-US',  // $25,000
  EUR: 'en-US',  // €25,000  (international English, NOT "25.000 €")
  GBP: 'en-GB',  // £25,000
  AUD: 'en-AU',  // A$25,000
  CAD: 'en-CA',  // CA$25,000
  SGD: 'en-SG',  // S$25,000
  JPY: 'ja-JP',  // ¥25,000
  CHF: 'en-US',  // CHF 25,000
  SEK: 'en-US',  // kr25,000
  NOK: 'en-US',  // kr25,000
  DKK: 'en-US',  // kr25,000
}

function getLocaleForCurrency(currency: string): string {
  return CURRENCY_LOCALE_MAP[currency?.toUpperCase()] ?? 'en-US'
}

/**
 * @deprecated Use getLocaleForCurrency instead. Kept for any code that
 * still calls getLocaleForCountry directly.
 */
export function getLocaleForCountry(_countryCode: string): string {
  return 'en-US'
}

export function formatCurrency(
  amount: number,
  currency: string,
  _countryCode?: string   // ignored — locale comes from currency now
): string {
  const safeCurrency = currency?.toUpperCase() || 'USD'
  const locale = getLocaleForCurrency(safeCurrency)

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: safeCurrency,
    maximumFractionDigits: 0,
  }).format(amount)
}
