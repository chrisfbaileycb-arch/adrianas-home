import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { PaymentSuccessView } from './components/PaymentSuccessView';
import './index.css';

const path = window.location.pathname;
const root = createRoot(document.getElementById('root')!);

if (path.startsWith('/payment/success')) {
  // Isolate the Stripe return flow from the main app so its data-sync
  // effects don't compete with the payment status polling.
  root.render(<PaymentSuccessView />);
} else {
  if (path.startsWith('/payment/cancel')) {
    window.history.replaceState({}, '', '/');
  }
  root.render(<App />);
}
