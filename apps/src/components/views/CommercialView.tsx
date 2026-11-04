'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { canAccessView, hasCapability } from '@/lib/rbac';

export const CommercialView: React.FC = () => {
  const {
    products,
    customers,
    commercialCart,
    addToCommercialCart,
    removeFromCommercialCart,
    updateCommercialCartItem,
    clearCommercialCart,
    createProforma,
    selectedCustomerId,
    setSelectedCustomerId,
    setActiveView,
    currentUser,
  } = useAppStore();
  const canOpenCaisse = canAccessView(currentUser?.role, 'CAISSE');
  const canCreateProforma = hasCapability(currentUser?.role, 'CREATE_PROFORMA');

  const [productSearch, setProductSearch] = useState('');
  const [notes, setNotes] = useState('Proforma valable 15 jours. Matériel sous garantie constructeur.');
  const [successProformaRef, setSuccessProformaRef] = useState<string | null>(null);

  const totalHT = commercialCart.reduce((sum, it) => sum + it.totalHT, 0);
  const totalTTC = commercialCart.reduce((sum, it) => sum + it.totalTTC, 0);
  const totalTVA = totalTTC - totalHT;
  const discountTotal = commercialCart.reduce(
    (sum, it) => sum + (it.unitPriceHT * it.quantity - it.totalHT),
    0
  );

  const filteredProducts = products.filter(
    (p) =>
      p.designation.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.barcode.includes(productSearch)
  );

  const handleEmitProforma = () => {
    if (commercialCart.length === 0) return;
    const proforma = createProforma(notes);
    setSuccessProformaRef(proforma.reference);

    setTimeout(() => {
      setSuccessProformaRef(null);
    }, 6000);
  };

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  return (
    <div className="flex-1 flex flex-col bg-[#f3faff] overflow-hidden select-none">
      {/* SUCCESS BANNER */}
      {successProformaRef && (
        <div className="bg-[#2e7d32] text-white p-3 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <span>✓ Proforma <strong>{successProformaRef}</strong> créée et transmise au guichet Caisse !</span>
          </div>
          {canOpenCaisse && (
            <button
              onClick={() => setActiveView('CAISSE')}
              className="bg-white text-[#0d631b] px-3 py-1 rounded text-xs font-bold hover:bg-white/90"
            >
              Aller à la Caisse (F5) →
            </button>
          )}
        </div>
      )}

      {/* TOP CONFIGURATION BAR */}
      <div className="bg-white border-b border-[#bfcaba] p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-[10px] uppercase font-bold text-[#707a6c]">
              Client Assigné
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="h-8 text-xs font-semibold bg-[#e6f6ff] border border-[#bfcaba] rounded px-2 text-[#071e27] focus:outline-none focus:ring-1 focus:ring-[#0d631b]"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName} ({c.contactName})
                </option>
              ))}
            </select>
          </div>

          <div className="hidden sm:block text-xs border-l border-[#bfcaba] pl-4">
            <span className="text-[#707a6c] block text-[10px]">Contact & Téléphone</span>
            <span className="font-semibold text-[#071e27]">{selectedCustomer?.phone}</span>
          </div>

          <div className="hidden md:block text-xs border-l border-[#bfcaba] pl-4">
            <span className="text-[#707a6c] block text-[10px]">Localisation</span>
            <span className="text-[#40493d] truncate max-w-xs block">{selectedCustomer?.address}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearCommercialCart}
            disabled={commercialCart.length === 0}
            className="h-8 px-2.5 text-xs text-[#ba1a1a] hover:bg-[#ffdad6] rounded border border-[#ffdad6] font-semibold transition-colors disabled:opacity-40"
          >
            Vider la sélection
          </button>
          {canCreateProforma && (
            <button
              onClick={handleEmitProforma}
              disabled={commercialCart.length === 0}
              className="h-8 px-4 bg-[#0d631b] hover:bg-[#2e7d32] text-white rounded text-xs font-bold shadow-xs flex items-center gap-1.5 active:scale-95 transition-all disabled:opacity-40"
            >
              <span>📄</span>
              <span>Émettre Proforma ({commercialCart.length} réf.)</span>
            </button>
          )}
        </div>
      </div>

      {/* WORKSPACE: Left Search & Catalog + Right Cart */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT: Product Catalog Picker */}
        <div className="w-full lg:w-96 bg-white border-r border-[#bfcaba] flex flex-col shrink-0">
          <div className="p-3 border-b border-[#bfcaba] bg-[#e6f6ff]">
            <div className="text-xs font-bold text-[#071e27] mb-1.5 flex items-center justify-between">
              <span>Catalogue & Disponibilités</span>
              <span className="text-[10px] text-[#707a6c] font-mono">F2 Recherche</span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Désignation, référence, code-barres..."
                className="w-full h-8 pl-8 pr-2 bg-white border border-[#bfcaba] rounded text-xs text-[#071e27] focus:outline-none focus:ring-1 focus:ring-[#0d631b]"
              />
              <span className="absolute left-2.5 top-2 text-xs text-[#707a6c]">🔍</span>
            </div>
          </div>

          {/* Product Items List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#e6f6ff]">
            {filteredProducts.map((p) => {
              const isOutOfStock = p.stockPhysical === 0;
              const isLowStock = p.stockPhysical <= p.alertThreshold && !isOutOfStock;

              return (
                <div
                  key={p.id}
                  className="p-2.5 hover:bg-[#f3faff] flex items-center justify-between gap-2 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-[#071e27] truncate">
                      {p.designation}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-[#707a6c] font-mono mt-0.5">
                      <span>{p.sku}</span>
                      <span>•</span>
                      <span>{p.location}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold text-xs text-[#0d631b] font-mono">
                        {p.unitPriceHT.toLocaleString('fr-FR')} F HT
                      </span>
                      <span
                        className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase ${
                          isOutOfStock
                            ? 'bg-[#ffdad6] text-[#ba1a1a]'
                            : isLowStock
                            ? 'bg-[#fff3e0] text-[#e65100]'
                            : 'bg-[#e8f5e9] text-[#2e7d32]'
                        }`}
                      >
                        {isOutOfStock
                          ? 'Rupture'
                          : `${p.stockPhysical} en stock`}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => addToCommercialCart(p, 1, 0)}
                    disabled={isOutOfStock}
                    className={`h-7 px-2.5 rounded text-xs font-bold transition-all ${
                      isOutOfStock
                        ? 'bg-[#cfd8dc] text-[#90a4ae] cursor-not-allowed'
                        : 'bg-[#e6f6ff] text-[#0d631b] hover:bg-[#0d631b] hover:text-white border border-[#bfcaba]'
                    }`}
                  >
                    + Ajouter
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Current Proforma Lines Builder */}
        <div className="flex-1 flex flex-col bg-[#f3faff] overflow-y-auto p-4">
          <div className="bg-white border border-[#bfcaba] rounded flex-1 flex flex-col overflow-hidden shadow-xs">
            <div className="p-3 border-b border-[#bfcaba] bg-[#cfe6f2] flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider text-[#071e27]">
                Lignes du Devis Proforma ({commercialCart.length} articles)
              </span>
              <span className="text-xs font-mono text-[#071e27]">
                Client : <strong>{selectedCustomer?.companyName}</strong>
              </span>
            </div>

            {/* Lines Table */}
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#e6f6ff] text-[#071e27] font-bold border-b border-[#bfcaba]">
                  <tr>
                    <th className="p-2.5 w-8">N°</th>
                    <th className="p-2.5">Réf & Désignation du Matériel</th>
                    <th className="p-2.5 text-center w-20">Stock</th>
                    <th className="p-2.5 text-center w-24">Qté Dem.</th>
                    <th className="p-2.5 text-right w-28">P.U HT (FCFA)</th>
                    <th className="p-2.5 text-center w-20">Rem %</th>
                    <th className="p-2.5 text-right w-32">Total HT (FCFA)</th>
                    <th className="p-2.5 text-center w-12">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6f6ff]">
                  {commercialCart.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-[#707a6c]">
                        Le panier proforma est vide. Cliquez sur &quot;+ Ajouter&quot; dans le catalogue à gauche pour insérer des articles.
                      </td>
                    </tr>
                  ) : (
                    commercialCart.map((item, idx) => {
                      const prod = products.find((p) => p.id === item.productId);
                      const isStockExceeded = prod && prod.stockPhysical < item.quantity;

                      return (
                        <tr key={item.productId} className="hover:bg-[#f3faff]">
                          <td className="p-2.5 text-[#707a6c] font-mono">{idx + 1}</td>
                          <td className="p-2.5">
                            <div className="font-semibold text-[#071e27]">{item.designation}</div>
                            <div className="text-[10px] text-[#707a6c] font-mono">{item.sku}</div>
                          </td>
                          <td className="p-2.5 text-center font-mono">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                isStockExceeded
                                  ? 'bg-[#ffdad6] text-[#ba1a1a]'
                                  : 'bg-[#e8f5e9] text-[#2e7d32]'
                              }`}
                            >
                              {prod ? prod.stockPhysical : '-'}
                            </span>
                          </td>
                          <td className="p-2.5 text-center">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                updateCommercialCartItem(
                                  item.productId,
                                  Math.max(1, parseInt(e.target.value) || 1),
                                  item.discountPercent
                                )
                              }
                              className="w-16 h-7 text-center font-bold font-mono bg-[#f3faff] border border-[#bfcaba] rounded focus:ring-1 focus:ring-[#0d631b]"
                            />
                          </td>
                          <td className="p-2.5 text-right font-mono font-medium">
                            {item.unitPriceHT.toLocaleString('fr-FR')}
                          </td>
                          <td className="p-2.5 text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={item.discountPercent}
                              onChange={(e) =>
                                updateCommercialCartItem(
                                  item.productId,
                                  item.quantity,
                                  Math.min(100, Math.max(0, parseFloat(e.target.value) || 0))
                                )
                              }
                              className="w-14 h-7 text-center font-mono text-xs bg-[#f3faff] border border-[#bfcaba] rounded"
                            />
                          </td>
                          <td className="p-2.5 text-right font-bold font-mono text-[#0d631b]">
                            {item.totalHT.toLocaleString('fr-FR')}
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              onClick={() => removeFromCommercialCart(item.productId)}
                              className="text-[#ba1a1a] hover:bg-[#ffdad6] p-1 rounded transition-colors"
                              title="Supprimer la ligne"
                            >
                              🗑
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Notes & Conditions Input */}
            <div className="p-3 border-t border-[#bfcaba] bg-[#f8fafc]">
              <label className="block text-[10px] uppercase font-bold text-[#707a6c] mb-1">
                Conditions particulières / Notes de devis
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-8 px-2 text-xs bg-white border border-[#bfcaba] rounded"
              />
            </div>

            {/* Bottom Total Bar */}
            <div className="p-3 bg-[#e6f6ff] border-t border-[#bfcaba] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[#707a6c] block text-[10px]">Total Brut HT</span>
                <span className="font-bold font-mono text-sm">
                  {totalHT.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              <div>
                <span className="text-[#707a6c] block text-[10px]">Remises Accordées</span>
                <span className="font-bold font-mono text-sm text-[#a83900]">
                  -{discountTotal.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              <div>
                <span className="text-[#707a6c] block text-[10px]">TVA Standard (18%)</span>
                <span className="font-bold font-mono text-sm">
                  +{totalTVA.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              <div className="bg-[#0d631b] text-white p-2 rounded -m-1 flex flex-col justify-center">
                <span className="text-white/80 block text-[10px] uppercase font-bold">
                  Montant Net TTC
                </span>
                <span className="font-bold font-mono text-base">
                  {totalTTC.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

