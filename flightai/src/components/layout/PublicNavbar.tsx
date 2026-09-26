"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Plane, Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import UserMenu from '@/components/UserMenu';

export default function PublicNavbar() {
  const { user, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="h-16 flex items-center justify-between px-6 lg:px-12 z-50 border-b border-aervyn-border-dark-subtle bg-aervyn-bg-dark/80 backdrop-blur-md sticky top-0 w-full shrink-0">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Plane className="w-6 h-6 text-aervyn-text-dark-primary" />
          <span className="font-bold text-lg tracking-wide text-aervyn-text-dark-primary">AERVYN</span>
        </Link>
      </div>
      
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-aervyn-text-dark-secondary">
        <Link href="/features" className="hover:text-aervyn-text-dark-primary transition-colors">Features</Link>
        <Link href="/data-sources" className="hover:text-aervyn-text-dark-primary transition-colors">Data Sources</Link>
        <Link href="/pricing" className="hover:text-aervyn-text-dark-primary transition-colors">Pricing</Link>
        <Link href="/about" className="hover:text-aervyn-text-dark-primary transition-colors">About</Link>
      </nav>

      {/* Desktop Actions */}
      <div className="hidden md:flex items-center gap-4">
        {loading ? (
          <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse"></div>
        ) : user ? (
          <>
            <Link href="/dashboard" className="hidden sm:flex items-center justify-center bg-aervyn-primary hover:bg-aervyn-primary-hover text-white transition-colors text-sm font-medium px-4 py-2 rounded-md">
              Open Dashboard
            </Link>
            <UserMenu />
          </>
        ) : (
          <>
            <Link href="/login" className="text-sm font-medium text-aervyn-text-dark-secondary hover:text-aervyn-text-dark-primary px-3 py-2 transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="flex items-center justify-center bg-aervyn-primary hover:bg-aervyn-primary-hover text-white transition-colors text-sm font-medium px-4 py-2 rounded-md">
              Get Started
            </Link>
          </>
        )}
      </div>

      {/* Mobile Menu Toggle */}
      <div className="md:hidden flex items-center gap-4">
        {user && !loading && <UserMenu />}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 -mr-2 text-aervyn-text-dark-secondary hover:text-aervyn-text-dark-primary transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-aervyn-bg-dark border-b border-aervyn-border-dark shadow-2xl md:hidden p-4 flex flex-col gap-4 z-40">
          <nav className="flex flex-col gap-2">
            <Link onClick={() => setMobileMenuOpen(false)} href="/features" className="px-4 py-3 text-sm font-medium text-aervyn-text-dark-secondary hover:text-aervyn-text-dark-primary hover:bg-aervyn-surface-dark rounded-lg transition-colors">Features</Link>
            <Link onClick={() => setMobileMenuOpen(false)} href="/data-sources" className="px-4 py-3 text-sm font-medium text-aervyn-text-dark-secondary hover:text-aervyn-text-dark-primary hover:bg-aervyn-surface-dark rounded-lg transition-colors">Data Sources</Link>
            <Link onClick={() => setMobileMenuOpen(false)} href="/pricing" className="px-4 py-3 text-sm font-medium text-aervyn-text-dark-secondary hover:text-aervyn-text-dark-primary hover:bg-aervyn-surface-dark rounded-lg transition-colors">Pricing</Link>
            <Link onClick={() => setMobileMenuOpen(false)} href="/about" className="px-4 py-3 text-sm font-medium text-aervyn-text-dark-secondary hover:text-aervyn-text-dark-primary hover:bg-aervyn-surface-dark rounded-lg transition-colors">About</Link>
          </nav>
          
          <div className="border-t border-aervyn-border-dark pt-4 mt-2 flex flex-col gap-3">
            {loading ? (
              <div className="h-10 rounded-md bg-white/5 animate-pulse w-full"></div>
            ) : user ? (
              <Link onClick={() => setMobileMenuOpen(false)} href="/dashboard" className="w-full flex items-center justify-center bg-aervyn-primary hover:bg-aervyn-primary-hover text-white transition-colors text-sm font-medium px-4 py-3 rounded-md">
                Open Dashboard
              </Link>
            ) : (
              <>
                <Link onClick={() => setMobileMenuOpen(false)} href="/login" className="w-full flex items-center justify-center border border-aervyn-border-dark hover:bg-aervyn-surface-dark text-aervyn-text-dark-primary transition-colors text-sm font-medium px-4 py-3 rounded-md">
                  Sign In
                </Link>
                <Link onClick={() => setMobileMenuOpen(false)} href="/register" className="w-full flex items-center justify-center bg-aervyn-primary hover:bg-aervyn-primary-hover text-white transition-colors text-sm font-medium px-4 py-3 rounded-md">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
