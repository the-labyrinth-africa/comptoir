'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAppStore } from '@/store/useAppStore';
import { ROLE_LABELS } from '@/lib/rbac';

export const WorkstationHeader: React.FC = () => {
  const { currentUser, logout } = useAppStore();
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'UTC',
        }) + ' GMT'
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-10 bg-[#1e333c] text-[#dff4ff] flex items-center justify-between px-3 border-b border-[#485860] select-none shrink-0 z-30">
      <div className="flex items-center gap-3">
        {/* Window controls styling */}
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block border border-black/20"></span>
          <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block border border-black/20"></span>
          <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block border border-black/20"></span>
        </div>

        <div className="h-4 w-px bg-[#485860] mx-1"></div>

        {/* Company Logo & Name */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-white overflow-hidden relative border border-white/20 shrink-0">
            <Image
              src="/images/etam.jpg"
              alt="ETAM Logo"
              width={24}
              height={24}
              className="object-cover"
              priority
            />
          </div>
          <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
            ETAM S.A.R.L
            <span className="text-xs font-normal text-[#c7dde9] hidden md:inline">
              — Électricité & Matériel Industriel
            </span>
          </span>
        </div>

        {currentUser && (
          <span className="bg-[#485860]/80 px-2 py-0.5 rounded text-[10px] font-semibold text-[#cfe6f2] uppercase tracking-wider font-mono">
            {currentUser.depotAssignment.split('(')[0].trim()}
          </span>
        )}
      </div>

      {/* Center/Right Status Indicators */}
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-[#a3f69c]">
          <span className="w-2 h-2 rounded-full bg-[#88d982] animate-pulse"></span>
          <span className="font-semibold text-[11px] tracking-wide hidden lg:inline">
            EN LIGNE — MONGODB CENTRALISÉ
          </span>
        </div>

        {/* Live Clock with mounted check for zero hydration mismatch */}
        <div className="flex items-center gap-1.5 bg-[#1e333c]/80 px-2.5 py-1 rounded border border-[#485860] font-num text-[11px] text-white">
          <span className="text-[#d4e5ef] font-mono">
            {time || '12:00:00 GMT'}
          </span>
        </div>

        {currentUser && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-2 py-1 rounded text-left">
              <div className="w-5 h-5 rounded-full bg-[#fc6018] flex items-center justify-center text-[10px] font-bold text-white uppercase">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <span className="font-medium text-white text-xs block leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-[#a3f69c] font-mono font-bold block leading-tight">
                  {ROLE_LABELS[currentUser.role]}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              className="h-7 px-2.5 bg-[#ba1a1a]/80 hover:bg-[#ba1a1a] text-white rounded text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
              title="Quitter la session et revenir au portail de connexion"
            >
              <span>✕</span>
              <span className="hidden md:inline">Déconnexion</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
