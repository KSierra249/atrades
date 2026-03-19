import type { FC, PropsWithChildren } from 'react';

type Props = {
  onClick?: () => unknown;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'reset' | 'submit';
  variant?: 'solid' | 'text';
  color?: 'normal' | 'danger';
  width?: 'auto' | 'full';
};

const Button: FC<PropsWithChildren<Props>> = ({
  onClick,
  className,
  children,
  disabled,
  type,
  variant,
  color,
  width,
}) => {
  const variantStyle =
    variant && variant === 'text'
      ? `${
          color === 'danger' ? 'text-red-800' : 'text-red-600'
        } disabled:text-gray-300 hover:bg-gray-100 disabled:bg-white`
      : 'text-white bg-red-600 disabled:bg-gray-300 hover:bg-red-500';
  return (
    <button
      className={`w-${
        width ?? 'full'
      } box-border ${variantStyle} rounded-sm font-semibold font-funnel-display p-2 transition ease-in-out ${className}`}
      onClick={onClick}
      disabled={disabled}
      type={type ?? 'button'}
    >
      {children}
    </button>
  );
};

export default Button;