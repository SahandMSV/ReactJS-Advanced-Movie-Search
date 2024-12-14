/* eslint-disable no-unused-vars */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.jsx';
import './styles/index.css';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
    // <StrictMode>
    <QueryClientProvider client={queryClient}>
        <App />
    </QueryClientProvider>
    // </StrictMode>,
);
