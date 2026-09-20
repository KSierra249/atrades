import FormFields, { type FormFieldConfig } from '../FormFields/FormFields';
import type { SignInField, SignInValues } from './SignInFormFields.types';

const fields: readonly FormFieldConfig<SignInField>[] = [
  {
    name: 'email',
    label: 'Email',
    placeholder: 'Email',
    type: 'email',
    required: true,
    autofocus: true,
  },
  {
    name: 'password',
    label: 'Password',
    placeholder: 'Password',
    type: 'password',
    required: true,
  },
];

type Props = {
  values: SignInValues;
  onChange: (name: SignInField, value: string) => void;
};

const SignInFormFields = ({ values, onChange }: Props) => (
  <FormFields
    fields={fields}
    values={values}
    onChange={onChange}
    className="space-y-5"
  />
);

export default SignInFormFields;
