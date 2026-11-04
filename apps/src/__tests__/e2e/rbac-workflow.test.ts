import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore, ROLE_AUTHORIZED_VIEWS } from '@/store/useAppStore';
import { canAccessView, hasCapability } from '@/lib/rbac';
import { INITIAL_PRODUCTS } from '@/lib/mockData';

describe("E2E & RBAC Tests: Contrôle d'Accès et Habilitations par Profil", () => {
  beforeEach(() => {
    useAppStore.getState().logout();
  });

  it("interdit l'accès en cas d'identifiants erronés ou inexistants", () => {
    const res = useAppStore.getState().login('inconnu@etam.ci', 'mauvais-mdp');
    expect(res.success).toBe(false);
    expect(useAppStore.getState().isAuthenticated).toBe(false);
    expect(useAppStore.getState().currentUser).toBeNull();
  });

  it('refuse un mot de passe erroné même si le compte existe', () => {
    const result = useAppStore.getState().login('a.toure@etam.ci', 'incorrect');
    expect(result.success).toBe(false);
    expect(useAppStore.getState().currentUser).toBeNull();
  });

  it('isole strictement les droits de la Caisse (CASHIER)', () => {
    useAppStore.getState().loginAsRole('CASHIER');
    const state = useAppStore.getState();

    expect(state.isAuthenticated).toBe(true);
    expect(state.currentUser?.role).toBe('CASHIER');
    expect(state.activeView).toBe('CAISSE');

    const authorized = ROLE_AUTHORIZED_VIEWS['CASHIER'];
    expect(authorized).toEqual(['CAISSE']);
    expect(authorized).not.toContain('ADMIN_USERS');
    expect(authorized).not.toContain('COMMERCIAL');
    expect(authorized).not.toContain('ACCOUNTING_JOURNAL');
    expect(authorized).not.toContain('SUPPLIER_RECEPTION');
    expect(authorized).not.toContain('DG_DASHBOARD');
    expect(hasCapability('CASHIER', 'VALIDATE_SALE')).toBe(true);
    expect(hasCapability('CASHIER', 'CREATE_PROFORMA')).toBe(false);
    expect(hasCapability('CASHIER', 'MANAGE_USERS')).toBe(false);
  });

  it('isole strictement les droits du Commercial (SALES_REP)', () => {
    useAppStore.getState().loginAsRole('SALES_REP');
    const state = useAppStore.getState();

    expect(state.isAuthenticated).toBe(true);
    expect(state.currentUser?.role).toBe('SALES_REP');
    expect(state.activeView).toBe('COMMERCIAL');

    const authorized = ROLE_AUTHORIZED_VIEWS['SALES_REP'];
    expect(authorized).toContain('COMMERCIAL');
    expect(authorized).toContain('STOCK_INVENTORY');
    expect(authorized).not.toContain('CAISSE');
    expect(authorized).not.toContain('ACCOUNTING_JOURNAL');
    expect(authorized).not.toContain('ADMIN_USERS');
    expect(authorized).not.toContain('SUPPLIER_RECEPTION');
    expect(authorized).not.toContain('DG_DASHBOARD');
    expect(hasCapability('SALES_REP', 'CREATE_PROFORMA')).toBe(true);
    expect(hasCapability('SALES_REP', 'VALIDATE_SALE')).toBe(false);
    expect(hasCapability('SALES_REP', 'VALIDATE_OUTPUT_SLIP')).toBe(false);
  });

  it('isole strictement les droits du Gestionnaire de Stock (STOCK_MANAGER)', () => {
    useAppStore.getState().loginAsRole('STOCK_MANAGER');
    const state = useAppStore.getState();

    expect(state.isAuthenticated).toBe(true);
    expect(state.currentUser?.role).toBe('STOCK_MANAGER');
    expect(state.activeView).toBe('STOCK_INVENTORY');

    const authorized = ROLE_AUTHORIZED_VIEWS['STOCK_MANAGER'];
    expect(authorized).toContain('STOCK_INVENTORY');
    expect(authorized).toContain('SUPPLIER_RECEPTION');
    expect(authorized).toContain('STOCK_MOVEMENT_HISTORY');
    expect(authorized).not.toContain('CAISSE');
    expect(authorized).not.toContain('ADMIN_USERS');
    expect(authorized).not.toContain('DG_DASHBOARD');
    expect(authorized).not.toContain('COMMERCIAL');
    expect(hasCapability('STOCK_MANAGER', 'RECORD_RECEPTION')).toBe(true);
    expect(hasCapability('STOCK_MANAGER', 'VALIDATE_SALE')).toBe(false);
  });

  it('isole strictement les droits du Comptable (ACCOUNTANT)', () => {
    useAppStore.getState().loginAsRole('ACCOUNTANT');
    const state = useAppStore.getState();

    expect(state.isAuthenticated).toBe(true);
    expect(state.currentUser?.role).toBe('ACCOUNTANT');
    expect(state.activeView).toBe('ACCOUNTING_JOURNAL');

    const authorized = ROLE_AUTHORIZED_VIEWS['ACCOUNTANT'];
    expect(authorized).toEqual(['ACCOUNTING_JOURNAL']);
    expect(authorized).not.toContain('CAISSE');
    expect(authorized).not.toContain('SUPPLIER_RECEPTION');
    expect(authorized).not.toContain('ADMIN_USERS');
    expect(authorized).not.toContain('COMMERCIAL');
    expect(hasCapability('ACCOUNTANT', 'VIEW_FINANCIALS')).toBe(true);
    expect(hasCapability('ACCOUNTANT', 'VALIDATE_SALE')).toBe(false);
  });

  it('isole la supervision DG des opérations de caisse, stock et administration', () => {
    useAppStore.getState().loginAsRole('DG_SUPERVISOR');
    const authorized = ROLE_AUTHORIZED_VIEWS['DG_SUPERVISOR'];

    expect(authorized).toContain('DG_DASHBOARD');
    expect(authorized).toContain('ACCOUNTING_JOURNAL');
    expect(authorized).toContain('STOCK_INVENTORY');
    expect(authorized).not.toContain('CAISSE');
    expect(authorized).not.toContain('COMMERCIAL');
    expect(authorized).not.toContain('ADMIN_USERS');
    expect(authorized).not.toContain('SUPPLIER_RECEPTION');
    expect(hasCapability('DG_SUPERVISOR', 'CREATE_PROFORMA')).toBe(false);
    expect(hasCapability('DG_SUPERVISOR', 'VALIDATE_SALE')).toBe(false);
    expect(hasCapability('DG_SUPERVISOR', 'MANAGE_USERS')).toBe(false);
  });

  it('accorde au Responsable commercial le suivi des proformas, pas la caisse ni l’admin', () => {
    useAppStore.getState().loginAsRole('SALES_MANAGER');
    const authorized = ROLE_AUTHORIZED_VIEWS['SALES_MANAGER'];

    expect(authorized).toContain('COMMERCIAL');
    expect(authorized).toContain('DG_DASHBOARD');
    expect(authorized).toContain('STOCK_INVENTORY');
    expect(authorized).not.toContain('CAISSE');
    expect(authorized).not.toContain('ADMIN_USERS');
    expect(authorized).not.toContain('SUPPLIER_RECEPTION');
    expect(hasCapability('SALES_MANAGER', 'CREATE_PROFORMA')).toBe(true);
    expect(hasCapability('SALES_MANAGER', 'VALIDATE_SALE')).toBe(false);
  });

  it("accorde à l'Administrateur l'accès complet et la gestion des utilisateurs", () => {
    useAppStore.getState().loginAsRole('ADMIN');
    const state = useAppStore.getState();

    expect(state.isAuthenticated).toBe(true);
    expect(state.currentUser?.role).toBe('ADMIN');
    expect(state.activeView).toBe('ADMIN_USERS');

    const authorized = ROLE_AUTHORIZED_VIEWS['ADMIN'];
    expect(authorized).toHaveLength(8);

    const newUser = useAppStore.getState().addUser({
      name: 'Nouvel Agent Test',
      email: 'test.agent@etam.ci',
      role: 'SALES_REP',
      depotAssignment: 'Comptoir Test',
      isActive: true,
    });

    expect(newUser.id).toBeDefined();
    expect(useAppStore.getState().users.find((u) => u.email === 'test.agent@etam.ci')).toBeDefined();

    useAppStore.getState().toggleUserStatus(newUser.id);
    const deactivatedUser = useAppStore.getState().users.find((u) => u.id === newUser.id);
    expect(deactivatedUser?.isActive).toBe(false);

    useAppStore.getState().logout();
    const loginAttempt = useAppStore.getState().login('test.agent@etam.ci', 'etam2025');
    expect(loginAttempt.success).toBe(false);
    expect(loginAttempt.message).toContain('désactivé');
  });

  it("refuse la navigation vers un module hors périmètre du rôle", () => {
    useAppStore.getState().loginAsRole('CASHIER');
    useAppStore.getState().setActiveView('ADMIN_USERS');
    expect(useAppStore.getState().activeView).toBe('CAISSE');

    useAppStore.getState().setActiveView('COMMERCIAL');
    expect(useAppStore.getState().activeView).toBe('CAISSE');
    expect(canAccessView('CASHIER', 'ADMIN_USERS')).toBe(false);
  });

  it("refuse les actions métier d'un autre rôle", () => {
    useAppStore.getState().loginAsRole('SALES_REP');
    expect(() =>
      useAppStore.getState().validateSale({
        customerId: 'CUST-001',
        customerName: 'Client Test',
        paymentMethod: 'CASH',
        amountReceived: 0,
        changeReturned: 0,
        items: [],
      })
    ).toThrow(/non autorisée|refusée/i);

    expect(() => useAppStore.getState().addUser({
      name: 'Intrus',
      email: 'intrus@etam.ci',
      role: 'ADMIN',
      depotAssignment: 'N/A',
      isActive: true,
    })).toThrow(/non autorisée|refusée/i);

    expect(() =>
      useAppStore.getState().recordSupplierReception({
        reference: 'BL-TEST-RBAC',
        supplierName: 'Test',
        receptionDate: '2026-01-01',
        items: [],
        totalHT: 0,
        receivedBy: 'Intrus',
      })
    ).toThrow(/non autorisée|refusée/i);

    useAppStore.getState().logout();
    useAppStore.getState().loginAsRole('CASHIER');
    expect(() => useAppStore.getState().addToCommercialCart(INITIAL_PRODUCTS[0], 1, 0)).toThrow(/non autorisée|refusée/i);
    expect(() => useAppStore.getState().createProforma()).toThrow(/non autorisée|refusée/i);
  });

  it('protège aussi les modifications du panier et les sélections de caisse', () => {
    useAppStore.getState().logout();
    expect(() => useAppStore.getState().clearCommercialCart()).toThrow(/non autorisée|refusée/i);
    expect(() => useAppStore.getState().setSelectedProformaForCheckout(null)).toThrow(/non autorisée|refusée/i);

    useAppStore.getState().loginAsRole('SALES_REP');
    expect(() => useAppStore.getState().setSelectedProformaForCheckout(null)).toThrow(/non autorisée|refusée/i);
    expect(() => useAppStore.getState().toggleUserStatus('USR-001')).toThrow(/non autorisée|refusée/i);
  });

  it('empêche la désactivation de son propre compte par un administrateur', () => {
    useAppStore.getState().loginAsRole('ADMIN');
    const admin = useAppStore.getState().currentUser!;
    expect(() => useAppStore.getState().toggleUserStatus(admin.id)).toThrow(/propre compte/i);
    expect(useAppStore.getState().currentUser?.isActive).toBe(true);
  });
});
