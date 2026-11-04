'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';

export const DgDashboardView: React.FC = () => {
  const { invoices, proformas, products, users } = useAppStore();
  const [period, setPeriod] = useState('TODAY');

  const totalCA = invoices.reduce((sum, inv) => sum + inv.totalTTC, 0);
  const totalFactures = invoices.length;
  const totalProformasCount = proformas.length;
  const convertedProformasCount = proformas.filter((p) => p.status === 'CONVERTED').length;
  const conversionRate =
    totalProformasCount > 0 ? Math.round((convertedProformasCount / totalProformasCount) * 100) : 0;
  const panierMoyen = totalFactures > 0 ? Math.round(totalCA / totalFactures) : 0;

  const totalStockValue = products.reduce(
    (sum, p) => sum + p.stockPhysical * p.costPriceCMUP,
    0
  );

  const lowStockAlerts = products.filter((p) => p.stockPhysical <= p.alertThreshold);

  // Group performance by sales rep
  const salesReps = users.filter((u) => u.role === 'SALES_REP' || u.role === 'SALES_MANAGER');
  const performanceByRep = salesReps.map((rep) => {
    const repProformas = proformas.filter((p) => p.salesRepId === rep.id || p.salesRepName === rep.name);
    const repConverted = repProformas.filter((p) => p.status === 'CONVERTED');
    const repInvoices = invoices.filter((i) =>
      repProformas.some((rp) => rp.id === i.proformaId || rp.reference === i.proformaRef)
    );
    const repCA = repInvoices.reduce((sum, i) => sum + i.totalTTC, 0);
    const convRate =
      repProformas.length > 0 ? Math.round((repConverted.length / repProformas.length) * 100) : 0;
    const avgBasket = repInvoices.length > 0 ? Math.round(repCA / repInvoices.length) : 0;

    return {
      rep,
      emitted: repProformas.length,
      converted: repConverted.length,
      rate: convRate,
      ca: repCA,
      avgBasket,
    };
  });

  return (
    <div className="flex-1 flex flex-col bg-[#f3faff] overflow-y-auto select-none p-4 gap-4">
      {/* HEADER & PERIOD SELECTOR */}
      <div className="bg-white border border-[#bfcaba] rounded p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#707a6c] tracking-wider">
            Direction Générale & Décisionnel
          </span>
          <h1 className="text-lg font-bold text-[#071e27] flex items-center gap-2">
            <span>📈 Tableau de Bord de Supervision Commerciale</span>
            <span className="text-xs font-semibold bg-[#e8f5e9] text-[#2e7d32] border border-[#a5d6a7] px-2 py-0.5 rounded">
              Temps Réel
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center border border-[#bfcaba] rounded overflow-hidden text-xs font-semibold">
            {['TODAY', 'WEEK', 'MONTH', 'YEAR'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 ${
                  period === p
                    ? 'bg-[#0d631b] text-white'
                    : 'bg-white text-[#40493d] hover:bg-[#e6f6ff]'
                }`}
              >
                {p === 'TODAY'
                  ? "Aujourd'hui"
                  : p === 'WEEK'
                  ? 'Cette Semaine'
                  : p === 'MONTH'
                  ? 'Ce Mois'
                  : 'Année 2025'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TOP KPI METRICS TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white border border-[#cfd8dc] p-3 rounded shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#546e7a] block">
            Chiffre d&apos;Affaires Encaissé
          </span>
          <span className="text-xl font-bold font-mono text-[#0d631b] block mt-0.5">
            {totalCA.toLocaleString('fr-FR')} F
          </span>
          <span className="text-[10px] text-[#2e7d32] font-semibold">TTC Réalisé</span>
        </div>

        <div className="bg-white border border-[#cfd8dc] p-3 rounded shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#546e7a] block">
            Transactions / Ventes
          </span>
          <span className="text-xl font-bold font-mono text-[#071e27] block mt-0.5">
            {totalFactures}
          </span>
          <span className="text-[10px] text-[#707a6c]">Factures validées</span>
        </div>

        <div className="bg-white border border-[#cfd8dc] p-3 rounded shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#546e7a] block">
            Taux de Conversion PF→Vente
          </span>
          <span className="text-xl font-bold font-mono text-[#fc6018] block mt-0.5">
            {conversionRate}%
          </span>
          <span className="text-[10px] text-[#40493d]">
            {convertedProformasCount} sur {totalProformasCount} émises
          </span>
        </div>

        <div className="bg-white border border-[#cfd8dc] p-3 rounded shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#546e7a] block">
            Panier Moyen Caisse
          </span>
          <span className="text-xl font-bold font-mono text-[#071e27] block mt-0.5">
            {panierMoyen.toLocaleString('fr-FR')} F
          </span>
          <span className="text-[10px] text-[#707a6c]">Moyenne par client</span>
        </div>

        <div className="bg-white border border-[#cfd8dc] p-3 rounded shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#546e7a] block">
            Valorisation Stock (CMUP)
          </span>
          <span className="text-xl font-bold font-mono text-[#071e27] block mt-0.5">
            {totalStockValue.toLocaleString('fr-FR')} F
          </span>
          <span className="text-[10px] text-[#2e7d32] font-semibold">Actif circulant</span>
        </div>
      </div>

      {/* MIDDLE: COMMERCIAL LEADERBOARD */}
      <div className="bg-white border border-[#bfcaba] rounded overflow-hidden shadow-xs">
        <div className="p-3 bg-[#cfe6f2] border-b border-[#bfcaba] flex items-center justify-between">
          <span className="font-bold text-xs uppercase tracking-wider text-[#071e27]">
            🏆 Performance par Commercial (Période Active)
          </span>
          <span className="text-xs text-[#707a6c]">Suivi des conversions et objectifs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#e6f6ff] text-[#071e27] font-bold border-b border-[#bfcaba]">
              <tr>
                <th className="p-2.5">Commercial</th>
                <th className="p-2.5 text-center">Proformas Émises</th>
                <th className="p-2.5 text-center">Proformas Encaissées</th>
                <th className="p-2.5 text-center">Taux Conv.</th>
                <th className="p-2.5 text-right">CA Réalisé (FCFA)</th>
                <th className="p-2.5 text-right">Panier Moyen</th>
                <th className="p-2.5 text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6f6ff]">
              {performanceByRep.map((item) => (
                <tr key={item.rep.id} className="hover:bg-[#f3faff]">
                  <td className="p-2.5 font-bold text-[#071e27]">
                    <div>{item.rep.name}</div>
                    <div className="text-[10px] text-[#707a6c] font-normal">{item.rep.email}</div>
                  </td>
                  <td className="p-2.5 text-center font-mono font-semibold">{item.emitted}</td>
                  <td className="p-2.5 text-center font-mono font-bold text-[#0d631b]">
                    {item.converted}
                  </td>
                  <td className="p-2.5 text-center font-mono">
                    <span className="bg-[#e6f6ff] border border-[#bfcaba] px-2 py-0.5 rounded font-bold">
                      {item.rate}%
                    </span>
                  </td>
                  <td className="p-2.5 text-right font-mono font-bold text-[#0d631b]">
                    {item.ca.toLocaleString('fr-FR')} F
                  </td>
                  <td className="p-2.5 text-right font-mono text-[#40493d]">
                    {item.avgBasket.toLocaleString('fr-FR')} F
                  </td>
                  <td className="p-2.5 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#e8f5e9] text-[#2e7d32]">
                      Actif
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BOTTOM: LIVE ACTIVITY STREAM + ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Stream */}
        <div className="bg-white border border-[#bfcaba] rounded overflow-hidden shadow-xs flex flex-col">
          <div className="p-3 bg-[#e6f6ff] border-b border-[#bfcaba] font-bold text-xs uppercase tracking-wider text-[#071e27] flex items-center justify-between">
            <span>⚡ Flux d&apos;Activité en Direct</span>
            <span className="w-2 h-2 rounded-full bg-[#88d982] animate-pulse"></span>
          </div>
          <div className="p-3 divide-y divide-[#e6f6ff] overflow-y-auto max-h-64">
            {invoices.map((inv) => (
              <div key={inv.id} className="py-2 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold font-mono text-[#071e27]">{inv.reference}</span>
                  <span className="text-[#707a6c] ml-2">Encaissé par {inv.cashierName}</span>
                  <div className="text-[11px] text-[#40493d]">{inv.customerName}</div>
                </div>
                <div className="text-right">
                  <span className="font-bold font-mono text-[#0d631b] text-sm">
                    {inv.totalTTC.toLocaleString('fr-FR')} F
                  </span>
                  <div className="text-[10px] text-[#707a6c] uppercase">{inv.paymentMethod}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts Center */}
        <div className="bg-white border border-[#bfcaba] rounded overflow-hidden shadow-xs flex flex-col">
          <div className="p-3 bg-[#fff3e0] border-b border-[#ffcc80] font-bold text-xs uppercase tracking-wider text-[#e65100] flex items-center justify-between">
            <span>🚨 Alertes de Stock & Approvisionnement ({lowStockAlerts.length})</span>
            <span className="text-[10px] bg-[#e65100] text-white px-2 py-0.5 rounded font-mono">
              Action Requise
            </span>
          </div>
          <div className="p-3 divide-y divide-[#e6f6ff] overflow-y-auto max-h-64">
            {lowStockAlerts.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#2e7d32]">
                Aucun produit en rupture ou seuil critique.
              </div>
            ) : (
              lowStockAlerts.map((p) => (
                <div key={p.id} className="py-2 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#071e27]">{p.designation}</span>
                    <div className="text-[10px] text-[#707a6c] font-mono">
                      {p.sku} • {p.location}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        p.stockPhysical === 0
                          ? 'bg-[#ffdad6] text-[#ba1a1a]'
                          : 'bg-[#fff3e0] text-[#e65100]'
                      }`}
                    >
                      {p.stockPhysical === 0 ? 'RUPTURE TOTALE' : `${p.stockPhysical} restants`}
                    </span>
                    <div className="text-[10px] text-[#707a6c]">Seuil min : {p.alertThreshold}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

