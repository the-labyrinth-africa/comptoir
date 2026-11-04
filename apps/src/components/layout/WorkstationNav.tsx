'use client';

import React, { useEffect } from 'react';
import { useAppStore, ActiveView, ROLE_AUTHORIZED_VIEWS } from '@/store/useAppStore';

export const WorkstationNav: React.FC = () => {
  const {
    activeView,
    setActiveView,
    currentUser,
    searchQuery,
    setSearchQuery,
    commercialCart,
    outputSlips,
  } = useAppStore();

  const pendingOutputSlipsCount = outputSlips.filter((s) => s.status === 'EN_ATTENTE').length;

  // Authorized views for the current user's role
  const authorizedViews = currentUser
    ? ROLE_AUTHORIZED_VIEWS[currentUser.role] || []
    : [];

  // Keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentUser) return;
      const allowed = ROLE_AUTHORIZED_VIEWS[currentUser.role] || [];

      if (e.key === 'F5' && allowed.includes('CAISSE')) {
        e.preventDefault();
        setActiveView('CAISSE');
      } else if (e.key === 'F3' && allowed.includes('COMMERCIAL')) {
        e.preventDefault();
        setActiveView('COMMERCIAL');
      } else if (e.key === 'F4' && allowed.includes('STOCK_INVENTORY')) {
        e.preventDefault();
        setActiveView('STOCK_INVENTORY');
      } else if (e.key === 'F6' && allowed.includes('ACCOUNTING_JOURNAL')) {
        e.preventDefault();
        setActiveView('ACCOUNTING_JOURNAL');
      } else if (e.key === 'F7' && allowed.includes('SUPPLIER_RECEPTION')) {
        e.preventDefault();
        setActiveView('SUPPLIER_RECEPTION');
      } else if (e.key === 'F8' && allowed.includes('STOCK_MOVEMENT_HISTORY')) {
        e.preventDefault();
        setActiveView('STOCK_MOVEMENT_HISTORY');
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input');
        if (searchInput) searchInput.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveView, currentUser]);

  const allNavItems: { view: ActiveView; label: string; shortcut: string; badge?: number }[] = [
    { view: 'CAISSE', label: 'Caisse POS', shortcut: 'F5' },
    { view: 'COMMERCIAL', label: 'Commercial Proforma', shortcut: 'F3', badge: commercialCart.length > 0 ? commercialCart.length : undefined },
    { view: 'STOCK_INVENTORY', label: 'Stock & Sorties', shortcut: 'F4', badge: pendingOutputSlipsCount > 0 ? pendingOutputSlipsCount : undefined },
    { view: 'SUPPLIER_RECEPTION', label: 'Réception Fournisseur', shortcut: 'F7' },
    { view: 'STOCK_MOVEMENT_HISTORY', label: 'Traçabilité & Mouvements', shortcut: 'F8' },
    { view: 'ACCOUNTING_JOURNAL', label: 'Comptabilité Ventes', shortcut: 'F6' },
    { view: 'DG_DASHBOARD', label: 'Supervision DG', shortcut: '' },
    { view: 'ADMIN_USERS', label: 'Administration', shortcut: '' },
  ];

  // Strictly filter according to role!
  const visibleNavItems = allNavItems.filter((item) => authorizedViews.includes(item.view));

  return (
    <nav className="h-10 w-full px-3 border-b border-[#bfcaba] bg-white flex items-center justify-between select-none shrink-0 z-20">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {/* Quick Search */}
        <div className="relative flex items-center shrink-0">
          <span className="absolute left-2.5 text-xs text-[#707a6c]">🔍</span>
          <input
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Recherche rapide... (Ctrl+K)"
            className="h-7 w-44 lg:w-52 pl-7 pr-2 py-0.5 bg-[#e6f6ff] border border-[#bfcaba] rounded text-xs text-[#071e27] placeholder:text-[#707a6c] focus:outline-none focus:ring-1 focus:ring-[#0d631b]"
          />
        </div>

        <div className="h-5 w-px bg-[#bfcaba] mx-1 shrink-0"></div>

        {/* Navigation Tabs (Filtered by Role) */}
        <div className="flex items-center gap-1 shrink-0">
          {visibleNavItems.map((item) => {
            const isActive = activeView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => setActiveView(item.view)}
                className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#0d631b] text-white shadow-xs'
                    : 'text-[#40493d] hover:bg-[#dbf1fe] hover:text-[#071e27]'
                }`}
              >
                <span>{item.label}</span>
                {item.shortcut && (
                  <span
                    className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#e6f6ff] text-[#707a6c] border border-[#bfcaba]'
                    }`}
                  >
                    {item.shortcut}
                  </span>
                )}
                {item.badge !== undefined && (
                  <span
                    className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                      isActive ? 'bg-[#fc6018] text-white' : 'bg-[#fc6018] text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Trailing Role-Specific Quick Action */}
      <div className="flex items-center gap-2 shrink-0 pl-2">
        {authorizedViews.includes('CAISSE') ? (
          <button
            onClick={() => setActiveView('CAISSE')}
            className="h-7 px-3 bg-[#0d631b] hover:bg-[#2e7d32] text-white rounded text-xs font-bold shadow-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <span>✓</span>
            <span>Encaisser (Entrée)</span>
          </button>
        ) : authorizedViews.includes('COMMERCIAL') ? (
          <button
            onClick={() => setActiveView('COMMERCIAL')}
            className="h-7 px-3 bg-[#fc6018] hover:bg-[#a83900] text-white rounded text-xs font-bold shadow-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <span>+</span>
            <span>Nouveau Devis (F3)</span>
          </button>
        ) : authorizedViews.includes('SUPPLIER_RECEPTION') ? (
          <button
            onClick={() => setActiveView('SUPPLIER_RECEPTION')}
            className="h-7 px-3 bg-[#0d631b] hover:bg-[#2e7d32] text-white rounded text-xs font-bold shadow-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <span>📥</span>
            <span>Réception Fournisseur (F7)</span>
          </button>
        ) : null}
      </div>
    </nav>
  );
};
