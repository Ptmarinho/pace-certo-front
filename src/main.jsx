import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import App from './App';
import tema from './theme';
import { FeedbackProvider } from './context/FeedbackContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={tema}>
      <CssBaseline />
      <FeedbackProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </FeedbackProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
