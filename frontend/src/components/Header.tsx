// FILE: src/components/Header.tsx
// PURPOSE: Adds a "History" link to the header for logged-in users.

import React from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAppStore } from '../state/store';
import { Button } from "@/components/ui/button";

const Header: React.FC = () => {
  const { token, logout } = useAppStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <header className="w-full py-6 px-4 border-b border-border/20 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <NavLink to="/" className="text-center no-underline">
          <h1 className="text-3xl md:text-4xl font-bold text-gradient flex items-center justify-center gap-3">
            <span className="text-4xl md:text-5xl">🚀</span>
            MarketForge AI
          </h1>
        </NavLink>
        
        {token && (
            <div className="flex items-center gap-4">
                <NavLink to="/history">
                    <Button variant="ghost">History</Button>
                </NavLink>
                <Button onClick={handleLogout} variant="outline">Logout</Button>
            </div>
        )}
      </div>
    </header>
  );
};

export default Header;
