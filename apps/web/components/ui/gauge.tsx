import { cn } from '@/lib/utils';

export const Gauge = ({
  value,
  size = 'small',
  showValue = true,
  circleClassName,
  backgroundClassName,
  customSize,
  strokeWidth = '12',
  children,
}: {
  value: number;
  size: 'small' | 'medium' | 'large';
  showValue: boolean;
  circleClassName?: string;
  backgroundClassName?: string;
  customSize?: string;
  strokeWidth?: string;
  children?: React.ReactNode;
}) => {
  const circumference = 332; //2 * Math.PI * 53; // 2 * pi * radius
  const valueInCircumference = (value / 100) * circumference;
  const strokeDasharray = `${circumference} ${circumference}`;
  const initialOffset = circumference;
  const strokeDashoffset = initialOffset - valueInCircumference;

  const sizes = {
    small: {
      width: '40',
      height: '40',
      textSize: 'text-xs',
    },
    medium: {
      width: '72',
      height: '72',
      textSize: 'text-lg',
    },
    large: {
      width: '144',
      height: '144',
      textSize: 'text-3xl',
    },
  };

  return (
    <div className="flex flex-col items-center justify-center relative">
      <svg
        fill="none"
        shapeRendering="crispEdges"
        height={customSize || sizes[size].height}
        width={customSize || sizes[size].width}
        viewBox="0 0 120 120"
        strokeWidth="2"
        className="transform -rotate-90"
      >
        <circle
          className={cn('text-[#333]', backgroundClassName)}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          shapeRendering="geometricPrecision"
          r="53"
          cx="60"
          cy="60"
        />
        <circle
          className={cn(
            `text-[hsla(131,41%,46%,1)] animate-gauge_fill`,
            circleClassName
          )}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={initialOffset}
          shapeRendering="geometricPrecision"
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="53"
          cx="60"
          cy="60"
          style={{
            strokeDashoffset: strokeDashoffset,
            transition: 'stroke-dasharray 1s ease 0s,stroke 1s ease 0s',
          }}
        />
      </svg>
      {children}
      {showValue ? (
        <div className="absolute flex opacity-0 animate-gauge_fadeIn">
          <p className={`text-muted-foreground ${sizes[size].textSize}`}>
            {value}
          </p>
        </div>
      ) : null}
    </div>
  );
};
