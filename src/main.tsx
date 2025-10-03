import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import './styles/index.css';
import { router } from './routes';
import { UIProvider } from './providers/UIProvider';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <UIProvider>
      <RouterProvider router={router} />
    </UIProvider>
  </React.StrictMode>
);
