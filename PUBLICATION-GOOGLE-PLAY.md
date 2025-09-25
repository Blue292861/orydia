# Guide Complet Publication Google Play Store - Orydia

## ✅ État de la Configuration

**PRÊT POUR PUBLICATION :**
- ✅ Configuration Capacitor (`com.orydia.app`)
- ✅ Build Android optimisé (Java 21, ProGuard)
- ✅ Permissions correctes (INTERNET uniquement)
- ✅ Security headers et CSP
- ✅ Service Worker pour performance
- ✅ SEO et méta-données

**À FINALISER MANUELLEMENT :**
- ❌ Changer version dans package.json de "0.0.0" à "1.0.0"
- ❌ Générer les icônes manquantes (mdpi, hdpi, xhdpi, xxhdpi)
- ❌ Créer la clé de signature pour production
- ❌ Supprimer console.log (automatique avec terser en production)

## 🚀 ÉTAPES POUR PUBLIER SUR GOOGLE PLAY STORE

### 1. Préparation locale

```bash
# 1. Cloner le projet depuis GitHub
git clone [votre-repo]
cd orydia

# 2. Installer les dépendances
npm install

# 3. Changer la version dans package.json
# Modifier "version": "0.0.0" → "version": "1.0.0"

# 4. Build de production
npm run build

# 5. Sync Capacitor
npx cap sync android
```

### 2. Génération de la clé de signature (UNE SEULE FOIS)

```bash
# Générer la clé de signing (GARDEZ-LA PRÉCIEUSEMENT!)
keytool -genkey -v -keystore orydia-release-key.keystore \
  -alias orydia -keyalg RSA -keysize 2048 -validity 10000

# Informations suggérées:
# First and last name: Orydia
# Organizational unit: Mobile App
# Organization: Orydia
# City: [Votre ville]
# State: [Votre région]
# Country code: FR
```

### 3. Configuration de la signature

Créer `android/key.properties` :
```properties
storePassword=VOTRE_MOT_DE_PASSE_KEYSTORE
keyPassword=VOTRE_MOT_DE_PASSE_CLE
keyAlias=orydia
storeFile=../orydia-release-key.keystore
```

### 4. Modification de android/app/build.gradle

Ajouter AVANT `android {` :
```gradle
def keystorePropertiesFile = rootProject.file("key.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Modifier la section `buildTypes` :
```gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        
        if (keystorePropertiesFile.exists()) {
            signingConfig signingConfigs.release
        }
    }
}
```

Ajouter AVANT `buildTypes` :
```gradle
signingConfigs {
    release {
        if (keystorePropertiesFile.exists()) {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
        }
    }
}
```

### 5. Build via Android Studio

```bash
# Ouvrir Android Studio
cd android
# File → Open → Sélectionner le dossier android/

# Dans Android Studio:
# 1. Build → Select Build Variant → release
# 2. Build → Generate Signed Bundle/APK
# 3. Sélectionner "Android App Bundle"
# 4. Choisir votre keystore
# 5. Build → Make Project
```

### 6. Fichiers de sortie

Le fichier sera généré dans :
`android/app/build/outputs/bundle/release/app-release.aab`

### 7. Upload sur Google Play Console

1. **Créer l'application** sur Google Play Console
2. **Configuration de l'app :**
   - Nom : Orydia
   - Description courte : "Plateforme de lecture immersive"
   - Description longue : [Votre description marketing]
   - Catégorie : Livres et références

3. **Assets requis :**
   - Icône haute résolution (512x512)
   - Screenshots (min. 2 par format)
   - Banner promotionnel (optionnel)

4. **Politique de confidentialité :**
   - URL obligatoire pour toute app sur Play Store
   - Doit mentionner les données collectées

5. **Questionnaire de contenu :**
   - Évaluation du contenu
   - Public cible
   - Publicités (si applicable)

6. **Upload de l'AAB :**
   - Onglet "Production" → "Créer une nouvelle version"
   - Upload de app-release.aab
   - Notes de version

### 8. Tests et validation

```bash
# Test local avant publication
cd android
./gradlew assembleRelease
# Installer l'APK sur un appareil physique pour test

# Vérification sécurité
./gradlew lintRelease
```

### 9. Checklist finale

- [ ] Version mise à jour dans package.json (1.0.0)
- [ ] Clé de signature générée et sécurisée
- [ ] Build.gradle configuré pour signing
- [ ] AAB généré et testé
- [ ] Politique de confidentialité rédigée
- [ ] Screenshots et assets préparés
- [ ] Description store rédigée
- [ ] Test sur appareil physique effectué

## ⚠️ IMPORTANT - SÉCURITÉ

1. **GARDEZ votre keystore** : Une fois perdue, impossible de mettre à jour l'app
2. **Sauvegardez** : keystore + mots de passe dans un endroit sûr
3. **Ne partagez jamais** les fichiers de signature

## 📱 COMMANDES RAPIDES

```bash
# Build complet pour production
npm run build && npx cap sync android && cd android && ./gradlew assembleRelease

# Test sur émulateur
npx cap run android

# Nettoyage des caches
cd android && ./gradlew clean && cd .. && npx cap sync android
```

La configuration est maintenant prête pour la publication ! 🚀