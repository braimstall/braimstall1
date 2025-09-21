## Gestion du parcours client – Diagrammes de flux

### Histoire CJ-001 : Inscription client et onboarding
```mermaid
flowchart TD
  start([Début]) --> reg[Page d’inscription]
  reg --> enter[Saisir e‑mail, téléphone, mot de passe, informations société]
  enter --> email{E‑mail unique ?}
  email -- Non --> email_err[Afficher erreur : e‑mail déjà utilisé]
  email_err --> enter
  email -- Oui --> phone{Téléphone au format EAU/CCG valide ?}
  phone -- Non --> phone_err[Afficher erreur : téléphone invalide]
  phone_err --> enter
  phone -- Oui --> pass{Mot de passe conforme aux exigences ?}
  pass -- Non --> pass_err[Afficher erreur : mot de passe faible]
  pass_err --> enter
  pass -- Oui --> acct[Créer le compte (vérification en attente)]
  acct --> codes[Envoyer les codes de vérification e‑mail et SMS]
  codes --> verify_page[Rediriger vers la page de vérification]
  verify_page --> input_codes[Saisir les deux codes de vérification]
  input_codes --> codes_valid{Codes valides ?}
  codes_valid -- Non --> code_err[Afficher erreur : codes invalides/expirés]
  code_err --> attempts{Tentatives ≥ 3 ?}
  attempts -- Oui --> lock[Verrouiller le compte pendant 24 h]
  lock --> end([Fin])
  attempts -- Non --> resend[Autoriser renvoi après 60 s ; ressaisir]
  resend --> verify_page
  codes_valid -- Oui --> active[Activer le compte ; connexion auto]
  active --> profile[Rediriger vers la complétion du profil]
  profile --> complete[Compléter champs obligatoires : licence, adresse de facturation, contact]
  complete --> mandatory{Tout obligatoire fourni ?}
  mandatory -- Non --> fix_mandatory[Demander de compléter les champs requis]
  fix_mandatory --> complete
  mandatory -- Oui --> access[Marquer le profil comme complet ; activer la réservation]
  access --> kyc{Documents KYC téléversés ?}
  kyc -- Non --> end
  kyc -- Oui --> scan[Analyse antivirus et validation des documents]
  scan --> scan_ok{Analyse/validation réussie ?}
  scan_ok -- Non --> reupload[Rejeter ; demander un nouveau téléversement]
  reupload --> kyc
  scan_ok -- Oui --> under_review[Statut « En cours d’examen » ; notifier l’admin ; envoyer confirmation]
  under_review --> end
```

### Histoire CJ-002 : Création de demande de réservation avancée
```mermaid
flowchart TD
  start([Début]) --> page[Page de création de réservation]
  page --> locations[Saisir enlèvement et livraison (recherche/carte)]
  locations --> in_area{Deux emplacements dans zones desservies ?}
  in_area -- Non --> area_err[Erreur : hors zones desservies]
  area_err --> locations
  in_area -- Oui --> dist_ok{Distance 1–1000 km ?}
  dist_ok -- Non --> dist_err[Erreur : distance invalide (<1 ou >1000 km)]
  dist_err --> locations
  dist_ok -- Oui --> geocode{Précision de géocodage OK ?}
  geocode -- Non --> geocode_err[Affiner l’adresse]
  geocode_err --> locations
  geocode -- Oui --> route[Afficher distance et temps estimé ; zones desservies]
  route --> cargo[Saisir type de cargaison, poids, dimensions, exigences]
  cargo --> compatible{Poids/dimensions compatibles ?}
  compatible -- Non --> comp_err[Erreur : cargaison hors limites]
  comp_err --> cargo
  compatible -- Oui --> suggest[Suggérer/filtrer types de camions compatibles]
  suggest --> special{Exigences particulières ?}
  special -- Oui --> reqs[Certif. matières dangereuses ; temp. réfrigéré ; fragile]
  reqs --> fees1[Calculer frais de manutention spéciale]
  fees1 --> schedule
  special -- Non --> schedule[Sélectionner créneaux enlèvement/livraison]
  schedule --> availability[Vérifier disponibilité conducteur/camion]
  availability --> slots[Mettre en évidence les créneaux disponibles]
  slots --> surcharges[Appliquer majorations : express 50 %, week‑end 25 %, pointe 15 %]
  surcharges --> instructions[Ajouter instructions (contacts, accès, équipements)]
  instructions --> instr_ok{Instructions complètes ?}
  instr_ok -- Non --> instr_err[Demander à compléter]
  instr_err --> instructions
  instr_ok -- Oui --> fees2[Calculer coûts additionnels ; signaler exigences]
  fees2 --> quote[Demander un devis]
  quote --> pricing[Calculer prix : base, distance/km, poids/kg, spécial, temps, carburant, TVA]
  pricing --> display[Afficher le devis < 5 s ; détail ; validité 24 h]
  display --> end([Fin])
```

### Histoire CJ-003 : Sélection intelligente du camion et confirmation
```mermaid
flowchart TD
  start([Début]) --> have_quote{Devis disponible ?}
  have_quote -- Non --> back[Compléter les détails et demander un devis]
  back --> have_quote
  have_quote -- Oui --> search[Rechercher camions disponibles]
  search --> filter[Filtrer par compatibilité de la cargaison]
  filter --> list[Afficher camions (détails, chauffeur, notes, prix, ETA) ; trier par pertinence]
  list --> compare[Comparer des camions ?]
  compare -- Oui --> compare_view[Sélectionner jusqu’à 3 ; comparaison côte à côte]
  compare_view --> choose[Choisir un camion]
  compare -- Non --> choose[Choisir un camion]
  list --> view_driver[Voir le profil du chauffeur ?]
  view_driver -- Oui --> profile[Afficher profil, avis, performances, certifications]
  profile --> list
  view_driver -- Non --> list
  choose --> review[Relire le récapitulatif de réservation]
  review --> payment[Choisir le moyen de paiement (carte, virement, crédit, etc.)]
  payment --> terms[Accepter les conditions générales]
  terms --> confirm[Confirmer la réservation ; générer une référence]
  confirm --> notify[Envoyer la confirmation par e‑mail et SMS]
  notify --> modify[Modifier ou annuler ?]
  modify -- Non --> end([Fin])
  modify -- Oui --> timing[Délai avant enlèvement ?]
  timing --> fees[Règles : gratuit >24 h ; 10 % <24 h ; 25 % annulation <24 h ; 50 % <2 h ; pas de remboursement no‑show]
  fees --> notify_driver[Notifier automatiquement le chauffeur]
  notify_driver --> is_cancel[Annulation ?]
  is_cancel -- Oui --> refund[Lancer le remboursement si applicable]
  refund --> end
  is_cancel -- Non --> end
```

### Histoire CJ-004 : Suivi d’expédition en temps réel
```mermaid
flowchart TD
  start([Début]) --> assigned[Réservation confirmée et chauffeur affecté ?]
  assigned -- Non --> wait[Attendre l’affectation]
  wait --> assigned
  assigned -- Oui --> tracking[Ouvrir la page de suivi]
  tracking --> map[Carte GPS en direct ; mise à jour 30 s ; itinéraire et ETA]
  map --> status[Changement de statut ?]
  status -- Oui --> updates[Mettre à jour la chronologie ; envoyer SMS/push]
  updates --> map
  status -- Non --> contact[Besoin de contacter le chauffeur ?]
  contact -- Oui --> comm[Appel (masqué), message in‑app, vocal, photo ; urgence]
  comm --> map
  contact -- Non --> map
  map --> delivered[Livraison terminée ?]
  delivered -- Non --> map
  delivered -- Oui --> pod[Confirmation de livraison ; preuve (photos, signature)]
  pod --> invoice[Générer et envoyer la facture]
  invoice --> analytics[Afficher les analyses ; noter et donner un avis]
  analytics --> store[Stocker les données pour référence et litiges]
  store --> end([Fin])
```

