import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import Header from './Header';
import Landing from './Landing';
import Shop from './Shop';
import Checkout from './Checkout';
import Payment from './Payment';
import ProductPage from './components/ProductPage';
import Dashboard from './components/dashboard/Dashboard';

export default function App() {
  return (
    <HelmetProvider>
      <Helmet>
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://js.paystack.co https://api.paystack.co; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://ipapi.co https://api.exchangerate-api.com https://js.paystack.co https://api.paystack.co;" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
      </Helmet>
      <div className="app-root">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </HelmetProvider>
  );
}
