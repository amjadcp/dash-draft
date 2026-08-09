import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v6';
import './styles/global.css';
import { RootRoute } from './routes/root';

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <NuqsAdapter>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootRoute />} />
            <Route path="/:userId" element={<RootRoute />} />
          </Routes>
        </BrowserRouter>
      </NuqsAdapter>
    </React.StrictMode>
  );
}
