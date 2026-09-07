/**
 * Saudi Riyal (SAR / SR) Currency Utility Helper
 */

export const CURRENCY_SYMBOL = 'SAR';
export const CURRENCY_CODE = 'SAR';

/**
 * Format a numeric amount into Saudi Riyal (SAR) representation.
 * Example: 1250.5 -> "SAR 1,250.50" or "SAR 1,250"
 */
export function formatCurrency(
  amount: number | null | undefined,
  showDecimals = false,
  symbol = CURRENCY_SYMBOL
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${symbol} 0`;
  }

  const formattedNum = showDecimals
    ? amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : amount.toLocaleString('en-US', { maximumFractionDigits: 2 });

  return `${symbol} ${formattedNum}`;
}

/**
 * Format string with sign prefix e.g. "+ SAR 1,250" or "- SAR 500"
 */
export function formatCurrencyWithSign(
  amount: number | null | undefined,
  showPlusSign = false,
  showDecimals = false
): string {
  const val = amount || 0;
  const absFormatted = formatCurrency(Math.abs(val), showDecimals);

  if (val > 0) {
    return showPlusSign ? `+ ${absFormatted}` : absFormatted;
  } else if (val < 0) {
    return `- ${absFormatted}`;
  }
  return absFormatted;
}
