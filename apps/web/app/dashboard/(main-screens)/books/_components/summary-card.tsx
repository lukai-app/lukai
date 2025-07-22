import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  amount: number;
  currency: string;
  locale: string;
  icon?: string;
  negativeColor?: string;
  badgeText: string;
  badgeColor: 'green' | 'red' | 'blue';
  details?: Array<{ label: string; value: number }>;
}

export function SummaryCard({
  title,
  amount,
  currency,
  locale,
  icon,
  negativeColor,
  badgeText,
  badgeColor,
  details,
}: SummaryCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getBadgeColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'red':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'blue':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <Card className="relative">
      <CardHeader className="flex flex-row items-center justify-between py-3 px-6 border-b border-gray-800/50">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-6 h-6 flex items-center justify-center">
              {/* Icon component would go here */}
            </div>
          )}
          <CardTitle className="text-white text-lg font-medium">
            {title}
          </CardTitle>
        </div>
        <Badge
          variant="outline"
          className={`${getBadgeColor(badgeColor)} px-3 py-1 rounded-full`}
        >
          {badgeText}
        </Badge>
      </CardHeader>

      <CardContent className="p-4">
        <div className="flex flex-col gap-2">
          <div
            className={`text-2xl font-bold ${negativeColor || 'text-white'}`}
          >
            {formatCurrency(amount)}
          </div>
          {details && (
            <div className="mt-2 space-y-1">
              {details.map((detail, index) => (
                <div
                  key={index}
                  className="flex justify-between text-sm text-gray-400"
                >
                  <span>{detail.label}</span>
                  <span>{formatCurrency(detail.value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
