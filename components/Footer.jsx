import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-col footer-brand">
          <div className="brand-title">Volubiks</div>
          <div className="brand-sub">Ojaja Royal Volubiks Stores</div>
          <p className="footer-desc">Curated pieces — quietly exquisite. Shop local, ship global.</p>
          <div className="footer-social" aria-hidden="false">
            <a href="#" className="social-link" aria-label="Follow on Instagram" title="Instagram">
              <svg className="social-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.2"/><path d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6z" stroke="currentColor" strokeWidth="1.2"/><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor"/></svg>
            </a>
            <a href="#" className="social-link" aria-label="Follow on Facebook" title="Facebook">
              <svg className="social-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 8h2V5h-2c-1.1 0-2 .9-2 2v1H11v3h2v6h3v-6h2.2L19 11h-2v-1c0-.3.1-.9.9-.9z" fill="currentColor"/></svg>
            </a>
          </div>
        </div>

        <nav className="footer-col footer-links" aria-label="Footer navigation">
          <h4>Explore</h4>
          <ul>
            <li><Link to="/shop">Shop</Link></li>
            <li><Link to="/shop?category=jewelries">Jewelries</Link></li>
            <li><Link to="/shop?category=clothings">Clothings</Link></li>
            <li><Link to="/shop?category=drinks">Drinks</Link></li>
          </ul>
        </nav>

        <div className="footer-col footer-contact">
          <h4>Contact</h4>
          <address>
            <div>5, Trans Amusement Park Shopping Complex</div>
            <div>Bodija, Ibadan</div>
            <div>Phone: <a href="tel:+2349047393086">+234 904 739 3086</a></div>
            <div>Email: <a href="mailto:support@volubiks.com">support@volubiks.com</a></div>
          </address>
        </div>
      </div>

      <div className="footer-legal">
        <div className="container">© {new Date().getFullYear()} Volubiks — All rights reserved.</div>
      </div>
    </footer>
  );
}
