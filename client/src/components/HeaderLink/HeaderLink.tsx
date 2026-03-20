import { FC, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';

type Props = {
  label: string;
  to: string;
};

const HeaderLink: FC<Props> = ({ label, to }) => {
  const location = useLocation();
  const highlighted = useMemo(
    () => location.pathname.includes(to),
    [location.pathname, to]
  );

  const highlightedStyle = 'text-red-700 hover:text-red-600 text-xl';
  const unhighlightedStyle = 'text-black hover:text-gray-300 text-xl';

  return (
    <Link
      to={to}
      className={`font-semibold ${
        highlighted ? highlightedStyle : unhighlightedStyle
      } font-funnel-display transition`}
    >
      {label}
    </Link>
  );
};

export default HeaderLink;