import { create } from 'zustand';
import {
  User,
  Product,
  Customer,
  Proforma,
  Invoice,
  StockMovement,
  OutputSlip,
  SupplierReception,
  PaymentMethod,
  UserRole,
} from '@/types';
import {
  INITIAL_USERS,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_PROFORMAS,
  INITIAL_INVOICES,
  INITIAL_OUTPUT_SLIPS,
  INITIAL_MOVEMENTS,
  INITIAL_RECEPTIONS,
} from '@/lib/mockData';
import {
  ActiveView,
  ROLE_DEFAULT_VIEW,
  canAccessView,
  hasCapability,
  unauthorizedActionMessage,
} from '@/lib/rbac';

export type { ActiveView } from '@/lib/rbac';
export {
  ROLE_AUTHORIZED_VIEWS,
  ROLE_DEFAULT_VIEW,
  ROLE_CAPABILITIES,
  canAccessView,
  hasCapability,
} from '@/lib/rbac';

interface CartItem {
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

interface AppState {
  // Authentication & Session
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (email: string, password?: string) => { success: boolean; message?: string };
  loginAsRole: (role: UserRole) => void;
  logout: () => void;

  // Navigation
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  selectedProductIdForDetail: string;
  setSelectedProductIdForDetail: (id: string) => void;

  // Global Quick Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Data Collections
  users: User[];
  products: Product[];
  customers: Customer[];
  proformas: Proforma[];
  invoices: Invoice[];
  outputSlips: OutputSlip[];
  movements: StockMovement[];
  receptions: SupplierReception[];

  // Commercial Cart
  commercialCart: CartItem[];
  selectedCustomerId: string;
  setSelectedCustomerId: (id: string) => void;
  addToCommercialCart: (product: Product, quantity?: number, discountPercent?: number) => void;
  removeFromCommercialCart: (productId: string) => void;
  updateCommercialCartItem: (productId: string, quantity: number, discountPercent: number) => void;
  clearCommercialCart: () => void;
  createProforma: (notes?: string) => Proforma;

  // POS / Caisse Actions
  selectedProformaForCheckout: Proforma | null;
  setSelectedProformaForCheckout: (proforma: Proforma | null) => void;
  validateSale: (params: {
    proformaId?: string;
    items?: CartItem[];
    customerId: string;
    customerName: string;
    paymentMethod: PaymentMethod;
    amountReceived: number;
    changeReturned: number;
    paymentRef?: string;
  }) => Invoice;

  // Stock Management Actions
  validateOutputSlip: (slipId: string) => void;
  recordSupplierReception: (reception: Omit<SupplierReception, 'id' | 'createdAt'>) => void;
  toggleUserStatus: (userId: string) => void;
  addUser: (user: Omit<User, 'id'>) => User;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Authentication & Session (default to not authenticated)
  isAuthenticated: false,
  currentUser: null,

  login: (email: string, password?: string) => {
    if (password !== 'etam2025') {
      return { success: false, message: 'Identifiant ou mot de passe incorrect.' };
    }
    const user = get().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return { success: false, message: 'Identifiant introuvable ou compte inexistant.' };
    }
    if (!user.isActive) {
      return { success: false, message: 'Ce compte utilisateur a été désactivé par l\'administrateur.' };
    }

    const defaultView = ROLE_DEFAULT_VIEW[user.role] || 'CAISSE';
    set({
      isAuthenticated: true,
      currentUser: user,
      activeView: defaultView,
    });
    return { success: true };
  },

  loginAsRole: (role: UserRole) => {
    const user = get().users.find((u) => u.role === role && u.isActive);
    if (user) {
      const defaultView = ROLE_DEFAULT_VIEW[user.role] || 'CAISSE';
      set({
        isAuthenticated: true,
        currentUser: user,
        activeView: defaultView,
      });
    }
  },

  logout: () => {
    set({
      isAuthenticated: false,
      currentUser: null,
      activeView: 'CAISSE',
    });
  },

  // Navigation — never open a module the current role cannot use
  activeView: 'CAISSE',
  setActiveView: (view) => {
    const role = get().currentUser?.role;
    if (!canAccessView(role, view)) {
      return;
    }
    set({ activeView: view });
  },
  selectedProductIdForDetail: INITIAL_PRODUCTS[0].id,
  setSelectedProductIdForDetail: (id) => {
    if (!get().isAuthenticated) return;
    set({ selectedProductIdForDetail: id });
  },

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Data
  users: INITIAL_USERS,
  products: INITIAL_PRODUCTS,
  customers: INITIAL_CUSTOMERS,
  proformas: INITIAL_PROFORMAS,
  invoices: INITIAL_INVOICES,
  outputSlips: INITIAL_OUTPUT_SLIPS,
  movements: INITIAL_MOVEMENTS,
  receptions: INITIAL_RECEPTIONS,

  // Commercial Cart
  commercialCart: [
    {
      productId: INITIAL_PRODUCTS[0].id,
      sku: INITIAL_PRODUCTS[0].sku,
      designation: INITIAL_PRODUCTS[0].designation,
      quantity: 2,
      unitPriceHT: INITIAL_PRODUCTS[0].unitPriceHT,
      discountPercent: 5,
      totalHT: 351500,
      tvaRate: 18,
      totalTTC: 414770,
    },
  ],
  selectedCustomerId: INITIAL_CUSTOMERS[0].id,
  setSelectedCustomerId: (id) => {
    if (!hasCapability(get().currentUser?.role, 'CREATE_PROFORMA')) {
      throw new Error(unauthorizedActionMessage('sélection de client'));
    }
    if (get().customers.some((customer) => customer.id === id)) set({ selectedCustomerId: id });
  },

  addToCommercialCart: (product, quantity = 1, discountPercent = 0) => {
    if (!hasCapability(get().currentUser?.role, 'CREATE_PROFORMA')) {
      throw new Error(unauthorizedActionMessage('ajout au panier commercial'));
    }
    if (!Number.isInteger(quantity) || quantity <= 0 || !Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 100) {
      throw new Error('Quantité ou remise invalide.');
    }
    const { commercialCart } = get();
    const currentProduct = get().products.find((item) => item.id === product.id);
    if (!currentProduct) throw new Error('Produit introuvable.');
    product = currentProduct;
    const existingIndex = commercialCart.findIndex((item) => item.productId === product.id);

    if (existingIndex > -1) {
      const updated = [...commercialCart];
      const newQty = updated[existingIndex].quantity + quantity;
      const totalHT = newQty * product.unitPriceHT * (1 - discountPercent / 100);
      const totalTTC = totalHT * (1 + product.tvaRate / 100);

      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: newQty,
        discountPercent,
        totalHT,
        totalTTC,
      };
      set({ commercialCart: updated });
    } else {
      const totalHT = quantity * product.unitPriceHT * (1 - discountPercent / 100);
      const totalTTC = totalHT * (1 + product.tvaRate / 100);

      set({
        commercialCart: [
          ...commercialCart,
          {
            productId: product.id,
            sku: product.sku,
            designation: product.designation,
            quantity,
            unitPriceHT: product.unitPriceHT,
            discountPercent,
            totalHT,
            tvaRate: product.tvaRate,
            totalTTC,
          },
        ],
      });
    }
  },

  removeFromCommercialCart: (productId) => {
    if (!hasCapability(get().currentUser?.role, 'CREATE_PROFORMA')) {
      throw new Error(unauthorizedActionMessage('modification du panier commercial'));
    }
    set({
      commercialCart: get().commercialCart.filter((item) => item.productId !== productId),
    });
  },

  updateCommercialCartItem: (productId, quantity, discountPercent) => {
    if (!hasCapability(get().currentUser?.role, 'CREATE_PROFORMA')) {
      throw new Error(unauthorizedActionMessage('modification du panier commercial'));
    }
    if (!Number.isInteger(quantity) || quantity <= 0 || !Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 100) {
      throw new Error('Quantité ou remise invalide.');
    }
    const updated = get().commercialCart.map((item) => {
      if (item.productId === productId) {
        const totalHT = quantity * item.unitPriceHT * (1 - discountPercent / 100);
        const totalTTC = totalHT * (1 + item.tvaRate / 100);
        return { ...item, quantity, discountPercent, totalHT, totalTTC };
      }
      return item;
    });
    set({ commercialCart: updated });
  },

  clearCommercialCart: () => {
    if (!hasCapability(get().currentUser?.role, 'CREATE_PROFORMA')) {
      throw new Error(unauthorizedActionMessage('vidage du panier commercial'));
    }
    set({ commercialCart: [] });
  },

  createProforma: (notes) => {
    const { commercialCart, selectedCustomerId, customers, currentUser, proformas } = get();
    if (!hasCapability(currentUser?.role, 'CREATE_PROFORMA')) {
      throw new Error(unauthorizedActionMessage('création de proforma'));
    }
    if (commercialCart.length === 0) throw new Error('Le panier proforma est vide.');
    const customer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

    const totalHT = commercialCart.reduce((sum, item) => sum + item.totalHT, 0);
    const totalTTC = commercialCart.reduce((sum, item) => sum + item.totalTTC, 0);
    const totalTVA = totalTTC - totalHT;
    const discountTotal = commercialCart.reduce(
      (sum, item) => sum + (item.unitPriceHT * item.quantity - item.totalHT),
      0
    );

    const nextNumber = proformas.length + 844;
    const newProforma: Proforma = {
      id: `PF-${Date.now()}`,
      reference: `PF-2025-0${nextNumber}`,
      customerId: customer.id,
      customerName: customer.companyName,
      customerPhone: customer.phone,
      salesRepId: currentUser?.id || 'USR-002',
      salesRepName: currentUser?.name || 'Commercial',
      items: [...commercialCart],
      totalHT,
      discountTotal,
      totalTVA,
      totalTTC,
      status: 'PENDING_PAYMENT',
      notes: notes || 'Proforma valable 15 jours. Matériel garanti conforme aux normes industrielles.',
      validUntil: new Date(Date.now() + 15 * 86400000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    set({
      proformas: [newProforma, ...proformas],
      commercialCart: [],
    });

    return newProforma;
  },

  // Caisse
  selectedProformaForCheckout: INITIAL_PROFORMAS[0],
  setSelectedProformaForCheckout: (proforma) => {
    if (!hasCapability(get().currentUser?.role, 'VALIDATE_SALE')) {
      throw new Error(unauthorizedActionMessage('sélection de proforma pour encaissement'));
    }
    const stored = proforma && get().proformas.find((item) => item.id === proforma.id && item.status === 'PENDING_PAYMENT');
    set({ selectedProformaForCheckout: stored || null });
  },

  validateSale: ({
    proformaId,
    items,
    customerId,
    customerName,
    paymentMethod,
    amountReceived,
    changeReturned,
    paymentRef,
  }) => {
    const {
      proformas,
      products,
      invoices,
      movements,
      outputSlips,
      currentUser,
    } = get();

    if (!hasCapability(currentUser?.role, 'VALIDATE_SALE')) {
      throw new Error(unauthorizedActionMessage('validation de vente / encaissement'));
    }

    const sourceProforma = proformaId ? proformas.find((p) => p.id === proformaId) : undefined;
    if (proformaId && (!sourceProforma || sourceProforma.status !== 'PENDING_PAYMENT')) {
      throw new Error('Cette proforma est introuvable ou a déjà été traitée.');
    }
    const saleItems = sourceProforma ? sourceProforma.items : items || [];
    if (saleItems.length === 0) throw new Error('Une vente doit contenir au moins un produit.');
    if (new Set(saleItems.map((item) => item.productId)).size !== saleItems.length) {
      throw new Error('Un produit ne peut apparaître qu’une fois dans une vente.');
    }
    for (const item of saleItems) {
      const product = products.find((candidate) => candidate.id === item.productId);
      if (!product) throw new Error(`Produit introuvable : ${item.designation}.`);
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) throw new Error('Quantité de vente invalide.');
      if (item.quantity > product.stockPhysical) throw new Error(`Stock insuffisant pour ${product.designation}.`);
    }
    const totalHT = saleItems.reduce((acc, item) => acc + item.totalHT, 0);
    const totalTTC = saleItems.reduce((acc, item) => acc + item.totalTTC, 0);
    const totalTVA = totalTTC - totalHT;
    if (!Number.isFinite(amountReceived) || amountReceived < totalTTC || changeReturned !== amountReceived - totalTTC) {
      throw new Error('Le montant reçu ou la monnaie rendue est invalide.');
    }

    const nextInvoiceNum = invoices.length + 1421;
    const invoiceRef = `FA-2025-${nextInvoiceNum}`;
    const outputSlipRef = `BS-2025-${nextInvoiceNum}`;

    // 1. Create Invoice
    const newInvoice: Invoice = {
      id: `INV-${Date.now()}`,
      reference: invoiceRef,
      proformaId,
      proformaRef: proformaId ? proformas.find((p) => p.id === proformaId)?.reference : undefined,
      cashierId: currentUser?.id || 'USR-001',
      cashierName: currentUser?.name || 'Caissier',
      terminalId: 'Station POS-01',
      customerId,
      customerName,
      items: saleItems.map((item) => ({
        productId: item.productId,
        sku: item.sku,
        designation: item.designation,
        quantity: item.quantity,
        unitPriceHT: item.unitPriceHT,
        totalHT: item.totalHT,
        tvaRate: item.tvaRate,
        totalTTC: item.totalTTC,
      })),
      paymentMethod,
      amountReceived,
      changeReturned,
      totalHT,
      discountTotal: 0,
      totalTVA,
      totalTTC,
      paymentRef,
      createdAt: new Date().toISOString(),
    };

    // 2. Decrement Stock & create Movements
    const newMovements: StockMovement[] = [];
    const updatedProducts = products.map((prod) => {
      const soldItem = saleItems.find((it) => it.productId === prod.id);
      if (soldItem) {
        const newStock = prod.stockPhysical - soldItem.quantity;
        newMovements.push({
          id: `MVT-${Date.now()}-${prod.id}`,
          productId: prod.id,
          sku: prod.sku,
          designation: prod.designation,
          movementType: 'VENTE_SORTIE',
          documentRef: invoiceRef,
          quantity: -soldItem.quantity,
          stockBefore: prod.stockPhysical,
          stockAfter: newStock,
          unitValue: prod.unitPriceHT,
          operatorId: currentUser?.id || 'USR-001',
          operatorName: currentUser?.name || 'Caissier',
          location: prod.location,
          notes: `Vente caisse / Réf: ${invoiceRef}`,
          createdAt: new Date().toISOString(),
        });
        return {
          ...prod,
          stockPhysical: newStock,
          updatedAt: new Date().toISOString(),
        };
      }
      return prod;
    });

    // 3. Create Output Slip
    const newOutputSlip: OutputSlip = {
      id: `BS-${Date.now()}`,
      reference: outputSlipRef,
      invoiceId: newInvoice.id,
      invoiceRef: newInvoice.reference,
      customerName,
      status: 'EN_ATTENTE',
      items: saleItems.map((it) => {
        const p = products.find((pr) => pr.id === it.productId);
        return {
          productId: it.productId,
          sku: it.sku,
          designation: it.designation,
          quantity: it.quantity,
          location: p ? p.location : 'Dépôt Central',
        };
      }),
      preparedBy: currentUser?.name || 'Magasinier',
      createdAt: new Date().toISOString(),
    };

    // 4. Update Proforma Status if applicable
    const updatedProformas = proformaId
      ? proformas.map((pf) =>
          pf.id === proformaId ? { ...pf, status: 'CONVERTED' as const } : pf
        )
      : proformas;

    set({
      invoices: [newInvoice, ...invoices],
      products: updatedProducts,
      movements: [...newMovements, ...movements],
      outputSlips: [newOutputSlip, ...outputSlips],
      proformas: updatedProformas,
      selectedProformaForCheckout: null,
    });

    return newInvoice;
  },

  validateOutputSlip: (slipId) => {
    const { outputSlips, currentUser } = get();
    if (!hasCapability(currentUser?.role, 'VALIDATE_OUTPUT_SLIP')) {
      throw new Error(unauthorizedActionMessage('validation de bon de sortie'));
    }
    set({
      outputSlips: outputSlips.map((slip) =>
        slip.id === slipId
          ? {
              ...slip,
              status: 'LIVRE',
              validatedBy: currentUser?.name || 'Magasinier',
              validatedAt: new Date().toISOString(),
            }
          : slip
      ),
    });
  },

  recordSupplierReception: (receptionData) => {
    const { receptions, products, movements, currentUser } = get();
    if (!hasCapability(currentUser?.role, 'RECORD_RECEPTION')) {
      throw new Error(unauthorizedActionMessage('réception fournisseur'));
    }
    const receptionRef = receptionData.reference || `BL-FOURN-2025-0${receptions.length + 19}`;

    const newReception: SupplierReception = {
      ...receptionData,
      id: `REC-${Date.now()}`,
      reference: receptionRef,
      createdAt: new Date().toISOString(),
    };

    const newMovements: StockMovement[] = [];
    const updatedProducts = products.map((prod) => {
      const recItem = receptionData.items.find((it) => it.productId === prod.id || it.sku === prod.sku);
      if (recItem && recItem.quantityReceived > 0) {
        const newStock = prod.stockPhysical + recItem.quantityReceived;
        const previousTotalCost = prod.stockPhysical * prod.costPriceCMUP;
        const newInflowCost = recItem.quantityReceived * recItem.purchasePriceHT;
        const newCMUP = Math.round((previousTotalCost + newInflowCost) / newStock);

        newMovements.push({
          id: `MVT-${Date.now()}-${prod.id}`,
          productId: prod.id,
          sku: prod.sku,
          designation: prod.designation,
          movementType: 'RECEPTION_FOURNISSEUR',
          documentRef: receptionRef,
          quantity: recItem.quantityReceived,
          stockBefore: prod.stockPhysical,
          stockAfter: newStock,
          unitValue: recItem.purchasePriceHT,
          operatorId: currentUser?.id || 'USR-004',
          operatorName: currentUser?.name || 'Gestionnaire Stock',
          location: prod.location,
          notes: `Réception fournisseur ${receptionData.supplierName}`,
          createdAt: new Date().toISOString(),
        });

        return {
          ...prod,
          stockPhysical: newStock,
          costPriceCMUP: newCMUP,
          updatedAt: new Date().toISOString(),
        };
      }
      return prod;
    });

    set({
      receptions: [newReception, ...receptions],
      products: updatedProducts,
      movements: [...newMovements, ...movements],
    });
  },

  toggleUserStatus: (userId) => {
    const { currentUser, users } = get();
    if (!hasCapability(currentUser?.role, 'MANAGE_USERS')) {
      throw new Error(unauthorizedActionMessage('gestion des comptes utilisateurs'));
    }
    if (userId === currentUser?.id) throw new Error('Vous ne pouvez pas désactiver votre propre compte.');
    if (!users.some((user) => user.id === userId)) throw new Error('Utilisateur introuvable.');
    set({
      users: get().users.map((u) =>
        u.id === userId ? { ...u, isActive: !u.isActive } : u
      ),
    });
  },

  addUser: (userData) => {
    if (!hasCapability(get().currentUser?.role, 'MANAGE_USERS')) {
      throw new Error(unauthorizedActionMessage('création de compte utilisateur'));
    }
    if (!userData.name.trim() || !userData.email.trim() || get().users.some((user) => user.email.toLowerCase() === userData.email.trim().toLowerCase())) {
      throw new Error('Nom ou email invalide, ou email déjà utilisé.');
    }
    const newUser: User = {
      ...userData,
      id: `USR-${Date.now().toString().slice(-3)}`,
      lastLogin: 'Jamais connecté',
    };
    set({ users: [...get().users, newUser] });
    return newUser;
  },
}));
