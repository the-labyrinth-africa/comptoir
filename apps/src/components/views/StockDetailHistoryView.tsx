'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { canAccessView } from '@/lib/rbac';

export const StockDetailHistoryView: React.FC = () => {
  const {
    products,
    movements,
    selectedProductIdForDetail,
    setSelectedProductIdForDetail,
    setActiveView,
    currentUser,
  } = useAppStore();
  const canOpenInventory = canAccessView(currentUser?.role, 'STOCK_INVENTORY');
  const canOpenReception = canAccessView(currentUser?.role, 'SUPPLIER_RECEPTION');

  const activeProduct =
    products.find((p) => p.id === selectedProductIdForDetail) || products[0];

  const productMovements = movements.filter((m) => m.productId === activeProduct.id);

  const inventoryValueCMUP = activeProduct.stockPhysical * activeProduct.costPriceCMUP;
  const inventoryValueSale = activeProduct.stockPhysical * activeProduct.unitPriceHT;

  return (
    <div className="flex-1 flex flex-col bg-[#f3faff] overflow-hidden select-none">
      {/* TOP BAR / ARTICLE SELECTOR */}
      <div className="bg-white border-b border-[#bfcaba] p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-[#707a6c] uppercase">
            Sélectionner un Article :
          </label>
          <select
            value={activeProduct.id}
            onChange={(e) => setSelectedProductIdForDetail(e.target.value)}
            className="h-8 px-2.5 bg-[#e6f6ff] border border-[#bfcaba] rounded text-xs font-bold text-[#071e27] focus:ring-1 focus:ring-[#0d631b]"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                [{p.sku}] {p.designation}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {canOpenInventory && (
            <button
              onClick={() => setActiveView('STOCK_INVENTORY')}
              className="h-8 px-3 text-xs font-semibold text-[#071e27] hover:bg-[#e6f6ff] rounded border border-[#bfcaba]"
            >
              ← Retour à l&apos;Inventaire (F4)
            </button>
          )}
          {canOpenReception && (
            <button
              onClick={() => setActiveView('SUPPLIER_RECEPTION')}
              className="h-8 px-3 bg-[#0d631b] hover:bg-[#2e7d32] text-white rounded text-xs font-bold flex items-center gap-1.5"
            >
              <span>📥</span>
              <span>Réceptionner ce produit (F7)</span>
            </button>
          )}
        </div>
      </div>

      {/* WORKSPACE */}
      <div className="flex-1 flex flex-col p-4 overflow-y-auto gap-4">
        {/* PRODUCT DETAIL CARD */}
        <div className="bg-white border border-[#bfcaba] rounded p-4 shadow-xs">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#e6f6ff] pb-3 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs bg-[#e6f6ff] text-[#0d631b] border border-[#bfcaba] px-2 py-0.5 rounded font-bold">
                  {activeProduct.sku}
                </span>
                <span className="font-mono text-xs text-[#707a6c]">
                  Code-barres : {activeProduct.barcode}
                </span>
                <span className="text-xs bg-[#f8fafc] text-[#40493d] border border-[#cfd8dc] px-2 py-0.5 rounded">
                  {activeProduct.family}
                </span>
              </div>
              <h1 className="text-lg font-bold text-[#071e27]">{activeProduct.designation}</h1>
              <div className="text-xs text-[#707a6c] mt-0.5">
                Emplacement : <strong className="text-[#071e27]">{activeProduct.location}</strong> | Fournisseur habituel : <strong>{activeProduct.supplier}</strong>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-[#e8f5e9] border border-[#a5d6a7] p-3 rounded text-center min-w-28">
                <span className="text-[10px] uppercase font-bold text-[#2e7d32] block">
                  Stock Physique
                </span>
                <span className="text-2xl font-bold font-mono text-[#2e7d32]">
                  {activeProduct.stockPhysical}
                </span>
              </div>
              <div className="bg-[#fff3e0] border border-[#ffcc80] p-3 rounded text-center min-w-28">
                <span className="text-[10px] uppercase font-bold text-[#e65100] block">
                  Seuil Alerte Min
                </span>
                <span className="text-2xl font-bold font-mono text-[#e65100]">
                  {activeProduct.alertThreshold}
                </span>
              </div>
            </div>
          </div>

          {/* Valorisation metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#f8fafc] p-3 rounded border border-[#cfd8dc]">
            <div>
              <span className="text-[#707a6c] block text-[10px]">CMUP d&apos;Achat Actuel</span>
              <span className="font-bold font-mono text-sm text-[#071e27]">
                {activeProduct.costPriceCMUP.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
            <div>
              <span className="text-[#707a6c] block text-[10px]">Prix Vente Unitaire HT</span>
              <span className="font-bold font-mono text-sm text-[#0d631b]">
                {activeProduct.unitPriceHT.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
            <div>
              <span className="text-[#707a6c] block text-[10px]">Valorisation Stock (CMUP)</span>
              <span className="font-bold font-mono text-sm text-[#071e27]">
                {inventoryValueCMUP.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
            <div>
              <span className="text-[#707a6c] block text-[10px]">Valeur Marchande (P.Vente)</span>
              <span className="font-bold font-mono text-sm text-[#0d631b]">
                {inventoryValueSale.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>
        </div>

        {/* MOVEMENTS AUDIT TRAIL (GRAND LIVRE) */}
        <div className="bg-white border border-[#bfcaba] rounded flex-1 flex flex-col overflow-hidden shadow-xs">
          <div className="p-3 border-b border-[#bfcaba] bg-[#cfe6f2] flex items-center justify-between">
            <span className="font-bold text-xs uppercase tracking-wider text-[#071e27] flex items-center gap-1.5">
              <span>📜</span> Grand Livre des Mouvements de Stock ({productMovements.length} écritures)
            </span>
            <span className="text-xs font-mono text-[#707a6c]">
              Traçabilité inaltérable
            </span>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#e6f6ff] text-[#071e27] font-bold border-b border-[#bfcaba]">
                <tr>
                  <th className="p-2.5">Date & Heure</th>
                  <th className="p-2.5">Type Opération</th>
                  <th className="p-2.5">N° Justificatif</th>
                  <th className="p-2.5 text-right">Stock Avant</th>
                  <th className="p-2.5 text-center">Flux (Qté)</th>
                  <th className="p-2.5 text-right">Stock Après</th>
                  <th className="p-2.5 text-right">Valeur Unitaire</th>
                  <th className="p-2.5">Opérateur / Caisse</th>
                  <th className="p-2.5">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6f6ff]">
                {productMovements.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-[#707a6c]">
                      Aucun mouvement enregistré pour cet article.
                    </td>
                  </tr>
                ) : (
                  productMovements.map((m) => {
                    const isPositive = m.quantity > 0;
                    return (
                      <tr key={m.id} className="hover:bg-[#f3faff]">
                        <td className="p-2.5 font-mono text-[#707a6c]">
                          {new Date(m.createdAt).toLocaleString('fr-FR')}
                        </td>
                        <td className="p-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              m.movementType === 'RECEPTION_FOURNISSEUR'
                                ? 'bg-[#e8f5e9] text-[#2e7d32] border border-[#a5d6a7]'
                                : m.movementType === 'VENTE_SORTIE'
                                ? 'bg-[#fff3e0] text-[#e65100] border border-[#ffcc80]'
                                : 'bg-[#e6f6ff] text-[#0d631b]'
                            }`}
                          >
                            {m.movementType.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-2.5 font-mono font-bold text-[#071e27]">
                          {m.documentRef}
                        </td>
                        <td className="p-2.5 text-right font-mono text-[#707a6c]">
                          {m.stockBefore}
                        </td>
                        <td className="p-2.5 text-center font-mono font-bold text-sm">
                          <span className={isPositive ? 'text-[#2e7d32]' : 'text-[#c62828]'}>
                            {isPositive ? `+${m.quantity}` : m.quantity}
                          </span>
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-[#071e27]">
                          {m.stockAfter}
                        </td>
                        <td className="p-2.5 text-right font-mono font-semibold text-[#0d631b]">
                          {m.unitValue.toLocaleString('fr-FR')} F
                        </td>
                        <td className="p-2.5 text-[#071e27] font-medium">{m.operatorName}</td>
                        <td className="p-2.5 text-[11px] text-[#707a6c] italic">{m.notes}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

