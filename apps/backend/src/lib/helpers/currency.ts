import countryToCurrency from 'country-to-currency';
import { getCountry } from 'countries-and-timezones';

export const valueFormatter = (number: number) =>
  `$${new Intl.NumberFormat('us').format(number).toString()}`;

export function formatCurrency(
  value: number,
  currencyCode: string,
  locale?: string
) {
  const majorUnits = value / 100;
  try {
    // Note: if no `locale` is provided, the browser's default
    // locale will be used.
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode
    }).format(majorUnits);
  } catch (e: any) {
    // A fallback in case the NumberFormat fails for any reason
    return majorUnits.toFixed(2);
  }
}

export function countryCodeToLanguageCode(countryCode: string) {
  const locale = new Intl.Locale('und', { region: countryCode });
  const maximizedLocale = locale.maximize(); // the magic
  return maximizedLocale.language;
}

export function countryCodeToCurrencyCode(countryCode: string): string | null {
  const currency = (countryToCurrency as any)[countryCode as any] ?? null;
  return currency;
}

export function countryCodeToTimezone(countryCode: string): string | null {
  const timezone = getCountry(countryCode)?.timezones[0] ?? null;
  return timezone;
}
