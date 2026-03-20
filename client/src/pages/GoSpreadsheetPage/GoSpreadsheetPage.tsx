import React from "react";
import Header from "../../components/Header/Header";
import Card from "../../components/Card/Card";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";



const GoSpreadsheetPage: React.FC = () => {
  const [storeName, setStoreName] = React.useState<string>('');
  const [setName, setSetName] = React.useState<string>('');
  const [setFrom, setSetFrom] = React.useState<string>('');
  const [deadline, setDeadline] = React.useState<string>('');
  const [price, setPrice] = React.useState<string>('');
  const [instaPostLink, setInstaPostLink] = React.useState<string>('');
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
        <form className="w-full max-w-3xl">
          <Card className="w-full max-w-4xl shadow-xl border-0 rounded-2xl p-10">
            <h2 className="text-3xl font-bold mb-2 text-center tracking-tight text-gray-900">GO Spreadsheet</h2>
            <p className="mb-8 text-center text-gray-500 text-base">Create a GO Spreadsheet!</p>
            <div className="mb-6">
              <Input
                className=""
                value={storeName}
                setValue={setStoreName}
                id="storeName"
                label="Store Name"
                placeholder="Aladin"
                required
                autofocus={true}
                />
              <Input
                className=""
                value={setName}
                setValue={setSetName}
                id="setName"
                label="Set Name"
                placeholder="Aladin POB GO"
                required
                autofocus={false}
                />
              <Input
                className=""
                value={setFrom}
                setValue={setSetFrom}
                id="setFrom"
                label="Set From"
                placeholder="leebie"
                required
                autofocus={false}
                />
              <Input
                className=""
                value={deadline}
                setValue={setDeadline}
                id="deadline"
                label="Deadline"
                placeholder="november 8th @ 23:59 CDT"
                required
                autofocus={false}
                />
              <Input
                className=""
                value={price}
                setValue={setPrice}
                id="price"
                label="Price per PC"
                placeholder="4.82"
                required
                autofocus={false}
                />
              <Input
                className=""
                value={instaPostLink}
                setValue={setInstaPostLink}
                id="instaPostLink"
                label="Instagram Post Link"
                placeholder="https://www.instagram.com/p/XXXXXXXXX/"
                required
                autofocus={false}
                />
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 mt-2 rounded-lg bg-red-700 hover:bg-red-600 transition-colors text-lg font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
              >
                {isSubmitting ? 'Creating GO Spreadsheet...' : 'Create GO Spreadsheet'}
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </>
  );

}

export default GoSpreadsheetPage;
