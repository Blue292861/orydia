import ePub from 'epubjs';

async function extractTextFromEpub(epubUrl: string): Promise<string> {
  try {
    const book = ePub(epubUrl);
    await book.ready;
    const allText: string[] = [];

    // Accéder au contenu par les sections du livre
    for (const item of book.spine.items) {
      const chapter = await item.load(book.loaded.resources);
      const text = chapter.body.textContent || '';
      allText.push(text);
    }

    // Joindre le texte des chapitres
    return allText.join('\n\n');
  } catch (error) {
    console.error("Erreur lors de l'extraction de texte de l'EPUB:", error);
    return '';
  }
}

// Utilisation (à adapter selon vos besoins)
// const extractedContent = await extractTextFromEpub('chemin/vers/votre/fichier.epub');
// console.log(extractedContent);
