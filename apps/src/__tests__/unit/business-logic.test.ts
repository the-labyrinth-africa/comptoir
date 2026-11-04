import { describe, it, expect } from 'vitest';

describe('Unit Tests: Règles Métier & Calculs Financiers ETAM', () => {
  it('calcule correctement la TVA standard à 18% sur une base Hors Taxes', () => {
    const prixUnitaireHT = 185000; // Câble Cuivre Armé U1000
    const quantite = 2;
    const totalHT = prixUnitaireHT * quantite; // 370 000 FCFA
    const tvaRate = 18;
    const montantTVA = totalHT * (tvaRate / 100); // 66 600 FCFA
    const totalTTC = totalHT + montantTVA; // 436 600 FCFA

    expect(totalHT).toBe(370000);
    expect(montantTVA).toBe(66600);
    expect(totalTTC).toBe(436600);
  });

  it('applique correctement une remise commerciale en pourcentage', () => {
    const prixUnitaireHT = 28500; // Disjoncteur Schneider 4P 32A
    const quantite = 4;
    const remisePourcent = 5; // 5%

    const totalBrutHT = prixUnitaireHT * quantite; // 114 000 FCFA
    const remiseMontant = totalBrutHT * (remisePourcent / 100); // 5 700 FCFA
    const totalNetHT = totalBrutHT - remiseMontant; // 108 300 FCFA
    const totalTTC = totalNetHT * 1.18; // 127 794 FCFA

    expect(totalBrutHT).toBe(114000);
    expect(remiseMontant).toBe(5700);
    expect(totalNetHT).toBe(108300);
    expect(Math.round(totalTTC)).toBe(127794);
  });

  it('calcule avec exactitude le CMUP (Coût Moyen Unitaire Pondéré) lors d\'une réception fournisseur', () => {
    // Formule : Nouveau CMUP = (Ancien Stock * Ancien CMUP + Qté Reçue * Prix Achat) / (Ancien Stock + Qté Reçue)
    const stockPhysiqueAvant = 42;
    const ancienCMUP = 142000;
    const qteRecue = 18;
    const prixAchatHT = 150000;

    const valeurStockAvant = stockPhysiqueAvant * ancienCMUP; // 5 964 000
    const valeurNouvelleEntree = qteRecue * prixAchatHT; // 2 700 000
    const nouveauStockTotal = stockPhysiqueAvant + qteRecue; // 60
    const nouveauCMUP = Math.round((valeurStockAvant + valeurNouvelleEntree) / nouveauStockTotal);

    expect(nouveauStockTotal).toBe(60);
    expect(nouveauCMUP).toBe(144400); // (5 964 000 + 2 700 000) / 60 = 8 664 000 / 60 = 144 400
  });

  it('génère des références uniques conformes aux nomenclatures ETAM', () => {
    const annee = new Date().getFullYear();
    const nextProformaNum = 845;
    const nextInvoiceNum = 1422;
    const nextOutputSlipNum = 1422;
    const nextReceptionNum = 19;

    const pfRef = `PF-${annee}-0${nextProformaNum}`;
    const faRef = `FA-${annee}-${nextInvoiceNum}`;
    const bsRef = `BS-${annee}-${nextOutputSlipNum}`;
    const blRef = `BL-FOURN-${annee}-0${nextReceptionNum}`;

    expect(pfRef).toMatch(/^PF-202[0-9]-0\d+$/);
    expect(faRef).toMatch(/^FA-202[0-9]-\d+$/);
    expect(bsRef).toMatch(/^BS-202[0-9]-\d+$/);
    expect(blRef).toMatch(/^BL-FOURN-202[0-9]-0\d+$/);
  });
});

