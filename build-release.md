# Guide de build pour Google Play Store - Orydia

## État actuel de la configuration

✅ **Configuration Android complète**
- Configuration Capacitor mise à jour
- Fichiers de ressources Android créés
- Icônes d'application générées
- Configuration ProGuard pour l'obfuscation
- Build optimisé avec Java 21

## Étapes pour publier sur Google Play Store

### 1. Prérequis
- Compte développeur Google Play Store (25$ unique)
- Clé de signature pour les releases
- Certificat de l'application

### 2. Génération de la clé de signature
```bash
# Générer une clé de signature (à faire une seule fois)
keytool -genkey -v -keystore orydia-release-key.keystore -alias orydia -keyalg RSA -keysize 2048 -validity 10000
```

### 3. Configuration de la signature
Créer le fichier `android/key.properties` :
```
storePassword=VOTRE_MOT_DE_PASSE_KEYSTORE
keyPassword=VOTRE_MOT_DE_PASSE_CLE
keyAlias=orydia
storeFile=../orydia-release-key.keystore
```

### 4. Build de production
```bash
# Build web
npm run build

# Sync avec Android
npx cap sync android

# Build Android release
cd android
./gradlew assembleRelease
```

### 5. Fichiers nécessaires
- **APK/AAB** : `android/app/build/outputs/bundle/release/app-release.aab`
- **Privacy Policy** : URL vers votre politique de confidentialité
- **Screenshots** : Captures d'écran de l'app (min. 2 par format)
- **Description** : Description courte et longue de l'app

### 6. Checklist Play Store
- [ ] Générer la clé de signature
- [ ] Configurer la signature dans build.gradle
- [ ] Créer le bundle de production (.aab)
- [ ] Préparer les assets (screenshots, descriptions)
- [ ] Configurer la fiche Play Store
- [ ] Test sur appareil physique

## Configuration actuelle

✅ Fichiers créés/configurés :
- `android/app/src/main/res/values/strings.xml`
- `android/app/src/main/res/values/styles.xml` 
- `android/app/src/main/res/values/colors.xml`
- `android/app/src/main/res/drawable/splash.xml`
- `android/app/proguard-rules.pro`
- Icônes d'application (format xxxhdpi)

⚠️ À faire manuellement :
- Générer les autres tailles d'icônes (hdpi, mdpi, xhdpi, xxhdpi)
- Configurer la signature de release
- Tester sur appareil physique

## Notes importantes
- Utilisez Android App Bundle (.aab) plutôt que APK pour une meilleure optimisation
- Testez d'abord avec un build debug sur un appareil physique
- La signature de production ne peut pas être changée après publication