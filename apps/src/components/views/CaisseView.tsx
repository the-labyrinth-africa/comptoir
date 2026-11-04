'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { PaymentMethod, Proforma } from '@/types';
import { canAccessView } from '@/lib/rbac';

export const CaisseView: React.FC = () => {
  const {
    proformas,
    products,
    selectedProformaForCheckout,
    setSelectedProformaForCheckout,
    validateSale,
    setActiveView,
    currentUser,
  } = useAppStore();
  const canOpenCommercial = canAccessView(currentUser?.role, 'COMMERCIAL');

  const pendingProformas = proformas.filter((p) => p.status === 'PENDING_PAYMENT');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('CASH');
  const [amountReceivedInput, setAmountReceivedInput] = useState<string>('');
  const [saleSuccessMessage, setSaleSuccessMessage] = useState<string | null>(null);

  // Filter proformas
  const filteredProformas = pendingProformas.filter(
    (p) =>
      p.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customerPhone.includes(searchTerm)
  );

  const activeProforma: Proforma | null =
    selectedProformaForCheckout || (filteredProformas.length > 0 ? filteredProformas[0] : null);

  const totalTTC = activeProforma ? activeProforma.totalTTC : 0;
  const totalHT = activeProforma ? activeProforma.totalHT : 0;
  const totalTVA = activeProforma ? activeProforma.totalTVA : 0;
  const discountTotal = activeProforma ? activeProforma.discountTotal : 0;

  const numReceived = parseFloat(amountReceivedInput) || 0;
  const changeDue = Math.max(0, numReceived - totalTTC);

  const handleNumpad = (val: string) => {
    if (val === 'CLEAR') {
      setAmountReceivedInput('');
    } else if (val === 'EXACT') {
      setAmountReceivedInput(totalTTC.toString());
    } else if (val.startsWith('+')) {
      const add = parseInt(val.replace('+', ''), 10);
      setAmountReceivedInput(((parseFloat(amountReceivedInput) || 0) + add).toString());
    } else {
      setAmountReceivedInput((prev) => prev + val);
    }
  };

  const handleCheckout = () => {
    if (!activeProforma) return;

    const amountReceived = numReceived > 0 ? numReceived : totalTTC;
    const change = Math.max(0, amountReceived - totalTTC);

    const invoice = validateSale({
      proformaId: activeProforma.id,
      items: activeProforma.items,
      customerId: activeProforma.customerId,
      customerName: activeProforma.customerName,
      paymentMethod: selectedMethod,
      amountReceived,
      changeReturned: change,
      paymentRef: selectedMethod === 'WAVE' ? 'WAVE-' + Date.now().toString().slice(-6) : undefined,
    });

    setSaleSuccessMessage(
      `Facture ${invoice.reference} émise avec succès ! Stock décrémenté et Bon de Sortie généré.`
    );
    setAmountReceivedInput('');

    setTimeout(() => {
      setSaleSuccessMessage(null);
    }, 5000);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row bg-[#f3faff] overflow-hidden select-none">
      {/* LEFT: Proforma Search & Pending Queue */}
      <div className="w-full lg:w-80 bg-white border-r border-[#bfcaba] flex flex-col shrink-0">
        <div className="p-3 border-b border-[#bfcaba] bg-[#e6f6ff]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-xs uppercase tracking-wider text-[#071e27] flex items-center gap-1.5">
              <span>📋</span> Proformas en Attente ({pendingProformas.length})
            </span>
            {canOpenCommercial && (
              <button
                onClick={() => setActiveView('COMMERCIAL')}
                className="text-[11px] text-[#0d631b] hover:underline font-semibold"
              >
                + Nouveau devis
              </button>
            )}
          </div>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher PF- ou client..."
              className="w-full h-8 pl-8 pr-2 bg-white border border-[#bfcaba] rounded text-xs text-[#071e27] focus:ring-1 focus:ring-[#0d631b] focus:outline-none"
            />
            <span className="absolute left-2.5 top-2 text-xs text-[#707a6c]">🔍</span>
          </div>
        </div>

        {/* List of pending proformas */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#e6f6ff]">
          {filteredProformas.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#707a6c]">
              Aucune proforma en attente de règlement.
            </div>
          ) : (
            filteredProformas.map((p) => {
              const isSelected = activeProforma?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProformaForCheckout(p)}
                  className={`p-3 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#dbf1fe] border-l-4 border-[#0d631b]'
                      : 'hover:bg-[#f3faff]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs font-mono text-[#071e27]">
                      {p.reference}
                    </span>
                    <span className="text-[10px] bg-[#e8f5e9] text-[#2e7d32] border border-[#a5d6a7] px-1.5 py-0.2 rounded font-bold uppercase">
                      Prêt
                    </span>
                  </div>
                  <div className="text-xs font-medium text-[#071e27] truncate">
                    {p.customerName}
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[11px]">
                    <span className="text-[#707a6c]">Par {p.salesRepName}</span>
                    <span className="font-bold text-[#0d631b] font-mono">
                      {p.totalTTC.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* CENTER: Selected Proforma Content & Line Items */}
      <div className="flex-1 flex flex-col overflow-y-auto border-r border-[#bfcaba] bg-white">
        {saleSuccessMessage && (
          <div className="bg-[#2e7d32] text-white p-3 text-xs font-semibold flex items-center justify-between animate-fadeIn">
            <span>✓ {saleSuccessMessage}</span>
            <button
              onClick={() => setSaleSuccessMessage(null)}
              className="text-white hover:text-white/80 font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {activeProforma ? (
          <div className="flex-1 flex flex-col p-4">
            {/* Header banner */}
            <div className="bg-[#e6f6ff] border border-[#bfcaba] rounded p-3 mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[11px] text-[#707a6c] uppercase font-bold tracking-wider">
                  Détail de la Proforma Commerciale
                </div>
                <div className="text-base font-bold font-mono text-[#071e27] flex items-center gap-2">
                  <span>{activeProforma.reference}</span>
                  <span className="text-xs font-normal text-[#40493d]">
                    — Émise le {new Date(activeProforma.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-[#707a6c]">Client bénéficiaire</div>
                <div className="font-bold text-xs text-[#071e27]">
                  {activeProforma.customerName}
                </div>
                <div className="text-[11px] text-[#40493d]">{activeProforma.customerPhone}</div>
              </div>
            </div>

            {/* Articles Table */}
            <div className="border border-[#bfcaba] rounded overflow-hidden mb-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#cfe6f2] text-[#071e27] font-bold border-b border-[#bfcaba]">
                  <tr>
                    <th className="p-2 w-8">#</th>
                    <th className="p-2">Désignation du Matériel Électrique</th>
                    <th className="p-2 text-right">Stock</th>
                    <th className="p-2 text-right">Qté</th>
                    <th className="p-2 text-right">P.U HT</th>
                    <th className="p-2 text-right">Total HT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6f6ff]">
                  {activeProforma.items.map((item, idx) => {
                    const prod = products.find((p) => p.id === item.productId);
                    const stock = prod ? prod.stockPhysical : '-';
                    const hasStockAlert = prod && prod.stockPhysical < item.quantity;

                    return (
                      <tr key={idx} className="hover:bg-[#f3faff]">
                        <td className="p-2 text-[#707a6c] font-mono">{idx + 1}</td>
                        <td className="p-2">
                          <div className="font-semibold text-[#071e27]">{item.designation}</div>
                          <div className="text-[10px] text-[#707a6c] font-mono">{item.sku}</div>
                        </td>
                        <td className="p-2 text-right font-mono">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              hasStockAlert
                                ? 'bg-[#ffdad6] text-[#ba1a1a]'
                                : 'bg-[#e8f5e9] text-[#2e7d32]'
                            }`}
                          >
                            {stock}
                          </span>
                        </td>
                        <td className="p-2 text-right font-bold font-mono text-sm">{item.quantity}</td>
                        <td className="p-2 text-right font-mono">
                          {item.unitPriceHT.toLocaleString('fr-FR')} F
                        </td>
                        <td className="p-2 text-right font-bold font-mono text-[#0d631b]">
                          {item.totalHT.toLocaleString('fr-FR')} F
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="mt-auto bg-[#dbf1fe] border border-[#bfcaba] rounded p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[#40493d] block text-[11px]">Total Brut HT</span>
                <span className="font-bold font-mono text-sm">
                  {totalHT.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              <div>
                <span className="text-[#40493d] block text-[11px]">Remise Accordée</span>
                <span className="font-bold font-mono text-sm text-[#a83900]">
                  -{discountTotal.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              <div>
                <span className="text-[#40493d] block text-[11px]">TVA (18%)</span>
                <span className="font-bold font-mono text-sm">
                  +{totalTVA.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              <div className="bg-[#0d631b] text-white p-2 rounded -m-1 flex flex-col justify-center">
                <span className="text-white/80 block text-[10px] uppercase font-bold tracking-wider">
                  Net à Payer TTC
                </span>
                <span className="font-bold font-mono text-base">
                  {totalTTC.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#707a6c]">
            <span className="text-4xl mb-2">🏷</span>
            <div className="font-bold text-sm text-[#071e27]">Aucune proforma sélectionnée</div>
            <p className="text-xs max-w-sm mt-1">
              Veuillez sélectionner une proforma dans la liste de gauche ou en saisir une nouvelle depuis le module Commercial.
            </p>
          </div>
        )}
      </div>

      {/* RIGHT: Payment Method & Touch Numpad */}
      <div className="w-full lg:w-96 bg-[#f3faff] p-4 flex flex-col shrink-0">
        <div className="font-bold text-xs uppercase tracking-wider text-[#071e27] mb-3 flex items-center justify-between">
          <span>Mode d&apos;Encaissement</span>
          <span className="text-[10px] bg-[#0d631b] text-white px-1.5 py-0.5 rounded font-mono">
            TVA 18% ACTIF
          </span>
        </div>

        {/* Payment Methods Grid */}
        <div className="grid grid-cols-3 gap-1.5 mb-4">
          {[
            { id: 'CASH', label: '💵 Espèces', color: 'hover:border-[#0d631b]' },
            { id: 'WAVE', label: '📱 Wave', color: 'hover:border-[#0099ff]' },
            { id: 'ORANGE_MONEY', label: '🟧 Orange M.', color: 'hover:border-[#ff6600]' },
            { id: 'CHEQUE', label: '📝 Chèque', color: 'hover:border-[#707a6c]' },
            { id: 'CREDIT_CARD', label: '💳 Carte CB', color: 'hover:border-[#707a6c]' },
            { id: 'BANK_TRANSFER', label: '🏦 Virement', color: 'hover:border-[#707a6c]' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMethod(m.id as PaymentMethod)}
              className={`h-11 rounded border text-xs font-semibold flex items-center justify-center transition-all ${
                selectedMethod === m.id
                  ? 'bg-[#0d631b] text-white border-[#0d631b] shadow-xs'
                  : `bg-white text-[#071e27] border-[#bfcaba] ${m.color}`
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Amount Received Input */}
        <div className="bg-white border border-[#bfcaba] rounded p-2.5 mb-3">
          <div className="flex items-center justify-between text-xs text-[#707a6c] mb-1">
            <span>Montant Reçu du Client</span>
            <span className="font-mono text-[11px] font-semibold">
              Reste à payer : {totalTTC.toLocaleString('fr-FR')} F
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={amountReceivedInput}
              onChange={(e) => setAmountReceivedInput(e.target.value)}
              placeholder={totalTTC.toString()}
              className="w-full text-right font-mono font-bold text-lg text-[#071e27] focus:outline-none"
            />
            <span className="font-bold text-xs text-[#707a6c]">FCFA</span>
          </div>
        </div>

        {/* Change due badge */}
        <div className="bg-[#dbf1fe] border border-[#bfcaba] rounded p-2 mb-3 flex items-center justify-between text-xs">
          <span className="font-semibold text-[#071e27]">Monnaie à Rendre :</span>
          <span className="font-bold font-mono text-base text-[#a83900]">
            {changeDue.toLocaleString('fr-FR')} FCFA
          </span>
        </div>

        {/* Quick Touch Numpad */}
        <div className="grid grid-cols-4 gap-1 mb-4 flex-1">
          {['7', '8', '9', '+10000', '4', '5', '6', '+50000', '1', '2', '3', '+100000', '0', '00', 'CLEAR', 'EXACT'].map((btn) => (
            <button
              key={btn}
              onClick={() => handleNumpad(btn)}
              className={`h-10 rounded border font-mono font-bold text-xs flex items-center justify-center active:scale-95 transition-all ${
                btn === 'CLEAR'
                  ? 'bg-[#ffdad6] text-[#ba1a1a] border-[#ffdad6]'
                  : btn === 'EXACT'
                  ? 'bg-[#cbffc2] text-[#005312] border-[#cbffc2]'
                  : btn.startsWith('+')
                  ? 'bg-[#e6f6ff] text-[#0d631b] border-[#bfcaba] text-[10px]'
                  : 'bg-white text-[#071e27] border-[#bfcaba] hover:bg-[#dbf1fe]'
              }`}
            >
              {btn}
            </button>
          ))}
        </div>

        {/* Validate Sale Button */}
        <button
          onClick={handleCheckout}
          disabled={!activeProforma}
          className={`w-full h-12 rounded font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all ${
            activeProforma
              ? 'bg-[#fc6018] hover:bg-[#a83900] text-white active:scale-98 cursor-pointer'
              : 'bg-[#bfcaba] text-[#707a6c] cursor-not-allowed'
          }`}
        >
          <span>✓</span>
          <span>Valider Vente & Sortie Stock (Entrée)</span>
        </button>
      </div>
    </div>
  );
};

