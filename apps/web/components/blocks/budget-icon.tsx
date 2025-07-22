interface BudgetIconProps {
  className?: string;
}

export const BudgetIcon: React.FC<BudgetIconProps> = (props) => {
  const { className } = props;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="93"
      height="93"
      viewBox="0 0 93 93"
      fill="none"
      className={className}
    >
      <circle cx="46.5" cy="46.5" r="46.5" fill="#3498DB" />
      <circle cx="47" cy="46" r="30" fill="white" />
      <circle cx="47" cy="46" r="15" fill="#3498DB" />
    </svg>
  );
};
