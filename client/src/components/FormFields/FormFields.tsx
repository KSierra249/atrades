import type { HTMLInputTypeAttribute } from 'react';
import Input from '../Input/Input';

export type FormFieldConfig<FieldName extends string> = {
  name: FieldName;
  label: string;
  placeholder?: string;
  type?: HTMLInputTypeAttribute;
  required?: boolean;
  autofocus?: boolean;
  textarea?: boolean;
  rows?: number;
};

type Props<FieldName extends string> = {
  fields: readonly FormFieldConfig<FieldName>[];
  values: Record<FieldName, string>;
  onChange: (name: FieldName, value: string) => void;
  className?: string;
};

const FormFields = <FieldName extends string>({
  fields,
  values,
  onChange,
  className,
}: Props<FieldName>) => (
  <div className={className}>
    {fields.map(field => (
      <Input
        key={field.name}
        id={field.name}
        value={values[field.name]}
        setValue={value => onChange(field.name, value)}
        label={field.label}
        placeholder={field.placeholder}
        type={field.type}
        required={field.required}
        autofocus={field.autofocus}
        textarea={field.textarea}
        rows={field.rows}
      />
    ))}
  </div>
);

export default FormFields;
