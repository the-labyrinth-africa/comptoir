'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useAppStore } from '@/store/useAppStore';
import { UserRole } from '@/types';

export const LoginPage: React.FC = () => {
  const { users, login, loginAsRole } = useAppStore();

  const [email, setEmail] = useState('a.toure@etam.ci');
  const [password, setPassword] = useState('etam2025');
  const [selectedDepot, setSelectedDepot] = useState('Station POS-01 (Caisse Principale)');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isDemoMode = process.env.NODE_ENV !== 'production';

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const result = login(email, password);
    if (!result.success) {
      setErrorMessage(result.message || 'Identifiants incorrects');
    }
  };

  const roleProfiles: {
    role: UserRole;
    title: string;
    description: string;
    user: (typeof users)[0];
    modules: string[];
    color: string;
    icon: string;
  }[] = [
    {
      role: 'CASHIER',
      title: 'Caisse & Règlements',
      icon: '💵',
      description: 'Transformation proforma en vente, encaissement multi-moyens, décrémentation immédiate du stock.',
      user: users.find((u) => u.role === 'CASHIER') || users[0],
      modules: ['Caisse POS F5'],
      color: 'border-[#0d631b] hover:bg-[#e8f5e9]',
    },
    {
      role: 'SALES_REP',
      title: 'Commercial',
      icon: '📄',
      description: 'Recherche catalogue, établissement des devis proforma, calcul HT/TVA/TTC.',
      user: users.find((u) => u.role === 'SALES_REP') || users[1],
      modules: ['Commercial F3', 'Recherche Stock F2'],
      color: 'border-[#fc6018] hover:bg-[#fff3e0]',
    },
    {
      role: 'STOCK_MANAGER',
      title: 'Gestionnaire de Stock',
      icon: '📦',
      description: 'Inventaire temps réel, bons de sortie caisse, réceptions fournisseurs, grand livre.',
      user: users.find((u) => u.role === 'STOCK_MANAGER') || users[3],
      modules: ['Stock F4', 'Réception F7', 'Grand Livre F8'],
      color: 'border-[#2e7d32] hover:bg-[#e8f5e9]',
    },
    {
      role: 'ACCOUNTANT',
      title: 'Comptable',
      icon: '📊',
      description: 'Journal des ventes et encaissements, TVA 18%, rapprochements bancaires et export CSV.',
      user: users.find((u) => u.role === 'ACCOUNTANT') || users[5],
      modules: ['Journal Ventes F6'],
      color: 'border-[#485860] hover:bg-[#e6f6ff]',
    },
    {
      role: 'DG_SUPERVISOR',
      title: 'DG / Superviseur',
      icon: '📈',
      description: 'Tableau de bord de supervision, CA réalisé, conversion par commercial, alertes.',
      user: users.find((u) => u.role === 'DG_SUPERVISOR') || users[4],
      modules: ['Supervision DG', 'Journal Ventes', 'Niveaux de Stock'],
      color: 'border-[#071e27] hover:bg-[#cfe6f2]',
    },
    {
      role: 'SALES_MANAGER',
      title: 'Responsable Commercial',
      icon: '👔',
      description: 'Supervision de l\'activité commerciale, consultation proformas et disponibilités stock.',
      user: users.find((u) => u.role === 'SALES_MANAGER') || users[2],
      modules: ['Proformas F3', 'Supervision Commerciaux', 'Consultation Stock'],
      color: 'border-[#a83900] hover:bg-[#ffdbcf]',
    },
    {
      role: 'ADMIN',
      title: 'Administrateur Système',
      icon: '⚙️',
      description: 'Gestion des comptes utilisateurs, attributions des rôles et paramétrage complet.',
      user: users.find((u) => u.role === 'ADMIN') || users[6],
      modules: ['Administration & Rôles', 'Tous les modules'],
      color: 'border-[#ba1a1a] hover:bg-[#ffdad6]',
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#f3faff] flex flex-col overflow-y-auto">
      {/* Top Header Bar */}
      <header className="h-10 bg-[#1e333c] text-white px-4 flex items-center justify-between border-b border-[#485860] shrink-0 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-white overflow-hidden relative border border-white/20 shrink-0">
            <Image
              src="/images/etam.jpg"
              alt="ETAM Logo"
              width={24}
              height={24}
              className="object-cover"
              priority
            />
          </div>
          <span className="font-bold text-sm tracking-tight">
            ETAM S.A.R.L — Station de Travail Commerciale & Stocks
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#a3f69c]">
          <span className="w-2 h-2 rounded-full bg-[#88d982] animate-pulse"></span>
          <span className="hidden sm:inline font-mono">MONGODB CENTRALISÉ : CONNECTÉ</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6">
        {/* Hero & Login Form Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* LEFT: Brand Presentation */}
          <div className="lg:col-span-5 bg-white border border-[#bfcaba] rounded-lg p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 rounded-md bg-white border border-[#bfcaba] p-1 shadow-xs overflow-hidden shrink-0">
                  <Image
                    src="/images/etam.jpg"
                    alt="ETAM Logo Grand"
                    width={56}
                    height={56}
                    className="object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-[#071e27] leading-tight">
                    ETAM S.A.R.L
                  </h1>
                  <p className="text-xs text-[#40493d] font-medium">
                    Électricité & Matériel Industriel
                  </p>
                  <span className="text-[10px] font-mono bg-[#e6f6ff] text-[#0d631b] border border-[#bfcaba] px-1.5 py-0.2 rounded font-semibold mt-1 inline-block">
                    Portail d&apos;Accès Sécurisé v2.0
                  </span>
                </div>
              </div>

              <div className="text-xs text-[#40493d] space-y-2 leading-relaxed border-t border-[#e6f6ff] pt-3">
                <p>
                  L&apos;interface s&apos;adapte automatiquement selon le profil opérationnel de l&apos;utilisateur connecté :
                </p>
                <ul className="space-y-1 text-[11px] list-disc list-inside text-[#071e27]">
                  <li><strong>Caisse :</strong> transformation proforma $\rightarrow$ vente et encaissements.</li>
                  <li><strong>Commercial :</strong> consultation des stocks et émission des devis.</li>
                  <li><strong>Stock :</strong> inventaires, réceptions fournisseurs et bons de sortie.</li>
                  <li><strong>Comptable :</strong> journal des écritures de vente et TVA 18%.</li>
                  <li><strong>Direction :</strong> tableaux de bord et supervision en temps réel.</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-[#e6f6ff] pt-3 mt-3 text-[11px] text-[#707a6c] flex items-center justify-between font-mono">
              <span>Devise : FCFA (XOF)</span>
              <span>TVA standard : 18%</span>
            </div>
          </div>

          {/* RIGHT: Credentials Form + Quick Role Selector */}
          <div className="lg:col-span-7 bg-white border-2 border-[#0d631b] rounded-lg p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#bfcaba] pb-2.5 mb-3">
                <div>
                  <h2 className="text-base font-bold text-[#071e27]">
                    Connexion au Poste de Travail
                  </h2>
                  <p className="text-xs text-[#707a6c]">
                    Sélectionnez un rôle de test ou entrez vos identifiants
                  </p>
                </div>
                <span className="text-xl">🔐</span>
              </div>

              {/* TOP DIRECT 1-CLICK ROLE SELECTOR PILLS */}
              {isDemoMode && <div className="bg-[#e6f6ff] border border-[#bfcaba] p-2.5 rounded mb-3.5">
                <div className="text-[10px] uppercase font-bold text-[#0d631b] mb-1.5 flex items-center justify-between">
                  <span>⚡ Accès Rapide Direct (Cliquez pour tester) :</span>
                  <span className="text-[9px] text-[#707a6c]">7 Rôles Métier</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {roleProfiles.map((p) => (
                    <button
                      key={p.role}
                      type="button"
                      onClick={() => loginAsRole(p.role)}
                      className="px-2 py-1 bg-white hover:bg-[#0d631b] hover:text-white border border-[#bfcaba] text-[#071e27] rounded text-[11px] font-bold flex items-center gap-1 transition-all shadow-2xs active:scale-95 cursor-pointer"
                      title={`Se connecter instantanément comme ${p.title} (${p.user.name})`}
                    >
                      <span>{p.icon}</span>
                      <span>{p.title.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>}

              {errorMessage && (
                <div className="bg-[#ffdad6] text-[#ba1a1a] p-2.5 rounded text-xs font-semibold mb-3 border border-[#ef9a9a]">
                  ⚠ {errorMessage}
                </div>
              )}

              <form onSubmit={handleManualLogin} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-[#707a6c] uppercase mb-1">
                    Adresse Email Utilisateur
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ex: a.toure@etam.ci"
                    className="w-full h-8 px-2.5 bg-[#f3faff] border border-[#bfcaba] rounded text-xs text-[#071e27] font-semibold focus:outline-none focus:ring-1 focus:ring-[#0d631b]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-[#707a6c] uppercase mb-1">
                      Mot de Passe
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-8 px-2.5 bg-[#f3faff] border border-[#bfcaba] rounded text-xs text-[#071e27] focus:outline-none focus:ring-1 focus:ring-[#0d631b]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#707a6c] uppercase mb-1">
                      Terminal / Poste Affecté
                    </label>
                    <select
                      value={selectedDepot}
                      onChange={(e) => setSelectedDepot(e.target.value)}
                      className="w-full h-8 px-2 bg-white border border-[#bfcaba] rounded text-xs text-[#071e27] font-semibold"
                    >
                      <option value="Station POS-01 (Caisse Principale)">Station POS-01 (Caisse)</option>
                      <option value="Comptoir Commercial (Poste C-02)">Comptoir Commercial</option>
                      <option value="Dépôt Central A & B">Dépôt Central A & B</option>
                      <option value="Bureau Direction Générale">Bureau Direction Générale</option>
                      <option value="Bureau Comptabilité">Bureau Comptabilité</option>
                    </select>
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    className="w-full h-9 bg-[#0d631b] hover:bg-[#2e7d32] text-white rounded font-bold text-xs shadow-xs flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
                  >
                    <span>✓</span>
                    <span>Ouvrir la Session Métier</span>
                  </button>
                </div>
              </form>
            </div>

            <div className="border-t border-[#bfcaba] pt-2.5 mt-3 flex items-center justify-between text-xs text-[#707a6c]">
              <span>Gestion des accès :</span>
              <span className="font-semibold text-[#071e27]">
                Création et gestion des comptes réservées à l&apos;Administrateur Système
              </span>
            </div>
          </div>
        </div>

        {/* DETAILED 7 TEST ACCESS CARDS GRID */}
        {isDemoMode && <div className="bg-white border border-[#bfcaba] rounded-lg p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#bfcaba] pb-2.5 mb-3.5">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#071e27] flex items-center gap-1.5">
                <span>📋</span> Fiches Détaillées des 7 Rôles Métier Prévus
              </h3>
              <p className="text-[11px] text-[#707a6c]">
                Chaque carte détaille les modules autorisés pour le rôle correspondant
              </p>
            </div>
            <span className="text-[10px] font-mono bg-[#cbffc2] text-[#005312] px-2 py-0.5 rounded font-bold">
              7 PROFILS CONFIGURÉS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {roleProfiles.map((p) => (
              <div
                key={p.role}
                className={`border rounded-lg p-3.5 flex flex-col justify-between transition-all bg-[#f8fafc] ${p.color}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold font-mono uppercase px-1.5 py-0.5 rounded bg-white border border-[#cfd8dc]">
                      {p.role}
                    </span>
                    <span className="text-base">{p.icon}</span>
                  </div>

                  <h4 className="font-bold text-xs text-[#071e27]">{p.title}</h4>
                  <div className="text-[11px] font-semibold text-[#0d631b] mt-0.5">
                    {p.user.name}
                  </div>
                  <div className="text-[10px] font-mono text-[#707a6c]">
                    {p.user.email}
                  </div>

                  <p className="text-[11px] text-[#40493d] mt-2 line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {p.modules.map((m, i) => (
                      <span
                        key={i}
                        className="text-[9px] bg-white text-[#071e27] border border-[#cfd8dc] px-1.5 py-0.2 rounded font-semibold"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => loginAsRole(p.role)}
                  className="mt-3.5 w-full h-8 bg-white hover:bg-[#0d631b] hover:text-white border border-[#bfcaba] text-[#071e27] rounded text-xs font-bold transition-all shadow-2xs active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Tester ce rôle</span>
                  <span>→</span>
                </button>
              </div>
            ))}
          </div>
        </div>}
      </main>

      {/* Footer */}
      <footer className="h-8 bg-[#263238] text-[#cfd8dc] px-4 flex items-center justify-between text-[11px] font-mono shrink-0">
        <span>ETAM S.A.R.L — Système de Gestion Commerciale & Stocks</span>
        <span>Version 2.0 (Connectée MongoDB)</span>
      </footer>
    </div>
  );
};
