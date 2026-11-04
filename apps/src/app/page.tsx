'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { LoginPage } from '@/components/auth/LoginPage';
import { WorkstationHeader } from '@/components/layout/WorkstationHeader';
import { WorkstationNav } from '@/components/layout/WorkstationNav';
import { WorkstationFooter } from '@/components/layout/WorkstationFooter';

import { CaisseView } from '@/components/views/CaisseView';
import { CommercialView } from '@/components/views/CommercialView';
import { StockInventoryView } from '@/components/views/StockInventoryView';
import { DgDashboardView } from '@/components/views/DgDashboardView';
import { AdminUsersView } from '@/components/views/AdminUsersView';
import { AccountingJournalView } from '@/components/views/AccountingJournalView';
import { SupplierReceptionView } from '@/components/views/SupplierReceptionView';
import { StockDetailHistoryView } from '@/components/views/StockDetailHistoryView';
import { canAccessView, ROLE_DEFAULT_VIEW } from '@/lib/rbac';

export default function WorkstationPage() {
  const { isAuthenticated, currentUser, activeView } = useAppStore();

  // If not authenticated, render the dedicated Login Portal
  if (!isAuthenticated || !currentUser) {
    return <LoginPage />;
  }

  const safeView = canAccessView(currentUser.role, activeView)
    ? activeView
    : ROLE_DEFAULT_VIEW[currentUser.role];

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#f3faff]">
      {/* WINDOW TITLE BAR */}
      <WorkstationHeader />

      {/* TOP NAVIGATION & SHORTCUTS (strictly filtered by role) */}
      <WorkstationNav />

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex overflow-hidden">
        {safeView === 'CAISSE' && <CaisseView />}
        {safeView === 'COMMERCIAL' && <CommercialView />}
        {safeView === 'STOCK_INVENTORY' && <StockInventoryView />}
        {safeView === 'DG_DASHBOARD' && <DgDashboardView />}
        {safeView === 'ADMIN_USERS' && <AdminUsersView />}
        {safeView === 'ACCOUNTING_JOURNAL' && <AccountingJournalView />}
        {safeView === 'SUPPLIER_RECEPTION' && <SupplierReceptionView />}
        {safeView === 'STOCK_MOVEMENT_HISTORY' && <StockDetailHistoryView />}
      </main>

      {/* BOTTOM STATUS BAR */}
      <WorkstationFooter />
    </div>
  );
}
