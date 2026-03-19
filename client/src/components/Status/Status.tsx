import type { FC, PropsWithChildren } from 'react';

type Props = {
  type: 'error' | 'success';
  className?: string;
};

const Status: FC<PropsWithChildren<Props>> = ({ type, className, children }) => {
  const colorClasses =
    type === 'error'
      ? 'bg-red-100 border-red-200 text-red-900'
      : type === 'success' 
      ? 'bg-green-100 border-green-200 text-green-900'
      : 'bg-red-300 border-red-500';

  return (
    <div className={`p-2 border-2 rounded-sm ${colorClasses} ${className}`}>
      {children}
    </div>
  );
};

export default Status;