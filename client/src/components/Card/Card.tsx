import { forwardRef, type PropsWithChildren } from 'react';

type Props = {
  className?: string;
  padding?: number;
};

const Card = forwardRef<HTMLDivElement, PropsWithChildren<Props>>(
  ({ className, children, padding }, ref) => {
    return (
      <div
        className={`bg-white rounded-md border-2 border-gray-200 p-${
          padding ?? 8
        } ${className}`}
        ref={ref}
      >
        {children}
      </div>
    );
  }
);

export default Card;
