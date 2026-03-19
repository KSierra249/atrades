import { type FC, type HTMLInputTypeAttribute, useRef, useEffect } from 'react';

type Props = {
  id: string;
  value: string;
  setValue: (newValue: string) => void;
  label?: string;
  placeholder?: string;
  type?: HTMLInputTypeAttribute;
  required?: boolean;
  className?: string;
  textarea?: boolean;
  rows?: number;
  autofocus?: boolean;
};

const Input: FC<Props> = ({
  value,
  setValue,
  id,
  label,
  placeholder,
  type,
  required,
  className,
  textarea,
  rows,
  autofocus,
}) => {
  const Tag = textarea ? 'textarea' : 'input';
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autofocus) {
      inputRef.current?.focus();
    }
  }, [autofocus]);

  return (
    <div className={`flex flex-col gap-1 ${className ?? ''}`}>
      {label && (
        <label htmlFor={id} className="block text-gray-600">
          {label}
        </label>
      )}
      <Tag
        className="input box-border border-0 outline outline-2 outline-gray-200 w-full rounded-sm p-2"
        type={type ?? 'text'}
        id={id}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required={required}
        placeholder={placeholder}
        rows={rows}
        autoFocus={autofocus}
      />
    </div>
  );
};

export default Input;