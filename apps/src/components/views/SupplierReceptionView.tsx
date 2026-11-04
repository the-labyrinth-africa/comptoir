'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { SupplierReceptionItem } from '@/types';

export const SupplierReceptionView: React.FC = () => {
  const {
    products,
    receptions,
    recordSupplierReception,
    setActiveView,
    setSelectedProductIdForDetail,
  } = useAppStore();

  const [supplierName, setSupplierName] = useState('Schneider Electric Côte d\'Ivoire');
  const [poNumber, setPoNumber] = useState('PO-2025-095');
  const [blRef, setBlRef] = useState(`BL-FOURN-2025-0${receptions.length + 19}`);
  const [selectedProductId, setSelectedProductId] = useState(products[1]?.id || products[0]?.id);
  const [qtyReceived, setQtyReceived] = useState<number>(10);
  const [purchasePriceHT, setPurchasePriceHT] = useState<number>(19500);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const handleValidateReception = () => {
    if (!selectedProduct || qtyReceived <= 0) return;

    const plannedCMUP = Math.round(
      (selectedProduct.stockPhysical * selectedProduct.costPriceCMUP +
        qtyReceived * purchasePriceHT) /
        (selectedProduct.stockPhysical + qtyReceived)
    );

    const item: SupplierReceptionItem = {
      productId: selectedProduct.id,
      sku: selectedProduct.sku,
      designation: selectedProduct.designation,
      location: selectedProduct.location,
      quantityOrdered: qtyReceived,
      quantityReceived: qtyReceived,
      gap: 0,
      purchasePriceHT,
      plannedCMUP,
      packageInfo: `${qtyReceived} unités en carton scellé`,
    };

    recordSupplierReception({
      reference: blRef,
      supplierName,
      poNumber,
      receptionDate: new Date().toISOString().split('T')[0],
      items: [item],
      totalHT: qtyReceived * purchasePriceHT,
      receivedBy: 'Gestionnaire de Stock',
      notes: 'Réception conforme au bon de commande.',
    });

    setSuccessMsg(
      `Réception ${blRef} validée avec succès ! Stock de ${selectedProduct.sku} incrémenté de +${qtyReceived} et CMUP actualisé.`
    );

    setBlRef(`BL-FOURN-2025-0${receptions.length + 20}`);
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f3faff] overflow-hidden select-none">
      {successMsg && (
        <div className="bg-[#2e7d32] text-white p-3 text-xs font-semibold flex items-center justify-between">
          <span>✓ {successMsg}</span>
          <button
            onClick={() => setActiveView('STOCK_MOVEMENT_HISTORY')}
            className="bg-white text-[#0d631b] px-3 py-1 rounded text-xs font-bold"
          >
            Voir la Traçabilité (F8) →
          </button>
        </div>
      )}

      {/* TOP HEADER */}
      <div className="bg-white border-b border-[#bfcaba] p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#707a6c] tracking-wider">
            Approvisionnement & Entrées en Stock
          </span>
          <h2 className="text-base font-bold text-[#071e27] flex items-center gap-2">
            <span>📥 Réception Fournisseur (Bon de Livraison)</span>
            <span className="text-xs bg-[#e6f6ff] text-[#0d631b] border border-[#bfcaba] px-2 py-0.5 rounded font-mono">
              CMUP Automatisé
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('STOCK_INVENTORY')}
            className="h-8 px-3 text-xs font-semibold text-[#071e27] hover:bg-[#e6f6ff] rounded border border-[#bfcaba]"
          >
            ← Retour à l&apos;Inventaire (F4)
          </button>
        </div>
      </div>

      {/* WORKSPACE */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-4 gap-4">
        {/* RECEPTION FORM */}
        <div className="w-full lg:w-110 bg-white border border-[#bfcaba] rounded flex flex-col p-4 shadow-xs shrink-0 overflow-y-auto">
          <div className="text-xs font-bold uppercase tracking-wider text-[#071e27] border-b border-[#bfcaba] pb-2 mb-3">
            Informations du Bon de Livraison (BL)
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-[#707a6c] mb-1">
                Numéro Réf. BL Fournisseur
              </label>
              <input
                type="text"
                value={blRef}
                onChange={(e) => setBlRef(e.target.value)}
                className="w-full h-8 px-2.5 font-mono font-bold text-xs bg-[#f3faff] border border-[#bfcaba] rounded"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#707a6c] mb-1">
                Fournisseur / Fabricant
              </label>
              <select
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                className="w-full h-8 px-2 text-xs bg-white border border-[#bfcaba] rounded font-semibold"
              >
                <option value="Schneider Electric Côte d&apos;Ivoire">Schneider Electric Côte d&apos;Ivoire</option>
                <option value="Câbleries d&apos;Abidjan S.A.">Câbleries d&apos;Abidjan S.A.</option>
                <option value="Legrand West Africa">Legrand West Africa</option>
                <option value="Nexans Maroc / UIE">Nexans Maroc / UIE</option>
                <option value="Hager Group">Hager Group</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-[#707a6c] mb-1">
                  N° Bon de Commande (PO)
                </label>
                <input
                  type="text"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  className="w-full h-8 px-2 font-mono bg-white border border-[#bfcaba] rounded"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#707a6c] mb-1">
                  Date de Réception
                </label>
                <input
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full h-8 px-2 bg-white border border-[#bfcaba] rounded"
                />
              </div>
            </div>

            <div className="border-t border-[#bfcaba] pt-3">
              <label className="block text-[11px] font-bold text-[#707a6c] mb-1">
                Article Réceptionné
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  const p = products.find((pr) => pr.id === e.target.value);
                  if (p) setPurchasePriceHT(p.costPriceCMUP);
                }}
                className="w-full h-8 px-2 text-xs bg-white border border-[#bfcaba] rounded font-semibold"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.sku}] {p.designation} (Stock: {p.stockPhysical})
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-[#e6f6ff] border border-[#bfcaba] rounded p-2.5 text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-[#707a6c]">Emplacement cible :</span>
                <span className="font-mono font-bold text-[#071e27]">{selectedProduct?.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#707a6c]">Stock physique actuel :</span>
                <span className="font-mono font-bold text-[#0d631b]">{selectedProduct?.stockPhysical}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#707a6c]">Ancien CMUP :</span>
                <span className="font-mono font-bold text-[#071e27]">
                  {selectedProduct?.costPriceCMUP.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-[#707a6c] mb-1">
                  Quantité Reçue
                </label>
                <input
                  type="number"
                  min="1"
                  value={qtyReceived}
                  onChange={(e) => setQtyReceived(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full h-8 px-2 text-center font-bold font-mono text-sm bg-white border border-[#bfcaba] rounded focus:ring-1 focus:ring-[#0d631b]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#707a6c] mb-1">
                  Prix d&apos;Achat Unitaire HT
                </label>
                <input
                  type="number"
                  min="0"
                  value={purchasePriceHT}
                  onChange={(e) => setPurchasePriceHT(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full h-8 px-2 text-right font-bold font-mono text-xs bg-white border border-[#bfcaba] rounded"
                />
              </div>
            </div>

            <div className="bg-[#dbf1fe] border border-[#bfcaba] p-2.5 rounded text-xs">
              <div className="flex justify-between font-bold text-[#071e27]">
                <span>Valeur Totale Entrée :</span>
                <span className="font-mono text-[#0d631b]">
                  {(qtyReceived * purchasePriceHT).toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>

            <button
              onClick={handleValidateReception}
              className="w-full h-10 bg-[#0d631b] hover:bg-[#2e7d32] text-white rounded font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-98"
            >
              <span>✓</span>
              <span>Enregistrer Réception & Déstockage Fournisseur</span>
            </button>
          </div>
        </div>

        {/* RECEPTION HISTORY TABLE */}
        <div className="flex-1 bg-white border border-[#bfcaba] rounded flex flex-col overflow-hidden shadow-xs">
          <div className="p-3 border-b border-[#bfcaba] bg-[#cfe6f2] flex items-center justify-between">
            <span className="font-bold text-xs uppercase tracking-wider text-[#071e27]">
              Historique des Réceptions Validées ({receptions.length})
            </span>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#e6f6ff] text-[#071e27] font-bold border-b border-[#bfcaba]">
                <tr>
                  <th className="p-2.5">Réf BL</th>
                  <th className="p-2.5">Fournisseur</th>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Articles Réceptionnés</th>
                  <th className="p-2.5 text-right">Montant HT</th>
                  <th className="p-2.5">Réceptionné par</th>
                  <th className="p-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6f6ff]">
                {receptions.map((rec) => (
                  <tr key={rec.id} className="hover:bg-[#f3faff]">
                    <td className="p-2.5 font-mono font-bold text-[#071e27]">
                      {rec.reference}
                      {rec.poNumber && (
                        <div className="text-[10px] text-[#707a6c]">{rec.poNumber}</div>
                      )}
                    </td>
                    <td className="p-2.5 font-medium text-[#071e27]">{rec.supplierName}</td>
                    <td className="p-2.5 font-mono text-[#40493d]">{rec.receptionDate}</td>
                    <td className="p-2.5">
                      {rec.items.map((it, idx) => (
                        <div key={idx} className="text-[11px]">
                          <strong>+{it.quantityReceived}</strong> {it.designation}
                        </div>
                      ))}
                    </td>
                    <td className="p-2.5 text-right font-mono font-bold text-[#0d631b]">
                      {rec.totalHT.toLocaleString('fr-FR')} F
                    </td>
                    <td className="p-2.5 text-[#40493d]">{rec.receivedBy}</td>
                    <td className="p-2.5 text-center">
                      <button
                        onClick={() => {
                          if (rec.items[0]) {
                            setSelectedProductIdForDetail(rec.items[0].productId);
                            setActiveView('STOCK_MOVEMENT_HISTORY');
                          }
                        }}
                        className="px-2 py-1 text-[11px] bg-[#e6f6ff] hover:bg-[#dbf1fe] text-[#0d631b] border border-[#bfcaba] rounded font-semibold"
                      >
                        Voir Fiche F8
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

