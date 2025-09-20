// src/utils/urlUtils.ts
export const isUrl = (str: string): boolean => {
  try {
    // Vérifie si la chaîne de caractères est une URL valide
    new URL(str);
    return true;
  } catch (_) {
    return false;
  }
};
