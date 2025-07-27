import * as pdfjsLib from 'pdfjs-dist';

// Configuration de PDF.js pour Vite - utilisation du worker local
try {
  const workerUrl = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url
  ).toString();
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
  console.log('✅ Worker PDF.js configuré avec URL locale:', workerUrl);
} catch (error) {
  // Fallback si l'URL locale ne fonctionne pas
  console.warn('⚠️ Worker local non disponible, utilisation du CDN:', error);
  const fallbackUrl = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
  pdfjsLib.GlobalWorkerOptions.workerSrc = fallbackUrl;
  console.log('🔄 Worker PDF.js configuré avec CDN:', fallbackUrl);
}

interface PDFExtractionResult {
  success: boolean;
  text?: string;
  error?: string;
}

export const extractTextFromPDF = async (file: File): Promise<PDFExtractionResult> => {
  try {
    console.log('🔄 Début de l\'extraction PDF automatique...');
    
    // Convertir le fichier en ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Charger le document PDF
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    console.log(`📄 PDF chargé: ${pdf.numPages} page(s)`);
    
    let fullText = '';
    
    // Extraire le texte de chaque page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Combiner tous les éléments de texte de la page
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
          .trim();
        
        if (pageText) {
          fullText += pageText + '\n\n';
        }
        
        console.log(`✅ Page ${pageNum}/${pdf.numPages} extraite`);
      } catch (pageError) {
        console.error(`❌ Erreur page ${pageNum}:`, pageError);
        // Continuer avec les autres pages même si une page échoue
      }
    }
    
    if (!fullText.trim()) {
      return {
        success: false,
        error: 'Aucun texte extractible trouvé dans le PDF. Le PDF pourrait contenir uniquement des images ou être protégé.'
      };
    }
    
    // Nettoyer le texte extrait
    const cleanedText = fullText
      .replace(/\s+/g, ' ') // Remplacer les espaces multiples par un seul
      .replace(/\n\s*\n/g, '\n\n') // Nettoyer les sauts de ligne multiples
      .trim();
    
    console.log(`🎉 Extraction terminée: ${cleanedText.length} caractères`);
    
    return {
      success: true,
      text: cleanedText
    };
    
  } catch (error) {
    console.error('💥 Erreur lors de l\'extraction PDF:', error);
    
    let errorMessage = 'Erreur inconnue lors de l\'extraction';
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid PDF')) {
        errorMessage = 'Le fichier PDF est invalide ou corrompu';
      } else if (error.message.includes('Password')) {
        errorMessage = 'Le PDF est protégé par mot de passe';
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Erreur de réseau lors du chargement du PDF';
      } else {
        errorMessage = error.message;
      }
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

export const validatePDFFile = (file: File): { valid: boolean; error?: string } => {
  // Vérifier le type MIME
  if (!file.type.includes('pdf')) {
    return {
      valid: false,
      error: 'Le fichier doit être un PDF'
    };
  }
  
  // Vérifier la taille (max 25MB comme défini dans FileImport)
  const maxSize = 25 * 1024 * 1024; // 25MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Le fichier est trop volumineux (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum autorisé: 25MB`
    };
  }
  
  return { valid: true };
};