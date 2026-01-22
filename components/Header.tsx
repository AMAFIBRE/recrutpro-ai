import React from 'react';
import { Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="glass-panel sticky top-0 z-50 border-b border-slate-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18 py-4">
          <div className="flex items-center gap-3">
            {/* Logo étoile multicolore stylisée */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-10 h-10">
                <polygon points="50,5 61,40 98,40 68,62 79,97 50,75 21,97 32,62 2,40 39,40" 
                  fill="url(#starGradient)" />
                <defs>
                  <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00a651" />
                    <stop offset="25%" stopColor="#0066b3" />
                    <stop offset="50%" stopColor="#9e1f63" />
                    <stop offset="75%" stopColor="#ed1c24" />
                    <stop offset="100%" stopColor="#fbb03b" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight leading-none">
                <span className="text-slate-700">ADVANCE</span>
                <span className="text-slate-400 ml-1">EMPLOI</span>
                <span className="text-blue-600 ml-1">06</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">by <span className="text-blue-600 font-semibold">RecrutPro IA</span></p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="hidden md:flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-100/50 shadow-sm">
               <Sparkles className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
               Générateur IA
             </div>
          </div>
        </div>
      </div>
    </header>
  );
};
