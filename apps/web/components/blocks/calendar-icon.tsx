interface CalendarIconProps {
  className?: string;
}

export const CalendarIcon: React.FC<CalendarIconProps> = (props) => {
  const { className } = props;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="90"
      height="90"
      viewBox="0 0 90 90"
      fill="none"
      className={className}
    >
      <rect width="90" height="90" rx="8" fill="#FCD0CC" />
      <path
        d="M0 8C0 3.58172 3.58172 0 8 0H82C86.4183 0 90 3.58172 90 8V26H0V8Z"
        fill="#B33022"
      />
    </svg>
  );
};
