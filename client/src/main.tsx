import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import SignInPage from './pages/SignInPage/SignInPage.tsx';
import GoSpreadsheetPage from './pages/GoSpreadsheetPage/GoSpreadsheetPage.tsx';
import {
  RouterProvider,
  createBrowserRouter,
} from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/signin',
    element: <SignInPage />,
  },
  {
    path : '/',
    element: <GoSpreadsheetPage />,
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
