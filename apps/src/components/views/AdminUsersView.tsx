'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { UserRole } from '@/types';

export const AdminUsersView: React.FC = () => {
  const { users, toggleUserStatus, addUser } = useAppStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('SALES_REP');
  const [depot, setDepot] = useState('Comptoir Commercial (Poste C-03)');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    addUser({
      name,
      email,
      role,
      depotAssignment: depot,
      isActive: true,
    });

    setName('');
    setEmail('');
    setIsModalOpen(false);
  };

  const permissionsMatrix: {
    capability: string;
    admin: boolean;
    dg: boolean;
    respCommercial: boolean;
    commercial: boolean;
    caisse: boolean;
    stock: boolean;
    comptable: boolean;
  }[] = [
    { capability: 'Consultation Catalogue & Stock', admin: true, dg: true, respCommercial: true, commercial: true, caisse: false, stock: true, comptable: false },
    { capability: 'Création Devis Proforma (PF-)', admin: true, dg: false, respCommercial: true, commercial: true, caisse: false, stock: false, comptable: false },
    { capability: 'Validation Encaissement & Facturation (FA-)', admin: true, dg: false, respCommercial: false, commercial: false, caisse: true, stock: false, comptable: false },
    { capability: 'Réception Fournisseur & Entrée Stock (BL-)', admin: true, dg: false, respCommercial: false, commercial: false, caisse: false, stock: true, comptable: false },
    { capability: 'Validation Sortie Physique (Bon BS-)', admin: true, dg: false, respCommercial: false, commercial: false, caisse: false, stock: true, comptable: false },
    { capability: 'Journal Comptable & Factures de Vente', admin: true, dg: true, respCommercial: false, commercial: false, caisse: false, stock: false, comptable: true },
    { capability: 'Tableaux de Bord Décisionnels DG', admin: true, dg: true, respCommercial: true, commercial: false, caisse: false, stock: false, comptable: false },
    { capability: 'Administration Système & Rôles', admin: true, dg: false, respCommercial: false, commercial: false, caisse: false, stock: false, comptable: false },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#f3faff] overflow-y-auto select-none p-4 gap-4">
      {/* HEADER */}
      <div className="bg-white border border-[#bfcaba] rounded p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#707a6c] tracking-wider">
            Sécurité & Contrôle d&apos;Accès (RBAC)
          </span>
          <h1 className="text-lg font-bold text-[#071e27] flex items-center gap-2">
            <span>👥 Gestion des Utilisateurs & Droits d&apos;Accès</span>
            <span className="text-xs bg-[#e6f6ff] text-[#0d631b] border border-[#bfcaba] px-2 py-0.5 rounded font-mono">
              7 Rôles Métier
            </span>
          </h1>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="h-9 px-4 bg-[#0d631b] hover:bg-[#2e7d32] text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
        >
          <span>+</span>
          <span>Créer un Utilisateur [F1]</span>
        </button>
      </div>

      {/* USERS TABLE */}
      <div className="bg-white border border-[#bfcaba] rounded overflow-hidden shadow-xs">
        <div className="p-3 bg-[#cfe6f2] border-b border-[#bfcaba] flex items-center justify-between">
          <span className="font-bold text-xs uppercase tracking-wider text-[#071e27]">
            Comptes Utilisateurs Actifs & Historisés ({users.length})
          </span>
          <span className="text-[11px] text-[#707a6c]">
            Règle de cadrage : la désactivation préserve l&apos;historique inaltérable
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#e6f6ff] text-[#071e27] font-bold border-b border-[#bfcaba]">
              <tr>
                <th className="p-3">Utilisateur</th>
                <th className="p-3">Rôle / Profil</th>
                <th className="p-3">Dépôt / Poste Affecté</th>
                <th className="p-3 text-center">Statut</th>
                <th className="p-3">Dernière Connexion</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6f6ff]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#f3faff]">
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#0d631b] text-white flex items-center justify-center font-bold text-xs">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-[#071e27]">{u.name}</div>
                        <div className="text-[10px] text-[#707a6c]">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="bg-[#e6f6ff] text-[#0d631b] border border-[#bfcaba] px-2 py-0.5 rounded text-[10px] font-bold font-mono">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-[#40493d]">{u.depotAssignment}</td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.isActive
                          ? 'bg-[#e8f5e9] text-[#2e7d32] border border-[#a5d6a7]'
                          : 'bg-[#ffdad6] text-[#ba1a1a] border border-[#ef9a9a]'
                      }`}
                    >
                      {u.isActive ? 'ACTIF' : 'DÉSACTIVÉ'}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-[#707a6c]">{u.lastLogin || '-'}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => toggleUserStatus(u.id)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold border transition-colors ${
                        u.isActive
                          ? 'bg-white hover:bg-[#ffdad6] text-[#ba1a1a] border-[#ffdad6]'
                          : 'bg-white hover:bg-[#e8f5e9] text-[#2e7d32] border-[#a5d6a7]'
                      }`}
                    >
                      {u.isActive ? 'Désactiver' : 'Réactiver'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* OPERATIONAL PERMISSIONS MATRIX */}
      <div className="bg-white border border-[#bfcaba] rounded overflow-hidden shadow-xs">
        <div className="p-3 bg-[#e6f6ff] border-b border-[#bfcaba]">
          <span className="font-bold text-xs uppercase tracking-wider text-[#071e27]">
            🔒 Matrice des Droits Opérationnels par Rôle
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#cfe6f2] text-[#071e27] font-bold border-b border-[#bfcaba]">
              <tr>
                <th className="p-2.5">Fonctionnalité Métier</th>
                <th className="p-2.5 text-center">Admin</th>
                <th className="p-2.5 text-center">DG</th>
                <th className="p-2.5 text-center">Resp. Com</th>
                <th className="p-2.5 text-center">Commercial</th>
                <th className="p-2.5 text-center">Caisse</th>
                <th className="p-2.5 text-center">Stock</th>
                <th className="p-2.5 text-center">Comptable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6f6ff]">
              {permissionsMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#f3faff]">
                  <td className="p-2.5 font-semibold text-[#071e27]">{row.capability}</td>
                  <td className="p-2.5 text-center">{row.admin ? '🟢' : '⚪'}</td>
                  <td className="p-2.5 text-center">{row.dg ? '🟢' : '⚪'}</td>
                  <td className="p-2.5 text-center">{row.respCommercial ? '🟢' : '⚪'}</td>
                  <td className="p-2.5 text-center">{row.commercial ? '🟢' : '⚪'}</td>
                  <td className="p-2.5 text-center">{row.caisse ? '🟢' : '⚪'}</td>
                  <td className="p-2.5 text-center">{row.stock ? '🟢' : '⚪'}</td>
                  <td className="p-2.5 text-center">{row.comptable ? '🟢' : '⚪'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#bfcaba] rounded-lg max-w-md w-full p-5 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#bfcaba] pb-3 mb-4">
              <h3 className="font-bold text-sm text-[#071e27]">Créer un Nouveau Compte Utilisateur</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#707a6c] hover:text-[#071e27] font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#707a6c] mb-1">
                  Nom et Prénoms
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex: Yao N'Dri Marcel"
                  className="w-full h-8 px-2.5 bg-white border border-[#bfcaba] rounded focus:ring-1 focus:ring-[#0d631b]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#707a6c] mb-1">
                  Adresse Email Professionnelle
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ex: m.yao@etam.ci"
                  className="w-full h-8 px-2.5 bg-white border border-[#bfcaba] rounded focus:ring-1 focus:ring-[#0d631b]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#707a6c] mb-1">
                  Profil & Rôle Attribué
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full h-8 px-2 bg-white border border-[#bfcaba] rounded font-semibold"
                >
                  <option value="SALES_REP">Commercial (Saisie Proforma)</option>
                  <option value="CASHIER">Caisse (Encaissement & Ventes)</option>
                  <option value="STOCK_MANAGER">Gestionnaire de Stock (Mouvements & BL)</option>
                  <option value="SALES_MANAGER">Responsable Commercial</option>
                  <option value="DG_SUPERVISOR">DG / Superviseur Général</option>
                  <option value="ACCOUNTANT">Comptable (Journal des Ventes)</option>
                  <option value="ADMIN">Administrateur Système</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#707a6c] mb-1">
                  Poste / Dépôt d&apos;Affectation
                </label>
                <input
                  type="text"
                  value={depot}
                  onChange={(e) => setDepot(e.target.value)}
                  placeholder="ex: Dépôt Central ou Station Caisse"
                  className="w-full h-8 px-2.5 bg-white border border-[#bfcaba] rounded"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#bfcaba]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-8 px-3 text-xs font-semibold text-[#707a6c] hover:bg-[#e6f6ff] rounded"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 bg-[#0d631b] hover:bg-[#2e7d32] text-white rounded text-xs font-bold shadow-xs"
                >
                  Enregistrer l&apos;utilisateur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

