import React from "react";
import Header from "../../components/Header/Header";
import Card from "../../components/Card/Card";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import Status from "../../components/Status/Status";
import type {
  CreateGoSpreadsheetRequest,
  CreateGoSpreadsheetResponse,
  GoogleAuthStatusResponse,
} from "../../types/api";
import {
  INITIAL_GO_FORM_VALUES,
  type GoFormField,
  type GoFormValues,
} from "../../types/go-spreadsheet-form";

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';
const GoSpreadsheetPage: React.FC = () => {
  const [formValues, setFormValues] = React.useState<GoFormValues>(INITIAL_GO_FORM_VALUES);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = React.useState(false);
  const [googleEmail, setGoogleEmail] = React.useState('');
  const [isCheckingGoogle, setIsCheckingGoogle] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [spreadsheetUrl, setSpreadsheetUrl] = React.useState('');

  const updateFormValue = (name: GoFormField, value: string) => {
    setFormValues(currentValues => ({ ...currentValues, [name]: value }));
  };

  React.useEffect(() => {
    const checkGoogleConnection = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/google/status`, {
          credentials: 'include',
        });
        const status = await response.json() as GoogleAuthStatusResponse;
        setIsGoogleConnected(status.connected);
        setGoogleEmail(status.connected ? status.email : '');
      } catch {
        setErrorMessage('Unable to check the Google connection. Is the server running?');
      } finally {
        setIsCheckingGoogle(false);
      }
    };
    void checkGoogleConnection();
  }, []);

  const connectGoogle = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  const disconnectGoogle = async () => {
    await fetch(`${API_URL}/api/auth/google/disconnect`, {
      method: 'POST',
      credentials: 'include',
    });
    setIsGoogleConnected(false);
    setGoogleEmail('');
    setSpreadsheetUrl('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setSpreadsheetUrl('');

    const pricePerCard = Number(formValues.price);
    if (!Number.isFinite(pricePerCard) || pricePerCard < 0) {
      setErrorMessage('Enter a valid price per card.');
      return;
    }
    if (!isGoogleConnected) {
      setErrorMessage('Connect your Google account before creating a spreadsheet.');
      return;
    }

    setIsSubmitting(true);
    const payload: CreateGoSpreadsheetRequest = {
      url: formValues.instaPostLink,
      spreadsheetUrl: formValues.spreadsheetUrl,
      storeName: formValues.storeName,
      setName: formValues.setName,
      setFrom: formValues.setFrom,
      deadline: formValues.deadline,
      pricePerCard,
    };

    try {
      const response = await fetch(`${API_URL}/api/create-go-spreadsheet`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json() as CreateGoSpreadsheetResponse;
      if (result.kind === 'ok') {
        setSpreadsheetUrl(result.spreadsheetUrl);
      } else {
        setErrorMessage(result.message);
        if (response.status === 401) {
          setIsGoogleConnected(false);
          setGoogleEmail('');
        }
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to create the spreadsheet.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
        <form className="w-full max-w-3xl" onSubmit={handleSubmit}>
          <Card className="w-full max-w-4xl shadow-xl border-0 rounded-2xl p-10">
            <h2 className="text-3xl font-bold mb-2 text-center tracking-tight text-gray-900">GO Spreadsheet</h2>
            <p className="mb-8 text-center text-gray-500 text-base">Create a GO Spreadsheet!</p>

            <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900">Google Sheets</p>
                  <p className="text-sm text-gray-500">
                    {isCheckingGoogle
                      ? 'Checking connection...'
                      : isGoogleConnected
                        ? `Connected as ${googleEmail}`
                        : 'Connect the account where the spreadsheet should be created.'}
                  </p>
                </div>
                {isGoogleConnected ? (
                  <Button type="button" width="auto" variant="text" onClick={() => void disconnectGoogle()}>
                    Disconnect
                  </Button>
                ) : (
                  <Button type="button" width="auto" disabled={isCheckingGoogle} onClick={connectGoogle}>
                    Connect Google
                  </Button>
                )}
              </div>
            </div>

            <div className="mb-6 space-y-4">
              <Input
                id="spreadsheetUrl"
                label="Google Spreadsheet Link"
                placeholder="https://docs.google.com/spreadsheets/d/…/edit"
                type="url"
                value={formValues.spreadsheetUrl}
                setValue={value => updateFormValue('spreadsheetUrl', value)}
                required
                autofocus
              />
              <Input
                id="storeName"
                label="Store Name"
                placeholder="Aladin"
                value={formValues.storeName}
                setValue={value => updateFormValue('storeName', value)}
                required
              />
              <Input
                id="setName"
                label="Set Name"
                placeholder="Aladin POB GO"
                value={formValues.setName}
                setValue={value => updateFormValue('setName', value)}
                required
              />
              <Input
                id="setFrom"
                label="Set From"
                placeholder="leebie"
                value={formValues.setFrom}
                setValue={value => updateFormValue('setFrom', value)}
                required
              />
              <Input
                id="deadline"
                label="Deadline"
                placeholder="november 8th @ 23:59 CDT"
                value={formValues.deadline}
                setValue={value => updateFormValue('deadline', value)}
                required
              />
              <Input
                id="price"
                label="Price per PC"
                placeholder="4.82"
                type="number"
                value={formValues.price}
                setValue={value => updateFormValue('price', value)}
                required
              />
              <Input
                id="instaPostLink"
                label="Instagram Post Link"
                placeholder="https://www.instagram.com/p/XXXXXXXXX/"
                type="url"
                value={formValues.instaPostLink}
                setValue={value => updateFormValue('instaPostLink', value)}
                required
              />

              {errorMessage && <Status type="error" className="mt-4">{errorMessage}</Status>}
              {spreadsheetUrl && (
                <Status type="success" className="mt-4">
                  Worksheet created.{' '}
                  <a className="font-semibold underline" href={spreadsheetUrl} target="_blank" rel="noreferrer">
                    Open new worksheet
                  </a>
                </Status>
              )}

              <Button
                type="submit"
                disabled={isSubmitting || !isGoogleConnected}
                className="w-full py-3 mt-2 rounded-lg bg-red-700 hover:bg-red-600 transition-colors text-lg font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
              >
                {isSubmitting ? 'Creating GO Worksheet...' : 'Create GO Worksheet'}
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </>
  );
};

export default GoSpreadsheetPage;
