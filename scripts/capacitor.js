
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const command = process.argv[2];
const platform = process.argv[3] || 'android'; // Default to android, but support ios

function runCommand(cmd) {
  console.log(`Exécution: ${cmd}`);
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Erreur lors de l'exécution: ${cmd}`);
    process.exit(1);
  }
}

function runCommandSafe(cmd) {
  console.log(`Exécution: ${cmd}`);
  try {
    execSync(cmd, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.log(`⚠️ Commande échouée: ${cmd}`);
    return false;
  }
}

function checkCapacitorConfig() {
  const configPath = path.join(process.cwd(), 'capacitor.config.ts');
  if (!fs.existsSync(configPath)) {
    console.error('Fichier capacitor.config.ts non trouvé. Initialisation de Capacitor...');
    runCommand('npx cap init');
    return false;
  }
  return true;
}

function checkNodeModules() {
  const nodeModulesPath = path.join(process.cwd(), 'node_modules', '@capacitor', 'cli');
  if (!fs.existsSync(nodeModulesPath)) {
    console.error('Capacitor CLI non trouvé. Installation des dépendances...');
    runCommand('npm install');
    return false;
  }
  return true;
}

function ensureBuild() {
  const distPath = path.join(process.cwd(), 'dist');
  if (!fs.existsSync(distPath)) {
    console.log('📦 Construction des assets web...');
    process.env.CAPACITOR_BUILD = 'true';
    runCommand('npm run build');
  } else {
    console.log('✅ Assets web trouvés dans dist/');
  }
}

function cleanPlatformBuild(platform) {
  const platformPath = path.join(process.cwd(), platform);
  if (fs.existsSync(platformPath)) {
    console.log(`🧹 Nettoyage du cache ${platform}...`);
    
    if (platform === 'android') {
      const buildPath = path.join(platformPath, 'build');
      const gradlePath = path.join(platformPath, '.gradle');
      const appBuildPath = path.join(platformPath, 'app', 'build');
      
      [buildPath, gradlePath, appBuildPath].forEach(dirPath => {
        if (fs.existsSync(dirPath)) {
          try {
            fs.rmSync(dirPath, { recursive: true, force: true });
            console.log(`🗑️ Dossier ${dirPath} supprimé`);
          } catch (error) {
            console.log(`⚠️ Impossible de supprimer ${dirPath}:`, error.message);
          }
        }
      });
    } else if (platform === 'ios') {
      const buildPath = path.join(platformPath, 'build');
      const derivedDataPath = path.join(platformPath, 'DerivedData');
      
      [buildPath, derivedDataPath].forEach(dirPath => {
        if (fs.existsSync(dirPath)) {
          try {
            fs.rmSync(dirPath, { recursive: true, force: true });
            console.log(`🗑️ Dossier ${dirPath} supprimé`);
          } catch (error) {
            console.log(`⚠️ Impossible de supprimer ${dirPath}:`, error.message);
          }
        }
      });
    }
  }
}

function ensurePlatform(platform) {
  const platformPath = path.join(process.cwd(), platform);
  
  if (fs.existsSync(platformPath)) {
    console.log(`📱 Plateforme ${platform} détectée, synchronisation...`);
    runCommand(`npx cap sync ${platform}`);
  } else {
    console.log(`📱 Ajout de la plateforme ${platform}...`);
    if (platform === 'ios') {
      console.log('⚠️ Attention: macOS avec Xcode est requis pour iOS');
    }
    runCommand(`npx cap add ${platform}`);
    runCommand(`npx cap sync ${platform}`);
  }
}

switch (command) {
  case 'init':
    console.log(`🚀 Initialisation du projet ${platform}...`);
    
    checkNodeModules();
    checkCapacitorConfig();
    cleanPlatformBuild(platform);
    
    console.log('📦 Reconstruction des assets web...');
    process.env.CAPACITOR_BUILD = 'true';
    runCommand('npm run build');
    console.log('✅ Assets web construits');
    
    ensurePlatform(platform);
    console.log(`✅ Projet ${platform} initialisé avec succès!`);
    break;

  case 'dev':
    console.log(`🔧 Lancement en mode développement ${platform}...`);
    checkNodeModules();
    checkCapacitorConfig();
    cleanPlatformBuild(platform);
    ensureBuild();
    runCommand(`npx cap sync ${platform}`);
    runCommand(`npx cap run ${platform}`);
    break;

  case 'build':
    console.log(`🏗️ Construction pour la production ${platform}...`);
    checkNodeModules();
    checkCapacitorConfig();
    cleanPlatformBuild(platform);
    process.env.CAPACITOR_BUILD = 'true';
    runCommand('npm run build');
    runCommand(`npx cap sync ${platform}`);
    console.log(`✅ Build ${platform} terminé!`);
    break;

  case 'run':
    console.log(`📱 Lancement de l'application ${platform}...`);
    runCommand(`npx cap run ${platform}`);
    break;

  case 'sync':
    console.log(`🔄 Synchronisation des fichiers ${platform}...`);
    ensureBuild();
    runCommand(`npx cap sync ${platform}`);
    console.log('✅ Synchronisation terminée!');
    break;

  case 'open':
    console.log(`🔧 Ouverture de l'IDE natif ${platform}...`);
    runCommand(`npx cap open ${platform}`);
    break;

  case 'clean':
    console.log(`🧹 Nettoyage complet ${platform}...`);
    cleanPlatformBuild(platform);
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      try {
        fs.rmSync(distPath, { recursive: true, force: true });
        console.log('🗑️ Dossier dist supprimé');
      } catch (error) {
        console.log('⚠️ Impossible de supprimer dist:', error.message);
      }
    }
    console.log('✅ Nettoyage terminé!');
    break;

  case 'release':
    console.log(`🚀 Construction pour la release ${platform}...`);
    checkNodeModules();
    checkCapacitorConfig();
    cleanPlatformBuild(platform);
    process.env.CAPACITOR_BUILD = 'true';
    runCommand('npm run build');
    runCommand(`npx cap sync ${platform}`);
    runCommand(`npx cap build ${platform}`);
    console.log(`✅ Release ${platform} prête!`);
    break;

  default:
    console.log('Usage: node scripts/capacitor.js [command] [platform]');
    console.log('Commandes disponibles:');
    console.log('  init [android|ios]     - Initialise le projet');
    console.log('  dev [android|ios]      - Lance en mode développement');
    console.log('  build [android|ios]    - Construit pour la production');
    console.log('  run [android|ios]      - Lance l\'application');
    console.log('  sync [android|ios]     - Synchronise les fichiers');
    console.log('  open [android|ios]     - Ouvre l\'IDE natif');
    console.log('  clean [android|ios]    - Nettoie les builds');
    console.log('  release [android|ios]  - Construit pour la release');
    console.log('');
    console.log('Plateformes supportées: android, ios');
}
