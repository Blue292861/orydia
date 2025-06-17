
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const command = process.argv[2];

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

function cleanAndroidBuild() {
  const androidPath = path.join(process.cwd(), 'android');
  if (fs.existsSync(androidPath)) {
    console.log('🧹 Nettoyage du cache Android...');
    
    const buildPath = path.join(androidPath, 'build');
    if (fs.existsSync(buildPath)) {
      try {
        fs.rmSync(buildPath, { recursive: true, force: true });
        console.log('🗑️ Dossier android/build supprimé');
      } catch (error) {
        console.log('⚠️ Impossible de supprimer android/build:', error.message);
      }
    }
    
    const gradlePath = path.join(androidPath, '.gradle');
    if (fs.existsSync(gradlePath)) {
      try {
        fs.rmSync(gradlePath, { recursive: true, force: true });
        console.log('🗑️ Dossier android/.gradle supprimé');
      } catch (error) {
        console.log('⚠️ Impossible de supprimer android/.gradle:', error.message);
      }
    }
    
    const appBuildPath = path.join(androidPath, 'app', 'build');
    if (fs.existsSync(appBuildPath)) {
      try {
        fs.rmSync(appBuildPath, { recursive: true, force: true });
        console.log('🗑️ Dossier android/app/build supprimé');
      } catch (error) {
        console.log('⚠️ Impossible de supprimer android/app/build:', error.message);
      }
    }
  }
}

function ensureAndroidPlatform() {
  const androidPath = path.join(process.cwd(), 'android');
  
  if (fs.existsSync(androidPath)) {
    console.log('📱 Plateforme Android détectée, synchronisation...');
    runCommand('npx cap sync android');
  } else {
    console.log('📱 Ajout de la plateforme Android...');
    runCommand('npx cap add android');
    runCommand('npx cap sync android');
  }
}

switch (command) {
  case 'init':
    console.log('🚀 Initialisation du projet Android...');
    
    checkNodeModules();
    checkCapacitorConfig();
    cleanAndroidBuild();
    
    console.log('📦 Reconstruction des assets web pour Android...');
    process.env.CAPACITOR_BUILD = 'true';
    runCommand('npm run build');
    console.log('✅ Assets web construits sans compression');
    
    ensureAndroidPlatform();
    console.log('✅ Projet Android initialisé avec succès!');
    break;

  case 'dev':
    console.log('🔧 Lancement en mode développement...');
    checkNodeModules();
    checkCapacitorConfig();
    cleanAndroidBuild();
    ensureBuild();
    runCommand('npx cap sync android');
    runCommand('npx cap run android');
    break;

  case 'build':
    console.log('🏗️ Construction pour la production...');
    checkNodeModules();
    checkCapacitorConfig();
    cleanAndroidBuild();
    process.env.CAPACITOR_BUILD = 'true';
    runCommand('npm run build');
    runCommand('npx cap sync android');
    console.log('✅ Build Android terminé!');
    break;

  case 'run':
    console.log('📱 Lancement de l\'application Android...');
    runCommand('npx cap run android');
    break;

  case 'sync':
    console.log('🔄 Synchronisation des fichiers...');
    ensureBuild();
    runCommand('npx cap sync android');
    console.log('✅ Synchronisation terminée!');
    break;

  case 'clean':
    console.log('🧹 Nettoyage complet...');
    cleanAndroidBuild();
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
    console.log('🚀 Construction pour la release...');
    checkNodeModules();
    checkCapacitorConfig();
    cleanAndroidBuild();
    process.env.CAPACITOR_BUILD = 'true';
    runCommand('npm run build');
    runCommand('npx cap sync android');
    runCommand('npx cap build android');
    console.log('✅ Release Android prête!');
    break;

  default:
    console.log('Usage: npm run android:[command]');
    console.log('Commandes disponibles:');
    console.log('  init     - Initialise le projet Android');
    console.log('  dev      - Lance en mode développement');
    console.log('  build    - Construit pour la production');
    console.log('  run      - Lance l\'application');
    console.log('  sync     - Synchronise les fichiers');
    console.log('  clean    - Nettoie les builds');
    console.log('  release  - Construit pour la release');
}
