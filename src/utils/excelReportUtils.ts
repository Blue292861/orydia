
import * as XLSX from 'xlsx';
import { Book } from '@/types/Book';

export const generateMonthlyReport = (
  books: Book[],
  monthlyBookReadCounts: Record<string, number>,
  bookReadCounts: Record<string, number>
) => {
  // Préparer les données pour Excel
  const excelData = books.map(book => ({
    'Nom de l\'œuvre': book.title,
    'Nom de l\'auteur': book.author,
    'Vues ce mois-ci': monthlyBookReadCounts[book.id] || 0,
    'Vues totales': bookReadCounts[book.id] || 0
  }));

  // Créer le workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelData);

  // Ajuster la largeur des colonnes
  const colWidths = [
    { wch: 30 }, // Nom de l'œuvre
    { wch: 20 }, // Nom de l'auteur
    { wch: 15 }, // Vues ce mois-ci
    { wch: 15 }  // Vues totales
  ];
  ws['!cols'] = colWidths;

  // Ajouter la feuille au workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Statistiques Mensuelles');

  // Générer le nom du fichier avec la date actuelle
  const currentDate = new Date();
  const monthYear = `${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`;
  const fileName = `statistiques-lecture-${monthYear}.xlsx`;

  // Télécharger le fichier
  XLSX.writeFile(wb, fileName);
};
