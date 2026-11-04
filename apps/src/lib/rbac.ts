import { UserRole } from '@/types';

export type ActiveView =
  | 'CAISSE'
  | 'COMMERCIAL'
  | 'STOCK_INVENTORY'
  | 'DG_DASHBOARD'
  | 'ADMIN_USERS'
  | 'ACCOUNTING_JOURNAL'
  | 'SUPPLIER_RECEPTION'
  | 'STOCK_MOVEMENT_HISTORY';

export type RoleCapability =
  | 'CREATE_PROFORMA'
  | 'VALIDATE_SALE'
  | 'VALIDATE_OUTPUT_SLIP'
  | 'RECORD_RECEPTION'
  | 'MANAGE_USERS'
  | 'VIEW_FINANCIALS';

/**
 * Modules autorisés par rôle — alignés sur le document de cadrage ETAM.
 * L'administrateur conserve un accès de support à tous les modules.
 */
export const ROLE_AUTHORIZED_VIEWS: Record<UserRole, ActiveView[]> = {
  ADMIN: [
    'ADMIN_USERS',
    'DG_DASHBOARD',
    'CAISSE',
    'COMMERCIAL',
    'STOCK_INVENTORY',
    'SUPPLIER_RECEPTION',
    'STOCK_MOVEMENT_HISTORY',
    'ACCOUNTING_JOURNAL',
  ],
  DG_SUPERVISOR: ['DG_DASHBOARD', 'ACCOUNTING_JOURNAL', 'STOCK_INVENTORY'],
  SALES_MANAGER: ['COMMERCIAL', 'DG_DASHBOARD', 'STOCK_INVENTORY'],
  SALES_REP: ['COMMERCIAL', 'STOCK_INVENTORY'],
  CASHIER: ['CAISSE'],
  STOCK_MANAGER: ['STOCK_INVENTORY', 'SUPPLIER_RECEPTION', 'STOCK_MOVEMENT_HISTORY'],
  ACCOUNTANT: ['ACCOUNTING_JOURNAL'],
};

export const ROLE_DEFAULT_VIEW: Record<UserRole, ActiveView> = {
  ADMIN: 'ADMIN_USERS',
  DG_SUPERVISOR: 'DG_DASHBOARD',
  SALES_MANAGER: 'COMMERCIAL',
  SALES_REP: 'COMMERCIAL',
  CASHIER: 'CAISSE',
  STOCK_MANAGER: 'STOCK_INVENTORY',
  ACCOUNTANT: 'ACCOUNTING_JOURNAL',
};

export const ROLE_CAPABILITIES: Record<UserRole, RoleCapability[]> = {
  ADMIN: [
    'CREATE_PROFORMA',
    'VALIDATE_SALE',
    'VALIDATE_OUTPUT_SLIP',
    'RECORD_RECEPTION',
    'MANAGE_USERS',
    'VIEW_FINANCIALS',
  ],
  DG_SUPERVISOR: ['VIEW_FINANCIALS'],
  SALES_MANAGER: ['CREATE_PROFORMA', 'VIEW_FINANCIALS'],
  SALES_REP: ['CREATE_PROFORMA'],
  CASHIER: ['VALIDATE_SALE', 'VIEW_FINANCIALS'],
  STOCK_MANAGER: ['VALIDATE_OUTPUT_SLIP', 'RECORD_RECEPTION'],
  ACCOUNTANT: ['VIEW_FINANCIALS'],
};

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrateur système',
  DG_SUPERVISOR: 'DG / Superviseur général',
  SALES_MANAGER: 'Responsable commercial',
  SALES_REP: 'Commercial',
  CASHIER: 'Caisse',
  STOCK_MANAGER: 'Gestionnaire de stock',
  ACCOUNTANT: 'Comptable',
};

export function canAccessView(role: UserRole | undefined | null, view: ActiveView): boolean {
  if (!role) return false;
  return ROLE_AUTHORIZED_VIEWS[role]?.includes(view) ?? false;
}

export function hasCapability(
  role: UserRole | undefined | null,
  capability: RoleCapability
): boolean {
  if (!role) return false;
  return ROLE_CAPABILITIES[role]?.includes(capability) ?? false;
}

export function unauthorizedActionMessage(action: string): string {
  return `Action refusée : « ${action} » n'est pas autorisée pour ce profil.`;
}
