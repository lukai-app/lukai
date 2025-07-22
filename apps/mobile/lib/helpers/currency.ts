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
      currency: currencyCode,
    }).format(majorUnits);
  } catch (e: any) {
    // A fallback in case the NumberFormat fails for any reason
    return majorUnits.toFixed(2);
  }
}

export const formatBigNumber = ({
  value,
  decimals = true,
  withCurrency,
}: {
  value: number;
  decimals: boolean;
  withCurrency?: {
    currencyCode: string;
    locale?: string;
  };
}) => {
  const numValue = Number(value);
  if (numValue >= 1000) {
    return `${(numValue / 1000).toFixed(0)}k`;
  } else if (numValue >= 1000000) {
    return `${(numValue / 1000000).toFixed(0)}M`;
  } else if (numValue >= 1000000000) {
    return `${(numValue / 1000000000).toFixed(0)}B`;
  } else if (numValue >= 1000000000000) {
    return `${(numValue / 1000000000000).toFixed(0)}T`;
  }
  return decimals ? numValue.toString() : Math.floor(numValue).toString();
};
