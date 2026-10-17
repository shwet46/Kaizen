"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const navLinks = [
  { label: "Command Center", href: "#interactive-preview" },
  { label: "Architecture & Stack", href: "#tech-stack" },
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Dashboard", href: "/dashboard" },
];



export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`} id="navbar">
        <div className="navbar-inner">
          <a href="#hero" className="navbar-logo">
            <img className="navbar-logo-icon" src="/icon.svg" alt="" />
            Kaizen
          </a>

          <div className="navbar-links">
            {navLinks.map((link) => (
              link.href.startsWith('/') ? (
                <Link
                  key={link.href}
                  to={link.href}
                  className="navbar-link"
                >
                  {link.label}
                </Link>
              ) : (
                <a key={link.href} href={link.href} className="navbar-link">
                  {link.label}
                </a>
              )
            ))}
          </div>

          <div className="navbar-cta">
            <Link
              to="/pitch"
              className="btn btn-sm"
              style={{
                background: "#1A73E8",
                borderColor: "#1A73E8",
                color: "#ffffff",
                fontWeight: 600,
                marginRight: "8px",
                boxShadow: "0 2px 8px rgba(26, 115, 232, 0.28)",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              Pitch Deck
            </Link>
            <Link to="/dashboard" className="btn btn-primary btn-sm">
              Get Started
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              id="mobile-menu-toggle"
            >
              <span style={mobileOpen ? { transform: 'rotate(45deg) translate(3px, 3px)' } : {}} />
              <span style={mobileOpen ? { opacity: 0 } : {}} />
              <span style={mobileOpen ? { transform: 'rotate(-45deg) translate(3px, -3px)' } : {}} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              top: 60,
              left: 0,
              right: 0,
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)',
              padding: '24px',
              zIndex: 999,
              borderBottom: '1px solid rgba(26, 26, 26, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {navLinks.map((link) => (
              link.href.startsWith('/') ? (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: 500,
                    fontFamily: "'Instrument Serif', serif",
                    padding: '8px 0',
                    borderBottom: '1px solid rgba(26, 26, 26, 0.06)',
                  }}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: 500,
                    fontFamily: "'Instrument Serif', serif",
                    padding: '8px 0',
                    borderBottom: '1px solid rgba(26, 26, 26, 0.06)',
                  }}
                >
                  {link.label}
                </a>
              )
            ))}
            <Link
              to="/pitch"
              onClick={() => setMobileOpen(false)}
              className="btn"
              style={{
                width: '100%',
                textAlign: 'center',
                justifyContent: 'center',
                background: '#1A73E8',
                color: '#ffffff',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(26, 115, 232, 0.28)',
              }}
            >
              Pitch Deck
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="btn btn-primary"
              style={{ width: '100%', textAlign: 'center', justifyContent: 'center' }}
            >
              Get Started
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
