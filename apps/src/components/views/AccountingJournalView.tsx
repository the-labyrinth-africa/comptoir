'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';

export const AccountingJournalView: React.FC = () => {
  const { invoices } = useAppStore();
  const [filterPeriod, setFilterPeriod] = useState('TODAY');
  const [methodFilter, setMethodFilter] = useState('ALL');

  const filteredInvoices = invoices.filter((inv) => {
    if (methodFilter !== 'ALL' && inv.paymentMethod !== methodFilter) {
      return false;
    }
    return true;
  });

  const totalTTC = filteredInvoices.reduce((sum, inv) => sum + inv.totalTTC, 0);
  const totalHT = filteredInvoices.reduce((sum, inv) => sum + inv.totalHT, 0);
  const totalTVA = filteredInvoices.reduce((sum, inv) => sum + inv.totalTVA, 0);

  // Breakdown by payment method
  const byMethod: Record<string, number> = {};
  filteredInvoices.forEach((inv) => {
    byMethod[inv.paymentMethod] = (byMethod[inv.paymentMethod] || 0) + inv.totalTTC;
  });

  const handleExportCSV = () => {
    const headers = [
      'N° Facture',
      'Date',
      'Réf Proforma',
      'Client',
      'Caissier',
      'Mode Règlement',
      'Total HT',
      'TVA 18%',
      'Total TTC',
    ];
    const rows = filteredInvoices.map((inv) => [
      inv.reference,
      inv.createdAt,
      inv.proformaRef || '',
      `"${inv.customerName}"`,
      inv.cashierName,
      inv.paymentMethod,
      inv.totalHT,
      inv.totalTVA,
      inv.totalTTC,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'journal_ventes_etam.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f3faff] overflow-hidden select-none">
      {/* HEADER & CONTROLS */}
      <div className="bg-white border-b border-[#bfcaba] p-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#707a6c] tracking-wider">
            Comptabilité & Rapprochement Financier
          </span>
          <h2 className="text-base font-bold text-[#071e27] flex items-center gap-2">
            <span>📊 Journal des Factures de Vente & Encaissements</span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Period buttons */}
          <div className="flex items-center border border-[#bfcaba] rounded overflow-hidden text-xs font-semibold">
            <button
              onClick={() => setFilterPeriod('TODAY')}
              className={`px-3 py-1.5 ${
                filterPeriod === 'TODAY'
                  ? 'bg-[#0d631b] text-white'
                  : 'bg-white text-[#40493d] hover:bg-[#e6f6ff]'
              }`}
            >
              Aujourd&apos;hui
            </button>
            <button
              onClick={() => setFilterPeriod('WEEK')}
              className={`px-3 py-1.5 border-l border-[#bfcaba] ${
                filterPeriod === 'WEEK'
                  ? 'bg-[#0d631b] text-white'
                  : 'bg-white text-[#40493d] hover:bg-[#e6f6ff]'
              }`}
            >
              Cette Semaine
            </button>
            <button
              onClick={() => setFilterPeriod('MONTH')}
              className={`px-3 py-1.5 border-l border-[#bfcaba] ${
                filterPeriod === 'MONTH'
                  ? 'bg-[#0d631b] text-white'
                  : 'bg-white text-[#40493d] hover:bg-[#e6f6ff]'
              }`}
            >
              Ce Mois
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="h-8 px-3 bg-white hover:bg-[#e6f6ff] text-[#071e27] border border-[#bfcaba] rounded text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <span>📥</span>
            <span>Exporter CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="h-8 px-3 bg-[#0d631b] hover:bg-[#2e7d32] text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <span>🖨</span>
            <span>Clôture Journalière (F9)</span>
          </button>
        </div>
      </div>

      {/* KPI TILES SUMMARY */}
      <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#e6f6ff] border-b border-[#bfcaba]">
        <div className="bg-white border border-[#bfcaba] p-3 rounded">
          <span className="text-[10px] uppercase font-bold text-[#707a6c] block">
            Chiffre d&apos;Affaires TTC
          </span>
          <span className="text-xl font-bold font-mono text-[#0d631b]">
            {totalTTC.toLocaleString('fr-FR')} FCFA
          </span>
          <span className="text-[10px] text-[#707a6c] block mt-0.5">
            {filteredInvoices.length} factures encaissées
          </span>
        </div>

        <div className="bg-white border border-[#bfcaba] p-3 rounded">
          <span className="text-[10px] uppercase font-bold text-[#707a6c] block">
            Base Hors Taxes (HT)
          </span>
          <span className="text-xl font-bold font-mono text-[#071e27]">
            {totalHT.toLocaleString('fr-FR')} FCFA
          </span>
          <span className="text-[10px] text-[#707a6c] block mt-0.5">
            Chiffre d&apos;affaires net
          </span>
        </div>

        <div className="bg-white border border-[#bfcaba] p-3 rounded">
          <span className="text-[10px] uppercase font-bold text-[#707a6c] block">
            TVA Collectée (18%)
          </span>
          <span className="text-xl font-bold font-mono text-[#a83900]">
            +{totalTVA.toLocaleString('fr-FR')} FCFA
          </span>
          <span className="text-[10px] text-[#707a6c] block mt-0.5">
            Déclaration DGI
          </span>
        </div>

        <div className="bg-white border border-[#bfcaba] p-3 rounded">
          <span className="text-[10px] uppercase font-bold text-[#707a6c] block">
            Ventilation Règlements
          </span>
          <div className="text-[11px] font-mono space-y-0.5 mt-1 text-[#071e27]">
            {Object.entries(byMethod).map(([m, amt]) => (
              <div key={m} className="flex justify-between">
                <span>{m}:</span>
                <span className="font-bold">{amt.toLocaleString('fr-FR')} F</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* INVOICES TABLE */}
      <div className="flex-1 bg-white overflow-auto p-4">
        <div className="border border-[#bfcaba] rounded overflow-hidden shadow-xs">
          <div className="p-3 bg-[#cfe6f2] border-b border-[#bfcaba] flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#071e27]">
              Livre Journal des Écritures de Vente ({filteredInvoices.length} pièces)
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#707a6c]">Filtrer règlement :</span>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="h-7 text-xs bg-white border border-[#bfcaba] rounded px-1.5 font-semibold"
              >
                <option value="ALL">Tous les modes</option>
                <option value="CASH">Espèces</option>
                <option value="WAVE">Wave</option>
                <option value="ORANGE_MONEY">Orange Money</option>
                <option value="CHEQUE">Chèque</option>
                <option value="BANK_TRANSFER">Virement</option>
              </select>
            </div>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-[#e6f6ff] text-[#071e27] font-bold border-b border-[#bfcaba]">
              <tr>
                <th className="p-2.5">N° Facture</th>
                <th className="p-2.5">Date & Heure</th>
                <th className="p-2.5">Réf. Proforma</th>
                <th className="p-2.5">Client / Raison Sociale</th>
                <th className="p-2.5">Caissier</th>
                <th className="p-2.5 text-center">Règlement</th>
                <th className="p-2.5 text-right">Montant HT</th>
                <th className="p-2.5 text-right">TVA (18%)</th>
                <th className="p-2.5 text-right">Total Net TTC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6f6ff]">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-[#707a6c]">
                    Aucune écriture comptable enregistrée pour cette sélection.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#f3faff]">
                    <td className="p-2.5 font-mono font-bold text-[#071e27]">
                      {inv.reference}
                    </td>
                    <td className="p-2.5 font-mono text-[#707a6c]">
                      {new Date(inv.createdAt).toLocaleString('fr-FR')}
                    </td>
                    <td className="p-2.5 font-mono text-[#0d631b]">
                      {inv.proformaRef || '-'}
                    </td>
                    <td className="p-2.5 font-medium text-[#071e27]">
                      {inv.customerName}
                    </td>
                    <td className="p-2.5 text-[#40493d]">{inv.cashierName}</td>
                    <td className="p-2.5 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#e6f6ff] text-[#0d631b] border border-[#bfcaba]">
                        {inv.paymentMethod}
                      </span>
                    </td>
                    <td className="p-2.5 text-right font-mono font-medium">
                      {inv.totalHT.toLocaleString('fr-FR')} F
                    </td>
                    <td className="p-2.5 text-right font-mono text-[#a83900]">
                      {inv.totalTVA.toLocaleString('fr-FR')} F
                    </td>
                    <td className="p-2.5 text-right font-mono font-bold text-[#0d631b]">
                      {inv.totalTTC.toLocaleString('fr-FR')} FCFA
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

