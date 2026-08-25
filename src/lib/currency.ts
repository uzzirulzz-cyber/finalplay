/**
 * Currency conversion utilities for PlayBeat storefront.
 *
 * Base currency: USD (all products stored with USD `price` field)
 * Supported display currencies: PKR, USD, GBP, AED
 */

export type CurrencyCode = 'PKR' | 'USD' | 'GBP' | 'AED'

export const SUPPORTED_CURRENCIES: CurrencyCode[] = ['PKR', 'USD', 'GBP', 'AED']

// 1 USD → target currency (approximate, Aug 2026)
export const DISPLAY_RATES: Record<CurrencyCode, number> = {
  PKR: 280,
  USD: 1,
  GBP: 0.79,
  AED: 3.67,
}

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  PKR: 'Rs',
  USD: '$',
  GBP: '£',
  AED: 'AED',
}

export const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  PKR: 'PKR — Pakistani Rupee',
  USD: 'USD — US Dollar',
  GBP: 'GBP — British Pound',
  AED: 'AED — UAE Dirham',
}

/**
 * Convert a USD price to the target display currency.
 */
export function convertFromUSD(usdPrice: number, target: CurrencyCode): number {
  const rate = DISPLAY_RATES[target] ?? 1
  return Math.round(usdPrice * rate * 100) / 100
}

/**
 * Format a price for display: "Rs 8,736" / "$31.20" / "£24.65" / "AED 114.42"
 */
export function formatPrice(usdPrice: number, currency: CurrencyCode): string {
  const converted = convertFromUSD(usdPrice, currency)
  const symbol = CURRENCY_SYMBOLS[currency]
  const formatted = converted.toLocaleString('en-US', {
    minimumFractionDigits: converted < 10 ? 2 : 0,
    maximumFractionDigits: 2,
  })
  // For AED, place code AFTER the number; for symbol-based, place before
  if (currency === 'AED') return `AED ${formatted}`
  return `${symbol} ${formatted}`
}
