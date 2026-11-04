'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { canAccessView, hasCapability } from '@/lib/rbac';

export const StockInventoryView: React.FC = () => {
  const {
    products,
    outputSlips,
    validateOutputSlip,
    setSelectedProductIdForDetail,
    setActiveView,
    currentUser,
  } = useAppStore();
  const canReceiveStock = hasCapability(currentUser?.role, 'RECORD_RECEPTION');
  const canValidateSlips = hasCapability(currentUser?.role, 'VALIDATE_OUTPUT_SLIP');
  const canOpenHistory = canAccessView(currentUser?.role, 'STOCK_MOVEMENT_HISTORY');
  const canOpenReception = canAccessView(currentUser?.role, 'SUPPLIER_RECEPTION');

  const [filterText, setFilterText] = useState('');
  const [selectedFamily, setSelectedFamily] = useState('ALL');

  const families = ['ALL', ...Array.from(new Set(products.map((p) => p.family)))];

  const pendingSlips = outputSlips.filter((s) => s.status === 'EN_ATTENTE');
  const deliveredSlips = outputSlips.filter((s) => s.status === 'LIVRE');

  const filteredProducts = products.filter((p) => {
    const matchesText =
      p.designation.toLowerCase().includes(filterText.toLowerCase()) ||
      p.sku.toLowerCase().includes(filterText.toLowerCase()) ||
      p.barcode.includes(filterText) ||
      p.location.toLowerCase().includes(filterText.toLowerCase());

    const matchesFamily = selectedFamily === 'ALL' || p.family === selectedFamily;
    return matchesText && matchesFamily;
  });

  const lowStockCount = products.filter(
    (p) => p.stockPhysical <= p.alertThreshold && p.stockPhysical > 0
  ).length;
  const outOfStockCount = products.filter((p) => p.stockPhysical === 0).length;
  const normalStockCount = products.filter((p) => p.stockPhysical > p.alertThreshold).length;

  return (
    <div className="flex-1 flex flex-col bg-[#f3faff] overflow-hidden select-none">
      {/* TOP KPI TILES */}
      <div className="p-3 bg-white border-b border-[#bfcaba] grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-[#f8fafc] border border-[#cfd8dc] p-2.5 rounded">
          <span className="text-[10px] uppercase font-bold text-[#546e7a]">Total Références</span>
          <div className="text-xl font-bold font-mono text-[#071e27] mt-0.5">
            {products.length}
          </div>
          <span className="text-[10px] text-[#2e7d32] font-semibold">100% catalogué</span>
        </div>

        <div className="bg-[#e8f5e9] border border-[#a5d6a7] p-2.5 rounded">
          <span className="text-[10px] uppercase font-bold text-[#2e7d32]">En Stock Normal</span>
          <div className="text-xl font-bold font-mono text-[#2e7d32] mt-0.5">
            {normalStockCount}
          </div>
          <span className="text-[10px] text-[#2e7d32]">Niveau optimal</span>
        </div>

        <div className="bg-[#fff3e0] border border-[#ffcc80] p-2.5 rounded">
          <span className="text-[10px] uppercase font-bold text-[#e65100]">Rupture Imminente</span>
          <div className="text-xl font-bold font-mono text-[#e65100] mt-0.5">
            {lowStockCount}
          </div>
          <span className="text-[10px] text-[#e65100] font-semibold">Seuil critique</span>
        </div>

        <div className="bg-[#ffebee] border border-[#ef9a9a] p-2.5 rounded">
          <span className="text-[10px] uppercase font-bold text-[#c62828]">Rupture Totale</span>
          <div className="text-xl font-bold font-mono text-[#c62828] mt-0.5">
            {outOfStockCount}
          </div>
          <span className="text-[10px] text-[#c62828] font-semibold">Réappro urgent</span>
        </div>

        <div className="bg-[#dbf1fe] border border-[#bfcaba] p-2.5 rounded col-span-2 sm:col-span-1">
          <span className="text-[10px] uppercase font-bold text-[#0d631b]">Bons Sortie en Attente</span>
          <div className="text-xl font-bold font-mono text-[#071e27] mt-0.5">
            {pendingSlips.length}
          </div>
          <span className="text-[10px] text-[#fc6018] font-bold">À préparer en magasin</span>
        </div>
      </div>

      {/* MAIN CONTAINER: Left Table + Right Pending Slips Drawer */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* INVENTORY TABLE */}
        <div className="flex-1 flex flex-col bg-white border-r border-[#bfcaba] overflow-hidden">
          {/* Filter Bar */}
          <div className="p-3 border-b border-[#bfcaba] bg-[#f8fafc] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="Filtrer code, nom, casier..."
                className="h-8 w-64 pl-2 pr-2 bg-white border border-[#bfcaba] rounded text-xs text-[#071e27] focus:outline-none focus:ring-1 focus:ring-[#0d631b]"
              />
              <select
                value={selectedFamily}
                onChange={(e) => setSelectedFamily(e.target.value)}
                className="h-8 px-2 bg-white border border-[#bfcaba] rounded text-xs text-[#071e27] font-semibold"
              >
                {families.map((f) => (
                  <option key={f} value={f}>
                    {f === 'ALL' ? 'Toutes les familles' : f}
                  </option>
                ))}
              </select>
            </div>

            {canOpenReception && canReceiveStock && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveView('SUPPLIER_RECEPTION')}
                  className="h-8 px-3 bg-[#0d631b] hover:bg-[#2e7d32] text-white rounded text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <span>📥</span>
                  <span>Nouvelle Réception (F7)</span>
                </button>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#cfe6f2] text-[#071e27] font-bold sticky top-0 border-b border-[#bfcaba] z-10">
                <tr>
                  <th className="p-2.5">Code Article</th>
                  <th className="p-2.5">Désignation Produit</th>
                  <th className="p-2.5">Famille</th>
                  <th className="p-2.5">Emplacement</th>
                  <th className="p-2.5 text-right">Qté Stock</th>
                  <th className="p-2.5 text-right">Seuil Min</th>
                  <th className="p-2.5 text-center">Statut</th>
                  <th className="p-2.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6f6ff]">
                {filteredProducts.map((p) => {
                  const isOutOfStock = p.stockPhysical === 0;
                  const isLowStock = p.stockPhysical <= p.alertThreshold && !isOutOfStock;

                  return (
                    <tr key={p.id} className="hover:bg-[#f3faff]">
                      <td className="p-2.5 font-mono font-semibold text-[#071e27]">
                        <div>{p.sku}</div>
                        <div className="text-[10px] text-[#707a6c]">{p.barcode}</div>
                      </td>
                      <td className="p-2.5 font-medium text-[#071e27]">
                        {p.designation}
                        <div className="text-[10px] text-[#707a6c]">
                          CMUP : {p.costPriceCMUP.toLocaleString('fr-FR')} F | P.Vente : {p.unitPriceHT.toLocaleString('fr-FR')} F HT
                        </div>
                      </td>
                      <td className="p-2.5 text-[#40493d]">{p.family}</td>
                      <td className="p-2.5 font-mono text-xs text-[#071e27]">
                        <span className="bg-[#e6f6ff] border border-[#bfcaba] px-1.5 py-0.5 rounded">
                          {p.location}
                        </span>
                      </td>
                      <td className="p-2.5 text-right font-bold font-mono text-sm">
                        {p.stockPhysical}
                      </td>
                      <td className="p-2.5 text-right font-mono text-[#707a6c]">
                        {p.alertThreshold}
                      </td>
                      <td className="p-2.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isOutOfStock
                              ? 'bg-[#ffdad6] text-[#ba1a1a] border border-[#ef9a9a]'
                              : isLowStock
                              ? 'bg-[#fff3e0] text-[#e65100] border border-[#ffcc80]'
                              : 'bg-[#e8f5e9] text-[#2e7d32] border border-[#a5d6a7]'
                          }`}
                        >
                          {isOutOfStock ? 'Rupture' : isLowStock ? 'Imminent' : 'En Stock'}
                        </span>
                      </td>
                      <td className="p-2.5 text-center">
                        {canOpenHistory ? (
                          <button
                            onClick={() => {
                              setSelectedProductIdForDetail(p.id);
                              setActiveView('STOCK_MOVEMENT_HISTORY');
                            }}
                            className="px-2 py-1 bg-[#e6f6ff] hover:bg-[#dbf1fe] text-[#0d631b] border border-[#bfcaba] rounded font-semibold text-[11px] transition-colors"
                            title="Consulter le grand livre des mouvements"
                          >
                            Fiche F8 →
                          </button>
                        ) : (
                          <span className="text-[10px] text-[#707a6c]">Consultation</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {canValidateSlips && (
        <div className="w-full lg:w-88 bg-[#f8fafc] border-l border-[#bfcaba] flex flex-col shrink-0">
          <div className="p-3 border-b border-[#bfcaba] bg-[#e6f6ff] flex items-center justify-between">
            <span className="font-bold text-xs uppercase tracking-wider text-[#071e27]">
              📦 Bons de Sortie Caisse ({pendingSlips.length} en attente)
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {pendingSlips.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#707a6c] bg-white rounded border border-[#cfd8dc]">
                Aucun bon de sortie en attente de préparation physique.
              </div>
            ) : (
              pendingSlips.map((slip) => (
                <div
                  key={slip.id}
                  className="bg-white border-2 border-[#fc6018] rounded p-3 shadow-xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold font-mono text-xs text-[#fc6018]">
                      {slip.reference}
                    </span>
                    <span className="text-[10px] bg-[#fff3e0] text-[#e65100] px-1.5 py-0.2 rounded font-bold uppercase">
                      À Préparer
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-[#071e27] mb-1">
                    Client : {slip.customerName}
                  </div>
                  <div className="text-[11px] text-[#707a6c] mb-2 font-mono">
                    Réf Facture : {slip.invoiceRef}
                  </div>

                  {/* Items to pick */}
                  <div className="border-t border-[#e6f6ff] pt-2 mb-3 space-y-1 text-xs">
                    {slip.items.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="truncate pr-2 font-medium">{it.designation}</span>
                        <span className="font-bold font-mono bg-[#e6f6ff] px-1.5 py-0.5 rounded text-[11px]">
                          x{it.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Validate button */}
                  <button
                    onClick={() => validateOutputSlip(slip.id)}
                    className="w-full h-8 bg-[#2e7d32] hover:bg-[#1b5e20] text-white rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-98"
                  >
                    <span>✓</span>
                    <span>Valider Déstockage & Remise Client</span>
                  </button>
                </div>
              ))
            )}

            {deliveredSlips.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] font-bold text-[#707a6c] uppercase block mb-2">
                  Dernières remises validées ({deliveredSlips.length})
                </span>
                <div className="space-y-2">
                  {deliveredSlips.slice(0, 3).map((s) => (
                    <div
                      key={s.id}
                      className="bg-white border border-[#cfd8dc] rounded p-2 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-mono font-bold text-[#2e7d32]">{s.reference}</span>
                        <div className="text-[10px] text-[#707a6c]">{s.customerName}</div>
                      </div>
                      <span className="text-[10px] bg-[#e8f5e9] text-[#2e7d32] px-1.5 py-0.5 rounded font-bold">
                        LIVRÉ
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

