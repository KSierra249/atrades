export type SignInField = 'email' | 'password';
export type SignInValues = Record<SignInField, string>;

export const INITIAL_SIGN_IN_VALUES: SignInValues = {
  email: '',
  password: '',
};
