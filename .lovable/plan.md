

# Bouton "Signaler un probleme" dans le lecteur de chapitre

## Contexte

Le lecteur EPUB (`ChapterEpubReader.tsx`) dispose d'une barre de pied de page fixe avec :
- A gauche : un bouton **T** (parametres de texte)
- Au centre : le bouton d'action principal (chapitre suivant, reclamer Orydors, etc.)

L'objectif est d'ajouter un bouton **a droite** du bouton principal, symetrique au bouton T, pour signaler un probleme (faute, mise en page, etc.).

## Fonctionnalites

1. **Bouton d'alerte** (icone drapeau/alerte) place a droite dans le footer
2. **Panneau de signalement** (Sheet sur mobile, Dialog sur desktop) avec :
   - Type de probleme (select) : Faute d'orthographe, Probleme de mise en page, Contenu manquant, Autre
   - Champ de texte libre (textarea) pour decrire le probleme
   - Upload de capture d'ecran (optionnel, image uniquement)
   - Captcha simple "fait maison" (question mathematique aleatoire) pour eviter les abus
   - Informations automatiques jointes : chapitre en cours, livre, utilisateur
3. **Table Supabase** `chapter_reports` pour stocker les signalements
4. **Bucket Storage** `chapter-report-screenshots` pour les captures

## Plan technique

### 1. Migration base de donnees

Creer la table `chapter_reports` :

```sql
CREATE TABLE public.chapter_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  book_id UUID NOT NULL,
  chapter_id UUID NOT NULL,
  chapter_title TEXT NOT NULL,
  report_type TEXT NOT NULL,
  description TEXT NOT NULL,
  screenshot_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chapter_reports ENABLE ROW LEVEL SECURITY;

-- Utilisateurs authentifies peuvent creer des signalements
CREATE POLICY "Users can create reports"
ON public.chapter_reports FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Utilisateurs voient leurs propres signalements
CREATE POLICY "Users can view own reports"
ON public.chapter_reports FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Admins voient tout
CREATE POLICY "Admins can manage reports"
ON public.chapter_reports FOR ALL TO authenticated
USING (public.is_admin(auth.uid()));
```

Creer le bucket storage :

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('chapter-report-screenshots', 'chapter-report-screenshots', false);

CREATE POLICY "Users upload screenshots"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'chapter-report-screenshots' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users view own screenshots"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'chapter-report-screenshots' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Admins view all screenshots"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'chapter-report-screenshots' AND public.is_admin(auth.uid()));
```

### 2. Nouveau composant `ChapterReportDialog.tsx`

Composant contenant :
- **Select** pour le type de probleme (4 options)
- **Textarea** pour la description (obligatoire, max 1000 caracteres)
- **Input file** pour une capture d'ecran (accept="image/*", optionnel)
- **Captcha mathematique** : affiche une operation simple (ex: "Combien font 7 + 3 ?"), l'utilisateur doit taper la bonne reponse pour pouvoir envoyer
- **Rate limiting** : utilisation du RPC `check_rate_limit` existant (max 5 signalements par heure)
- Sur mobile : utilise `Sheet` (bottom). Sur desktop : `Dialog`
- A l'envoi :
  1. Verification du captcha
  2. Verification du rate limit
  3. Upload de la capture d'ecran dans le bucket (si fournie)
  4. Insert dans `chapter_reports` avec book_id, chapter_id, chapter_title, type, description, screenshot_url
  5. Toast de confirmation

### 3. Modification de `ChapterEpubReader.tsx`

Dans le footer (lignes 1258-1348), ajouter apres le bouton d'action principal (apres la `div.flex-1`) :

```tsx
{/* Report button on the right */}
<Button
  variant="outline"
  size="icon"
  onClick={() => setReportOpen(true)}
  className="h-9 w-9 shrink-0 z-40"
  title="Signaler un probleme"
>
  <Flag className="h-5 w-5" />
</Button>
```

Structure du footer resultant :

```text
[ T ]  [    Chapitre suivant    ]  [ Flag ]
```

Ajouter les states `reportOpen` et le composant `ChapterReportDialog` dans le rendu.

### 4. Fichiers concernes

| Fichier | Action |
|---------|--------|
| Migration SQL | Creer table `chapter_reports` + bucket + RLS |
| `src/components/ChapterReportDialog.tsx` | **Nouveau** - Dialog/Sheet de signalement |
| `src/components/ChapterEpubReader.tsx` | Ajouter le bouton + state + import du dialog |

### 5. Captcha "maison"

Plutot qu'integrer un service externe (hCaptcha, reCAPTCHA, Turnstile), un captcha mathematique simple est suffisant pour ce cas d'usage :
- Generation aleatoire de 2 nombres (1-20) et d'une operation (+, x)
- L'utilisateur doit donner la bonne reponse
- Le captcha se regenere a chaque ouverture du dialog
- Cela empeche les soumissions automatisees basiques sans complexite d'integration

