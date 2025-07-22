interface CategoriesIconProps {
  className?: string;
}

export const CategoriesIcon: React.FC<CategoriesIconProps> = (props) => {
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
      <rect x="55" width="33" height="15.4181" rx="7.70903" fill="#FACF4F" />
      <rect
        x="39"
        y="77.582"
        width="33"
        height="15.4181"
        rx="7.70903"
        fill="#D77408"
      />
      <rect
        x="60"
        y="36.0203"
        width="33"
        height="15.4181"
        rx="7.70903"
        fill="#F39C12"
      />
      <rect
        x="15"
        y="38.7908"
        width="33"
        height="15.4181"
        rx="7.70903"
        fill="#F9BB26"
      />
      <rect width="33" height="15.4181" rx="7.70903" fill="#B33022" />
    </svg>
  );
};
