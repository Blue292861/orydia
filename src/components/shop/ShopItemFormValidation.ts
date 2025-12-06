
import { ShopItem } from '@/types/ShopItem';
import { validateTextLength, validateUrl, validatePrice } from '@/utils/security';

export interface ValidationError {
  field: string;
  message: string;
}

export const validateShopItemForm = (formData: ShopItem): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Validate text length for string fields
  if (typeof formData.name === 'string') {
    if (!validateTextLength(formData.name, 100)) {
      errors.push({
        field: 'name',
        message: 'Le nom doit faire moins de 100 caractères.'
      });
    }
  }

  if (typeof formData.seller === 'string') {
    if (!validateTextLength(formData.seller, 100)) {
      errors.push({
        field: 'seller',
        message: 'Le nom du vendeur doit faire moins de 100 caractères.'
      });
    }
  }

  if (typeof formData.category === 'string') {
    if (!validateTextLength(formData.category, 50)) {
      errors.push({
        field: 'category',
        message: 'La catégorie doit faire moins de 50 caractères.'
      });
    }
  }

  if (typeof formData.description === 'string') {
    if (!validateTextLength(formData.description, 500)) {
      errors.push({
        field: 'description',
        message: 'La description doit faire moins de 500 caractères.'
      });
    }
  }

  if (typeof formData.content === 'string' && formData.content) {
    if (!validateTextLength(formData.content, 2000)) {
      errors.push({
        field: 'content',
        message: 'Le contenu doit faire moins de 2000 caractères.'
      });
    }
  }

  // Validate price based on payment type
  if (formData.paymentType === 'real_money') {
    // For real money, validate realPriceCents
    if (!formData.realPriceCents || formData.realPriceCents <= 0) {
      errors.push({
        field: 'realPriceCents',
        message: 'Le prix en centimes est requis pour les articles en argent réel.'
      });
    } else if (formData.realPriceCents > 100000) {
      errors.push({
        field: 'realPriceCents',
        message: 'Le prix ne peut pas dépasser 1000€ (100000 centimes).'
      });
    }
  } else {
    // For orydors, validate price
    if (typeof formData.price === 'number') {
      if (!validatePrice(formData.price)) {
        errors.push({
          field: 'price',
          message: 'Le prix doit être un nombre entier positif jusqu\'à 1,000,000.'
        });
      }
    }
    if (formData.price <= 0) {
      errors.push({
        field: 'price',
        message: 'Le prix en Orydors doit être supérieur à 0.'
      });
    }
  }

  // Validate URL
  if (typeof formData.imageUrl === 'string' && formData.imageUrl) {
    if (!validateUrl(formData.imageUrl)) {
      errors.push({
        field: 'imageUrl',
        message: 'Veuillez entrer une URL d\'image valide.'
      });
    }
  }

  // Required field validation
  if (!formData.name?.trim()) {
    errors.push({
      field: 'name',
      message: 'Le nom de l\'objet est requis.'
    });
  }

  if (!formData.seller?.trim()) {
    errors.push({
      field: 'seller',
      message: 'Le nom du vendeur est requis.'
    });
  }

  if (!formData.category?.trim()) {
    errors.push({
      field: 'category',
      message: 'La catégorie est requise.'
    });
  }

  if (!formData.description?.trim()) {
    errors.push({
      field: 'description',
      message: 'La description est requise.'
    });
  }

  if (!formData.imageUrl?.trim()) {
    errors.push({
      field: 'imageUrl',
      message: 'L\'URL de l\'image est requise.'
    });
  }

  return errors;
};
