import React, { useState } from 'react';
import Card from '../../components/Card/Card';
import Status from '../../components/Status/Status';
import Button from '../../components/Button/Button';
import SignInFormFields from '../../components/SignInFormFields/SignInFormFields';
import {
  INITIAL_SIGN_IN_VALUES,
  type SignInField,
  type SignInValues,
} from '../../components/SignInFormFields/SignInFormFields.types';
import type { SignInRequest } from '../../types/api';

const signIn = async (payload: SignInRequest) => {
  try {
    const response = await fetch('http://localhost:5000/api/sign-in', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return await response.json();
  } catch (error) {
    return { kind: 'error', message: error instanceof Error ? error.message : 'Unknown error' };
  }
};

const SignInPage: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [formValues, setFormValues] = useState<SignInValues>(INITIAL_SIGN_IN_VALUES);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const updateFormValue = (name: SignInField, value: string) => {
    setFormValues(currentValues => ({ ...currentValues, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    const payload: SignInRequest = formValues;
    const response = await signIn(payload);

    if (response.kind === 'ok') {
      setSuccessMessage('Sign in successful!');
    } else {
      setErrorMessage(response.message);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
      <Card className="w-full max-w-md shadow-xl border-0 rounded-2xl p-0">
        <div className="p-10 flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-2 text-center tracking-tight text-gray-900">Sign In</h2>
          <p className="mb-8 text-center text-gray-500 text-base">Welcome back! Please enter your credentials to sign in.</p>
          <form onSubmit={handleSubmit} className="w-full space-y-5">
            <SignInFormFields
              values={formValues}
              onChange={updateFormValue}
            />
            {errorMessage && (
              <Status type="error" className="mt-2">
                {errorMessage}
              </Status>
            )}
            {successMessage && (
              <Status type="success" className="mt-2">
                {successMessage}
              </Status>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 mt-2 rounded-lg bg-red-700 hover:bg-red-600 transition-colors text-lg font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default SignInPage;
