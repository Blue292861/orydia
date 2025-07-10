
# Configuration iOS pour Orydia

## Étapes pour configurer iOS

1. **Ajout de la plateforme iOS** (nécessite macOS)
   ```bash
   npx cap add ios
   ```

2. **Construction et synchronisation**
   ```bash
   npm run build
   npx cap sync ios
   ```

3. **Ouverture dans Xcode**
   ```bash
   npx cap open ios
   ```

## Permissions iOS requises

Les permissions suivantes seront ajoutées automatiquement dans `ios/App/App/Info.plist` :

- NSCameraUsageDescription: "Cette app utilise la caméra pour prendre des photos"
- NSPhotoLibraryUsageDescription: "Cette app accède à vos photos"
- NSLocationWhenInUseUsageDescription: "Cette app utilise votre localisation"

## Configuration des icônes iOS

- Placer les icônes dans `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
- Tailles requises: 20x20, 29x29, 40x40, 58x58, 60x60, 76x76, 80x80, 87x87, 120x120, 152x152, 167x167, 180x180, 1024x1024

## Splash Screen iOS

- Configurer dans `ios/App/App/Assets.xcassets/Splash.imageset/`
- Utiliser des images adaptives pour différentes tailles d'écran
