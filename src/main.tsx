import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { PaymentSuccessView } from './components/PaymentSuccessView';
import './index.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  const isPaymentSuccess = window.location.pathname.startsWith('/payment/success');

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      {isPaymentSuccess ? <PaymentSuccessView /> : <App />}
    </React.StrictMode>
  );
}
