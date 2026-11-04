import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial ETAM data to MongoDB database "comptoir"...');

  // 1. Seed Users
  const userCount = await prisma.user.count();
  if (userCount === 0) {
    console.log('Inserting default users...');
    await prisma.user.createMany({
      data: [
        {
          name: 'Aminata Touré',
          email: 'a.toure@etam.ci',
          role: 'CASHIER',
          depotAssignment: 'Caisse Principale (Station 01)',
          isActive: true,
        },
        {
          name: 'Kouassi Jean',
          email: 'j.kouassi@etam.ci',
          role: 'SALES_REP',
          depotAssignment: 'Comptoir Commercial (Poste C-02)',
          isActive: true,
        },
        {
          name: 'Koffi Brou',
          email: 'b.koffi@etam.ci',
          role: 'SALES_MANAGER',
          depotAssignment: 'Bureau Commercial',
          isActive: true,
        },
        {
          name: 'N\'Guessan Koffi',
          email: 'k.nguessan@etam.ci',
          role: 'STOCK_MANAGER',
          depotAssignment: 'Dépôt Central A & B',
          isActive: true,
        },
        {
          name: 'Bamba Souleymane',
          email: 's.bamba@etam.ci',
          role: 'DG_SUPERVISOR',
          depotAssignment: 'Direction Générale',
          isActive: true,
        },
        {
          name: 'Traoré Fatou',
          email: 'f.traore@etam.ci',
          role: 'ACCOUNTANT',
          depotAssignment: 'Comptabilité & Finances',
          isActive: true,
        },
        {
          name: 'Modeste Kouassi',
          email: 'admin@etam.ci',
          role: 'ADMIN',
          depotAssignment: 'Administration Système',
          isActive: true,
        },
      ],
    });
  }

  // 2. Seed Products
  const productCount = await prisma.product.count();
  if (productCount === 0) {
    console.log('Inserting default electrical supply products...');
    await prisma.product.createMany({
      data: [
        {
          sku: 'CAB-U1000-3X25',
          barcode: '6181100234561',
          designation: 'Câble Cuivre Armé U1000 R2V 3x25 mm² - Couronne de 50 mètres',
          family: 'Câblerie & Filaire',
          location: 'Dépôt A / R-04 / Casier B2',
          unitPriceHT: 185000,
          tvaRate: 18,
          stockPhysical: 42,
          stockReserved: 4,
          minThreshold: 5,
          alertThreshold: 10,
          costPriceCMUP: 142000,
          packageUnit: 'Couronne 50m',
          supplier: 'Câbleries d\'Abidjan',
        },
        {
          sku: 'DISJ-SCHN-4P32',
          barcode: '3606480087654',
          designation: 'Disjoncteur Modulaire Schneider Acti9 iC60N 4P 32A Courbe C 6kA',
          family: 'Protection & Disjoncteurs',
          location: 'Dépôt A / Rayon 02 / B-14',
          unitPriceHT: 28500,
          tvaRate: 18,
          stockPhysical: 18,
          stockReserved: 2,
          minThreshold: 4,
          alertThreshold: 8,
          costPriceCMUP: 19800,
          packageUnit: 'Unité',
          supplier: 'Schneider Electric CI',
        },
        {
          sku: 'DIFF-SCHN-4P40',
          barcode: '3606480091238',
          designation: 'Interrupteur Différentiel Schneider Acti9 iID 4P 40A 30mA Type AC',
          family: 'Protection & Disjoncteurs',
          location: 'Dépôt A / Rayon 02 / B-16',
          unitPriceHT: 38200,
          tvaRate: 18,
          stockPhysical: 12,
          stockReserved: 0,
          minThreshold: 2,
          alertThreshold: 5,
          costPriceCMUP: 27500,
          packageUnit: 'Unité',
          supplier: 'Schneider Electric CI',
        },
        {
          sku: 'GOUL-LEGR-100X50',
          barcode: '3245060104621',
          designation: 'Goulotte d\'Installation Legrand DLP 100x50 mm - Longueur 2m Blanc',
          family: 'Cheminement & Conduits',
          location: 'Dépôt B / Allée 01 / C-03',
          unitPriceHT: 14500,
          tvaRate: 18,
          stockPhysical: 75,
          stockReserved: 10,
          minThreshold: 10,
          alertThreshold: 20,
          costPriceCMUP: 9800,
          packageUnit: 'Barre 2m',
          supplier: 'Legrand West Africa',
        },
        {
          sku: 'CONT-SCHN-3P25',
          barcode: '3606480456789',
          designation: 'Contacteur TeSys Deca Schneider LC1D25P7 3P AC-3 25A Bobine 230V',
          family: 'Automatismes & Contacteurs',
          location: 'Dépôt A / Rayon 03 / A-08',
          unitPriceHT: 32000,
          tvaRate: 18,
          stockPhysical: 24,
          stockReserved: 0,
          minThreshold: 3,
          alertThreshold: 6,
          costPriceCMUP: 22400,
          packageUnit: 'Unité',
          supplier: 'Schneider Electric CI',
        },
        {
          sku: 'TRANS-IND-400VA',
          barcode: '3245060428901',
          designation: 'Transformateur de Commande et Sécurité Legrand Primaire 230/400V Sec. 24V 400VA',
          family: 'Transformateurs & Énergie',
          location: 'Dépôt A / Rayon 05 / C-01',
          unitPriceHT: 65000,
          tvaRate: 18,
          stockPhysical: 4,
          stockReserved: 1,
          minThreshold: 2,
          alertThreshold: 3,
          costPriceCMUP: 48000,
          packageUnit: 'Unité',
          supplier: 'Legrand West Africa',
        },
        {
          sku: 'VARI-SCHN-ATV320',
          barcode: '3606480789123',
          designation: 'Variateur de Vitesse Schneider Altivar Machine ATV320 1.5kW 2CV 380-500V',
          family: 'Variation & Moteurs',
          location: 'Dépôt A / Rayon 05 / A-02',
          unitPriceHT: 195000,
          tvaRate: 18,
          stockPhysical: 0,
          stockReserved: 0,
          minThreshold: 1,
          alertThreshold: 2,
          costPriceCMUP: 152000,
          packageUnit: 'Unité',
          supplier: 'Schneider Electric CI',
        },
      ],
    });
  }

  // 3. Seed Customers
  const customerCount = await prisma.customer.count();
  if (customerCount === 0) {
    console.log('Inserting default corporate customers...');
    await prisma.customer.createMany({
      data: [
        {
          companyName: 'SOCIÉTÉ IVOIRIENNE D\'ÉLECTRICITÉ (SIE-CI)',
          contactName: 'M. Kouamé Adjoumani',
          phone: '+225 07 08 12 34 56',
          email: 'direction.technique@sie-ci.com',
          address: 'Zone Industrielle de Yopougon, Rue des Métiers, Abidjan',
          nif: '0912489C',
          rccm: 'CI-ABJ-2015-B-11234',
        },
        {
          companyName: 'BTP BATIR CI',
          contactName: 'Ing. Diallo Mamadou',
          phone: '+225 05 44 88 99 00',
          email: 'achats@batir-ci.net',
          address: 'Cocody Deux-Plateaux Vallon, Abidjan',
          nif: '1423891D',
          rccm: 'CI-ABJ-2018-B-08912',
        },
      ],
    });
  }

  console.log('✓ Seeding complete for database "comptoir"!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

