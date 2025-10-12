
import { Book } from '@/types/Book';
import { sanitizeText, sanitizeTextWithSpaces, validateTextLength, validateUrl, validatePoints } from '@/utils/security';

export const validateBook = (book: Book): string[] => {
  const errors: string[] = [];

  if (!book.title || !validateTextLength(book.title, 200)) {
    errors.push('Le titre est requis et doit faire moins de 200 caractères');
  }

  if (!book.author || !validateTextLength(book.author, 100)) {
    errors.push('L\'auteur est requis et doit faire moins de 100 caractères');
  }

  if (!book.coverUrl || !validateUrl(book.coverUrl)) {
    errors.push('URL de couverture invalide');
  }

  // Content is only required if chapters system is not used
  if (!book.hasChapters && (!book.content || !validateTextLength(book.content, 1200000))) {
    errors.push('Le contenu est requis et doit faire moins de 1 200 000 caractères');
  }

  if (!validatePoints(book.points)) {
    errors.push('Les points doivent être un nombre entier entre 0 et 100 000');
  }

  return errors;
};

export const sanitizeBook = (book: Book): Book => ({
  ...book,
  title: sanitizeTextWithSpaces(book.title),
  author: sanitizeTextWithSpaces(book.author),
  content: sanitizeText(book.content),
  tags: book.tags.map(tag => sanitizeText(tag)).filter(tag => tag.length > 0),
});
