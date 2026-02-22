
# Onglet Admin "Signalements"

## Objectif

Ajouter un onglet "Signalements" dans le tableau de bord admin pour gerer les rapports de problemes soumis par les utilisateurs, organises par oeuvre.

## Fonctionnement

1. L'onglet affiche une liste de boutons, un par oeuvre ayant au moins un signalement non traite (status = 'pending')
2. Cliquer sur un bouton d'oeuvre deroule la liste des signalements associes
3. Cliquer sur un signalement ouvre un dialog de detail avec toutes les informations (type, description, chapitre, capture d'ecran, date)
4. L'admin peut marquer un signalement comme "traite" ou "rejete"

## Plan technique

### 1. Nouveau composant `ReportsAdmin.tsx`

Ce composant autonome gere tout l'onglet :

**Donnees** :
- Requete `chapter_reports` filtree sur `status = 'pending'`, jointure avec `books` pour le titre de l'oeuvre
- Regroupement cote client par `book_id`

**Interface** :
- Liste de boutons (un par oeuvre avec signalements en attente), affichant le titre du livre et un badge avec le nombre de signalements
- Cliquer sur un bouton affiche/cache (accordeon) la liste des signalements de cette oeuvre
- Chaque signalement montre : type (badge), chapitre, date, debut de la description
- Cliquer sur un signalement ouvre un `Dialog` de detail avec :
  - Type de probleme
  - Description complete
  - Chapitre concerne
  - Capture d'ecran (si fournie, affichee en image cliquable)
  - Date de soumission
  - Boutons d'action : "Marquer comme traite" (status -> resolved) et "Rejeter" (status -> dismissed)
- Apres action, le signalement disparait de la liste (rafraichissement automatique)

**Structure du composant** :
```text
ReportsAdmin
  +-- Etat : reports[], selectedBookId, selectedReport
  +-- Fetch : chapter_reports WHERE status='pending' + books.title
  +-- Affichage :
       +-- Bouton par oeuvre (avec badge count)
       +-- Liste deroulante des signalements
       +-- Dialog de detail avec actions
```

### 2. Modification de `AdminDashboard.tsx`

- Importer `ReportsAdmin`
- Ajouter un `TabsTrigger` "Signalements" avec icone `Flag` dans la `TabsList`
- Ajouter le `TabsContent` correspondant avec `<ReportsAdmin />`

### 3. Fichiers concernes

| Fichier | Action |
|---------|--------|
| `src/components/ReportsAdmin.tsx` | **Nouveau** - Composant de gestion des signalements |
| `src/components/AdminDashboard.tsx` | Ajouter l'onglet + import |

Aucune migration SQL necessaire : la table `chapter_reports` et les policies admin existent deja.
