# **DOCUMENT DE CADRAGE**

## **Solution de gestion commerciale et de stock**

### **1\. Objectif**

L’objectif est de mettre en place une solution permettant de centraliser la gestion des **produits, stocks, proformas, ventes et opérations de caisse**, tout en permettant aux différents responsables de suivre l’activité depuis leurs différents lieux de travail.

La solution doit améliorer la circulation de l’information entre les services, réduire les opérations manuelles et faciliter le suivi de l’activité commerciale et des stocks.

## **2\. Acteurs**

La solution sera utilisée par les profils suivants :

* **Administrateur système** : gestion des comptes utilisateurs, des rôles, des accès et des paramètres généraux.  
* **DG / Superviseur Général** : supervision globale de l’activité commerciale et des ventes.  
* **Responsable commercial** : suivi et supervision de l’activité des commerciaux.  
* **Commercial** : consultation des produits et établissement des factures proforma.  
* **Caisse / Caissier** : validation des paiements et transformation des proformas en factures de vente.  
* **Gestionnaire de stock** : gestion des produits, des quantités, des entrées/sorties et des seuils d’alerte.  
* **Comptable** : consultation et suivi des factures de vente.

## **3\. Fonctionnement général**

Le fonctionnement principal de la solution sera basé sur le cycle suivant :

**Approvisionnement → Entrée en stock → Consultation des produits → Proforma → Paiement → Facture de vente → Décrémentation du stock → Bon de sortie → Suivi comptable et supervision.**

### **Gestion du stock**

Après réception des produits, le gestionnaire de stock enregistre les nouveaux produits ou actualise les quantités existantes.

Il peut également définir les **seuils d’alerte** permettant d’identifier les produits proches de la rupture.

### **Gestion commerciale**

Le commercial consulte les produits disponibles et leurs quantités.

Il peut établir une **facture proforma avec un numéro unique**, puis l’imprimer ou la partager avec le client.

### **Vente**

Lorsque le client revient pour régler sa proforma, la caisse recherche celle-ci grâce à son numéro unique.

Après validation du paiement :

* la proforma devient une facture de vente ;  
* un numéro de facture est attribué ;  
* les quantités vendues sont immédiatement décrémentées du stock ;  
* un bon de sortie est généré ;  
* le comptable est informé ;  
* le gestionnaire de stock est informé ;  
* les responsables concernés sont notifiés.

## **4\. Suivi et tableaux de bord**

### **Responsable commercial**

Il pourra notamment :

* consulter les proformas ;  
* filtrer par commercial ;  
* filtrer par jour ou période ;  
* consulter les montants des proformas ;  
* suivre l’activité des commerciaux.

### **DG / Superviseur Général**

Il disposera d’une vision globale permettant notamment de :

* consulter l’activité commerciale ;  
* consulter les factures de vente ;  
* filtrer les ventes par jour ou période ;  
* consulter les montants des ventes ;  
* recevoir les notifications importantes concernant l’activité.

### **Gestionnaire de stock**

Il pourra :

* consulter les niveaux de stock ;  
* être alerté des produits proches de la rupture ;  
* consulter les produits en rupture ;  
* consulter les bons de sortie ;  
* suivre les sorties liées aux ventes.

### **Comptable**

Il pourra :

* recevoir les notifications des nouvelles factures de vente ;  
* consulter les factures ;  
* filtrer les ventes par jour ou période ;  
* consulter les montants des ventes.

## **5\. Gestion des utilisateurs**

Les comptes utilisateurs seront gérés par l’**Administrateur système**.

Il pourra notamment :

* créer un compte ;  
* attribuer un rôle ;  
* modifier un compte ;  
* activer ou désactiver un compte ;  
* gérer les accès.

Les principaux rôles sont :

**Administrateur système — DG(Superviseur Général) — Responsable commercial — Commercial — Caisse — Gestionnaire de stock — Comptable.**

La désactivation d’un compte ne devra pas supprimer l’historique des opérations réalisées par cet utilisateur.

## **6\. Fonctionnement à distance et connexion Internet**

La solution est destinée à être utilisée par des personnes pouvant être situées dans des lieux différents.

Elle fonctionnera donc principalement **avec Internet**, afin de permettre aux différents acteurs d’accéder aux informations centralisées.

Toutefois, une interruption temporaire de connexion ne devra pas bloquer les opérations essentielles de la caisse et des commerciaux.

Certaines opérations pourront ainsi être conservées localement pendant une coupure, puis **synchronisées automatiquement avec le système central lorsque la connexion sera rétablie**.

La synchronisation devra préserver autant que possible :

* l’intégrité des données ;  
* la cohérence des stocks ;  
* l’absence de doublons ;  
* la traçabilité des opérations.

Les situations pouvant entraîner un conflit de données feront l’objet de règles spécifiques.

## **7\. Documents et informations gérés**

La solution devra notamment gérer :

* produits ;  
* clients ;  
* utilisateurs ;  
* factures proforma ;  
* factures de vente ;  
* bons de sortie ;  
* mouvements de stock ;  
* seuils d’alerte ;  
* informations nécessaires aux tableaux de bord.

Les documents commerciaux disposeront d’identifiants uniques permettant leur recherche et leur suivi.

## **8\. Périmètre initial**

La première version sera centrée sur :

* la gestion des utilisateurs et des accès ;  
* la gestion des produits ;  
* la gestion des stocks ;  
* les proformas ;  
* les ventes ;  
* les bons de sortie ;  
* les notifications ;  
* les tableaux de bord ;  
* le fonctionnement à distance ;  
* la continuité des opérations essentielles en cas de coupure Internet.

Les fonctionnalités ne relevant pas de ce périmètre pourront faire l’objet d’une évolution ultérieure.

## **9\. Hypothèses retenues**

* L’application sera principalement utilisée dans un environnement professionnel.  
* Les différents acteurs pourront être géographiquement séparés.  
* Une connexion Internet sera normalement disponible.  
* Certaines opérations essentielles devront pouvoir continuer temporairement en cas de coupure.  
* Les données seront centralisées et synchronisées entre les différents utilisateurs.  
* Le stock sera décrémenté au moment de la validation effective de la vente.  
* Les seuils d’alerte seront gérés par le gestionnaire de stock.  
* La comptabilité générale ne fait pas partie du périmètre initial.  
* La solution pourra évoluer ultérieurement en fonction des besoins de l’entreprise.

## **10\. Validation**

Le présent document constitue la base fonctionnelle initiale du projet.

Sa validation permet de confirmer que les **objectifs, acteurs, responsabilités, principaux flux et hypothèses de fonctionnement** correspondent aux besoins actuels de l’entreprise.

Les exigences fonctionnelles et non fonctionnelles détaillées seront établies sur la base de ce cadrage validé.

