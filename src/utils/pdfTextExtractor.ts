interface PDFExtractionResult {
  success: boolean;
  text?: string;
  error?: string;
}

export const extractTextFromPDF = async (file: File): Promise<PDFExtractionResult> => {
  try {
    console.log('🔄 Début de l\'extraction PDF avec solution alternative...');
    
    // Créer un FormData pour envoyer le PDF à un service d'extraction
    const formData = new FormData();
    formData.append('file', file);
    
    // Utiliser l'API de Mozilla PDF.js via CDN en mode direct
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = async function(event) {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          
          // Charger PDF.js dynamiquement depuis CDN
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js';
          
          script.onload = async () => {
            try {
              // @ts-ignore - PDF.js sera disponible globalement
              const pdfjsLib = window.pdfjsLib;
              pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
              
              console.log('📚 PDF.js chargé dynamiquement');
              
              const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
              console.log(`📄 PDF chargé: ${pdf.numPages} page(s)`);
              
              let fullText = '';
              
              for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                try {
                  const page = await pdf.getPage(pageNum);
                  const textContent = await page.getTextContent();
                  
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
                }
              }
              
              if (!fullText.trim()) {
                resolve({
                  success: false,
                  error: 'Aucun texte extractible trouvé dans le PDF'
                });
                return;
              }
              
              const cleanedText = fullText
                .replace(/\s+/g, ' ')
                .replace(/\n\s*\n/g, '\n\n')
                .trim();
              
              console.log(`🎉 Extraction terminée: ${cleanedText.length} caractères`);
              
              resolve({
                success: true,
                text: cleanedText
              });
              
            } catch (error) {
              console.error('💥 Erreur PDF.js dynamique:', error);
              resolve({
                success: false,
                error: 'Erreur lors de l\'extraction avec PDF.js'
              });
            }
          };
          
          script.onerror = () => {
            console.error('💥 Impossible de charger PDF.js');
            resolve({
              success: false,
              error: 'Impossible de charger la bibliothèque PDF.js'
            });
          };
          
          document.head.appendChild(script);
          
        } catch (error) {
          console.error('💥 Erreur lecture fichier:', error);
          resolve({
            success: false,
            error: 'Erreur lors de la lecture du fichier PDF'
          });
        }
      };
      
      reader.onerror = () => {
        resolve({
          success: false,
          error: 'Erreur lors de la lecture du fichier'
        });
      };
      
      reader.readAsArrayBuffer(file);
    });
    
  } catch (error) {
    console.error('💥 Erreur générale:', error);
    return {
      success: false,
      error: 'Erreur technique lors du traitement du PDF'
    };
  }
};

export const validatePDFFile = (file: File): { valid: boolean; error?: string } => {
  if (!file.type.includes('pdf')) {
    return {
      valid: false,
      error: 'Le fichier doit être un PDF'
    };
  }
  
  const maxSize = 25 * 1024 * 1024; // 25MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Le fichier est trop volumineux (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum autorisé: 25MB`
    };
  }
  
  return { valid: true };
};