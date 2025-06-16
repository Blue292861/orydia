
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
    runCommand('npm run build');
  } else {
    console.log('✅ Assets web trouvés dans dist/');
  }
}

switch (command) {
  case 'init':
    console.log('🚀 Initialisation du projet Android...');
    
    // Vérifier que les dépendances sont installées
    checkNodeModules();
    
    // Vérifier la configuration Capacitor
    checkCapacitorConfig();
    
    // S'assurer que les assets web sont construits
    ensureBuild();
    
    // Ajouter la plateforme Android
    runCommand('npx cap add android');
    runCommand('npx cap sync android');
    console.log('✅ Projet Android initialisé avec succès!');
    break;

  case 'dev':
    console.log('🔧 Lancement en mode développement...');
    checkNodeModules();
    checkCapacitorConfig();
    ensureBuild();
    runCommand('npx cap sync android');
    runCommand('npx cap run android');
    break;

  case 'build':
    console.log('🏗️ Construction pour la production...');
    checkNodeModules();
    checkCapacitorConfig();
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

  case 'release':
    console.log('🚀 Construction pour la release...');
    checkNodeModules();
    checkCapacitorConfig();
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
    console.log('  release  - Construit pour la release');
}
