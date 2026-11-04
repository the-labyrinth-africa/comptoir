import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '@/store/useAppStore';

describe('Integration Tests: Cycle Commercial & Mouvements de Stock de Bout en Bout', () => {
  beforeEach(() => {
    // Reset store state
    useAppStore.setState({
      commercialCart: [],
      selectedCustomerId: 'CUST-001',
    });
  });

  it('exécute avec intégrité le cycle complet : Panier -> Devis Proforma -> Encaissement Caisse -> Décrémentation Stock -> Bon de Sortie', () => {
    useAppStore.getState().loginAsRole('SALES_REP');
    const store = useAppStore.getState();
    const product = store.products.find((p) => p.sku === 'CAB-U1000-3X25')!;
    const initialStock = product.stockPhysical; // 42

    // 1. Étape Commerciale : Ajout au panier et création du Devis Proforma
    store.addToCommercialCart(product, 2, 5); // 2 unités avec 5% remise
    const cart = useAppStore.getState().commercialCart;
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(2);
    expect(cart[0].totalHT).toBe(351500);

    const proforma = useAppStore.getState().createProforma('Test Devis Client SIE-CI');
    expect(proforma.reference).toMatch(/^PF-2025-/);
    expect(proforma.status).toBe('PENDING_PAYMENT');
    expect(proforma.totalHT).toBe(351500);
    expect(proforma.totalTTC).toBe(414770);

    // 2. Étape Caisse : Encaissement de la proforma
    useAppStore.getState().loginAsRole('CASHIER');
    const invoice = useAppStore.getState().validateSale({
      proformaId: proforma.id,
      customerId: proforma.customerId,
      customerName: proforma.customerName,
      paymentMethod: 'WAVE',
      amountReceived: 414770,
      changeReturned: 0,
      paymentRef: 'WAVE-TX-TEST-001',
    });

    expect(invoice.reference).toMatch(/^FA-2025-/);
    expect(invoice.paymentMethod).toBe('WAVE');
    expect(invoice.totalTTC).toBe(414770);

    // 3. Vérification de l'état de la proforma
    const updatedProforma = useAppStore.getState().proformas.find((p) => p.id === proforma.id);
    expect(updatedProforma?.status).toBe('CONVERTED');

    // 4. Vérification de la décrémentation atomique du stock physique
    const updatedProduct = useAppStore.getState().products.find((p) => p.id === product.id)!;
    expect(updatedProduct.stockPhysical).toBe(initialStock - 2); // 42 - 2 = 40

    // 5. Vérification du mouvement de stock inaltérable enregistré
    const movement = useAppStore.getState().movements.find(
      (m) => m.productId === product.id && m.documentRef === invoice.reference
    );
    expect(movement).toBeDefined();
    expect(movement?.movementType).toBe('VENTE_SORTIE');
    expect(movement?.quantity).toBe(-2);
    expect(movement?.stockBefore).toBe(initialStock);
    expect(movement?.stockAfter).toBe(initialStock - 2);

    // 6. Vérification de la génération du Bon de Sortie pour le magasinier
    const outputSlip = useAppStore.getState().outputSlips.find(
      (s) => s.invoiceId === invoice.id || s.invoiceRef === invoice.reference
    );
    expect(outputSlip).toBeDefined();
    expect(outputSlip?.status).toBe('EN_ATTENTE');
    expect(outputSlip?.items[0].quantity).toBe(2);

    // 7. Validation physique par le magasinier
    useAppStore.getState().loginAsRole('STOCK_MANAGER');
    useAppStore.getState().validateOutputSlip(outputSlip!.id);
    const validatedSlip = useAppStore.getState().outputSlips.find((s) => s.id === outputSlip!.id);
    expect(validatedSlip?.status).toBe('LIVRE');
    expect(validatedSlip?.validatedAt).toBeDefined();
  });

  it('enregistre une réception fournisseur, incrémente le stock et recalcule le CMUP', () => {
    useAppStore.getState().loginAsRole('STOCK_MANAGER');
    const store = useAppStore.getState();
    const product = store.products.find((p) => p.sku === 'DISJ-SCHN-4P32')!;
    const stockAvant = product.stockPhysical; // 18
    const cmupAvant = product.costPriceCMUP; // 19 800

    const qteEntree = 12;
    const prixAchatHT = 20500;

    useAppStore.getState().recordSupplierReception({
      reference: 'BL-TEST-2025-999',
      supplierName: 'Schneider Electric Côte d\'Ivoire',
      receptionDate: '2025-05-14',
      items: [
        {
          productId: product.id,
          sku: product.sku,
          designation: product.designation,
          location: product.location,
          quantityOrdered: qteEntree,
          quantityReceived: qteEntree,
          gap: 0,
          purchasePriceHT: prixAchatHT,
          plannedCMUP: 20080,
          packageInfo: 'Carton scellé usine',
        },
      ],
      totalHT: qteEntree * prixAchatHT,
      receivedBy: 'Gestionnaire Stock Test',
    });

    const updatedProduct = useAppStore.getState().products.find((p) => p.id === product.id)!;
    expect(updatedProduct.stockPhysical).toBe(stockAvant + qteEntree); // 18 + 12 = 30

    // Vérification du nouveau CMUP
    const expectedCMUP = Math.round(
      (stockAvant * cmupAvant + qteEntree * prixAchatHT) / (stockAvant + qteEntree)
    );
    expect(updatedProduct.costPriceCMUP).toBe(expectedCMUP);

    // Vérification du mouvement d'entrée
    const receptionMvt = useAppStore.getState().movements.find(
      (m) => m.documentRef === 'BL-TEST-2025-999'
    );
    expect(receptionMvt).toBeDefined();
    expect(receptionMvt?.movementType).toBe('RECEPTION_FOURNISSEUR');
    expect(receptionMvt?.quantity).toBe(qteEntree);
  });
});

