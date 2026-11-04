'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { hasCapability } from '@/lib/rbac';

export const WorkstationFooter: React.FC = () => {
  const { invoices, currentUser, products } = useAppStore();
  const canSeeFinancials = hasCapability(currentUser?.role, 'VIEW_FINANCIALS');
  const canSeeStockAlerts =
    currentUser?.role === 'STOCK_MANAGER' ||
    currentUser?.role === 'ADMIN' ||
    currentUser?.role === 'DG_SUPERVISOR';

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalTTC, 0);
  const lowStockCount = products.filter(
    (p) => p.stockPhysical <= p.alertThreshold && p.stockPhysical > 0
  ).length;
  const outOfStockCount = products.filter((p) => p.stockPhysical === 0).length;

  return (
    <footer className="h-7 bg-[#263238] text-[#cfd8dc] px-3 flex items-center justify-between text-[11px] select-none shrink-0 border-t border-[#37474f] font-mono">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#88d982]"></span>
          <span className="text-white font-medium">DB: MONGODB (OPÉRATIONNEL)</span>
        </div>
        <span className="text-[#546e7a]">|</span>
        <div className="flex items-center gap-1 text-[#b0bec5]">
          <span>PRINTER: ESC/POS 80MM (PRÊT)</span>
        </div>
        <span className="text-[#546e7a]">|</span>
        <div className="flex items-center gap-1 text-[#b0bec5]">
          <span>POSTE: STATION-01</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {canSeeStockAlerts && lowStockCount > 0 && (
          <span className="text-[#ffb59a] font-semibold">
            ⚠ {lowStockCount} RUPTURE{lowStockCount > 1 ? 'S' : ''} IMMINENTE{lowStockCount > 1 ? 'S' : ''}
          </span>
        )}
        {canSeeStockAlerts && outOfStockCount > 0 && (
          <span className="text-[#ffdad6] bg-[#ba1a1a]/40 px-1.5 py-0.5 rounded text-[10px] font-bold">
            ✖ {outOfStockCount} RUPTURE TOTALE
          </span>
        )}
        {canSeeFinancials && (
          <>
            <span className="text-[#546e7a]">|</span>
            <div className="text-white">
              <span className="text-[#88d982] font-semibold">CA JOUR TTC : </span>
              <span className="font-bold text-white text-xs">
                {totalRevenue.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </>
        )}
        <span className="text-[#546e7a]">|</span>
        <span className="text-[#90a4ae]">{currentUser?.name || 'Session'}</span>
      </div>
    </footer>
  );
};

