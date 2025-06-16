
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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
    console.error('Fichier capacitor.config.ts non trouvé. Veuillez d\'abord initialiser Capacitor.');
    process.exit(1);
  }
}

switch (command) {
  case 'init':
    console.log('🚀 Initialisation du projet Android...');
    checkCapacitorConfig();
    runCommand('npx cap add android');
    runCommand('npx cap sync android');
    console.log('✅ Projet Android initialisé avec succès!');
    break;

  case 'dev':
    console.log('🔧 Lancement en mode développement...');
    checkCapacitorConfig();
    runCommand('npm run build');
    runCommand('npx cap sync android');
    runCommand('npx cap run android');
    break;

  case 'build':
    console.log('🏗️ Construction pour la production...');
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
    runCommand('npx cap sync android');
    console.log('✅ Synchronisation terminée!');
    break;

  case 'release':
    console.log('🚀 Construction pour la release...');
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
