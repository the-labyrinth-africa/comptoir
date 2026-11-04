export type UserRole =
  | 'ADMIN'
  | 'DG_SUPERVISOR'
  | 'SALES_MANAGER'
  | 'SALES_REP'
  | 'CASHIER'
  | 'STOCK_MANAGER'
  | 'ACCOUNTANT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  depotAssignment: string;
  isActive: boolean;
  lastLogin?: string;
  avatarUrl?: string;
}

export type ProductStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  designation: string;
  family: string;
  location: string; // Ex: "Dépôt A / R-04 / Casier B2"
  unitPriceHT: number;
  tvaRate: number; // Ex: 18 pour 18%
  stockPhysical: number;
  stockReserved: number;
  minThreshold: number;
  alertThreshold: number;
  costPriceCMUP: number;
  packageUnit?: string;
  supplier?: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  companyName: string;
  contactName: string;
  phone: string;
  email?: string;
  address?: string;
  nif?: string;
  rccm?: string;
  creditLimit?: number;
}

export interface ProformaItem {
  productId: string;
  sku: string;
  designation: string;
  quantity: number;
  unitPriceHT: number;
  discountPercent: number;
  totalHT: number;
  tvaRate: number;
  totalTTC: number;
}

export type ProformaStatus = 'DRAFT' | 'PENDING_PAYMENT' | 'CONVERTED' | 'EXPIRED';

export interface Proforma {
  id: string;
  reference: string; // Ex: PF-2025-0842
  customerId: string;
  customerName: string;
  customerPhone: string;
  salesRepId: string;
  salesRepName: string;
  items: ProformaItem[];
  totalHT: number;
  discountTotal: number;
  totalTVA: number;
  totalTTC: number;
  status: ProformaStatus;
  notes?: string;
  validUntil: string;
  createdAt: string;
}

export type PaymentMethod =
  | 'CASH'
  | 'WAVE'
  | 'ORANGE_MONEY'
  | 'CHEQUE'
  | 'CREDIT_CARD'
  | 'BANK_TRANSFER';

export interface InvoiceItem {
  productId: string;
  sku: string;
  designation: string;
  quantity: number;
  unitPriceHT: number;
  totalHT: number;
  tvaRate: number;
  totalTTC: number;
}

export interface Invoice {
  id: string;
  reference: string; // Ex: FA-2025-1420
  proformaId?: string;
  proformaRef?: string;
  cashierId: string;
  cashierName: string;
  terminalId: string;
  customerId: string;
  customerName: string;
  items: InvoiceItem[];
  paymentMethod: PaymentMethod;
  amountReceived: number;
  changeReturned: number;
  totalHT: number;
  discountTotal: number;
  totalTVA: number;
  totalTTC: number;
  paymentRef?: string;
  createdAt: string;
}

export type StockMovementType =
  | 'RECEPTION_FOURNISSEUR'
  | 'VENTE_SORTIE'
  | 'RETOUR_CLIENT'
  | 'AJUSTEMENT_INVENTAIRE'
  | 'PERTE';

export interface StockMovement {
  id: string;
  productId: string;
  sku: string;
  designation: string;
  movementType: StockMovementType;
  documentRef: string; // BL-..., FA-..., INV-...
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  unitValue: number;
  operatorId: string;
  operatorName: string;
  location?: string;
  notes?: string;
  createdAt: string;
}

export type OutputSlipStatus = 'EN_ATTENTE' | 'LIVRE';

export interface OutputSlip {
  id: string;
  reference: string; // Ex: BS-2025-1420
  invoiceId: string;
  invoiceRef: string;
  customerName: string;
  status: OutputSlipStatus;
  items: {
    productId: string;
    sku: string;
    designation: string;
    quantity: number;
    location: string;
  }[];
  preparedBy?: string;
  validatedBy?: string;
  createdAt: string;
  validatedAt?: string;
}

export interface SupplierReceptionItem {
  productId: string;
  sku: string;
  designation: string;
  location: string;
  quantityOrdered: number;
  quantityReceived: number;
  gap: number;
  purchasePriceHT: number;
  plannedCMUP: number;
  packageInfo: string;
}

export interface SupplierReception {
  id: string;
  reference: string; // Ex: BL-FOURN-2025-018
  supplierName: string;
  poNumber?: string;
  receptionDate: string;
  items: SupplierReceptionItem[];
  totalHT: number;
  receivedBy: string;
  notes?: string;
  createdAt: string;
}

export interface DailyClosingSummary {
  date: string;
  cashierId: string;
  terminalId: string;
  openingCash: number;
  totalCash: number;
  totalWave: number;
  totalOrangeMoney: number;
  totalCheque: number;
  totalCard: number;
  totalBankTransfer: number;
  totalInvoicedTTC: number;
  totalInvoicedHT: number;
  totalTVA: number;
  invoiceCount: number;
  proformaConvertedCount: number;
}

