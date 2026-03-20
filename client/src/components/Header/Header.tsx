import { FC } from 'react';
import logo from '../../assets/3840px-Lee_Know_Signature_SVG.svg.png';
import HeaderLink from '../HeaderLink/HeaderLink';

const Header: FC = () => {
  return (
    <header className="bg-white text-black p-8 flex items-center">
      <div className="flex items-center gap-6">
        <img src={logo} alt="A-Trades Logo" className="h-10 w-10 mr-2" />
        <h1 className="text-2xl font-bold">ATRADES</h1>
      </div>
      <div className="ml-auto ">
        <HeaderLink label="GO SPREADSHEET" to="/" />
      </div>
    </header>
  );
};

export default Header;