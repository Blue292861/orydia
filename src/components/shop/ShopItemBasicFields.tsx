
import React from 'react';
import { ShopItem, PaymentType } from '@/types/ShopItem';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Store, ExternalLink, Coins, CreditCard } from 'lucide-react';

interface ShopItemBasicFieldsProps {
  formData: ShopItem;
  onFieldChange: (field: keyof ShopItem, value: string | number | undefined) => void;
}

export const ShopItemBasicFields: React.FC<ShopItemBasicFieldsProps> = ({ formData, onFieldChange }) => {
  const isRealMoney = formData.paymentType === 'real_money';

  return (
    <>
      <div>
        <Label htmlFor="shopType" className="flex items-center gap-2">
          <Store className="h-4 w-4" />
          Type de boutique
        </Label>
        <Select 
          value={formData.shopType} 
          onValueChange={(value: 'internal' | 'external') => onFieldChange('shopType', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez le type de boutique" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="internal">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4" />
                Boutique Orydia
              </div>
            </SelectItem>
            <SelectItem value="external">
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Oryshop (externe)
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="paymentType" className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Type de paiement
        </Label>
        <Select 
          value={formData.paymentType} 
          onValueChange={(value: PaymentType) => {
            onFieldChange('paymentType', value);
            // Reset prices when changing payment type
            if (value === 'orydors') {
              onFieldChange('realPriceCents', undefined);
            } else {
              onFieldChange('price', 0);
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez le type de paiement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="orydors">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-amber-500" />
                Orydors (monnaie virtuelle)
              </div>
            </SelectItem>
            <SelectItem value="real_money">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-green-500" />
                Argent réel (€ via Stripe)
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          {isRealMoney 
            ? 'Cet article sera payable uniquement en euros via Stripe' 
            : 'Cet article sera payable avec les Orydors gagnés en lisant'
          }
        </p>
      </div>

      <div>
        <Label htmlFor="name">Nom de l'objet</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onFieldChange('name', e.target.value)}
          maxLength={100}
          required
        />
      </div>

      <div>
        <Label htmlFor="seller">Nom du vendeur</Label>
        <Input
          id="seller"
          value={formData.seller}
          onChange={(e) => onFieldChange('seller', e.target.value)}
          maxLength={100}
          required
        />
      </div>

      <div>
        <Label htmlFor="category">Catégorie</Label>
        <Input
          id="category"
          value={formData.category}
          onChange={(e) => onFieldChange('category', e.target.value)}
          maxLength={50}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onFieldChange('description', e.target.value)}
          maxLength={500}
          required
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="content">Contenu détaillé</Label>
        <Textarea
          id="content"
          value={formData.content || ''}
          onChange={(e) => onFieldChange('content', e.target.value)}
          maxLength={2000}
          placeholder="Contenu détaillé de l'objet (optionnel)"
          rows={5}
        />
      </div>

      {isRealMoney ? (
        <div>
          <Label htmlFor="realPriceCents" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-green-500" />
            Prix en centimes (€)
          </Label>
          <Input
            id="realPriceCents"
            type="number"
            min="1"
            max="100000"
            placeholder="Ex: 299 pour 2,99€"
            value={formData.realPriceCents || ''}
            onChange={(e) => onFieldChange('realPriceCents', parseInt(e.target.value) || undefined)}
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            Entrez le prix en centimes. Ex: 299 = 2,99€ | 85 = 0,85€
          </p>
          {formData.realPriceCents && formData.realPriceCents > 0 && (
            <p className="text-sm text-green-600 font-medium mt-1">
              Prix affiché : {(formData.realPriceCents / 100).toFixed(2)}€
            </p>
          )}
        </div>
      ) : (
        <div>
          <Label htmlFor="price" className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-amber-500" />
            Prix (Orydors)
          </Label>
          <Input
            id="price"
            type="number"
            min="1"
            max="1000000"
            value={formData.price}
            onChange={(e) => onFieldChange('price', parseInt(e.target.value) || 0)}
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            Prix en Orydors pour la boutique Orydia
          </p>
        </div>
      )}

      <div>
        <Label htmlFor="requiredLevel" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Niveau requis (optionnel)
        </Label>
        <Input
          id="requiredLevel"
          type="number"
          min="1"
          max="50"
          placeholder="1"
          value={formData.requiredLevel || ''}
          onChange={(e) => onFieldChange('requiredLevel', e.target.value ? parseInt(e.target.value) : undefined)}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Niveau minimum pour acheter cet article (1-50)
        </p>
      </div>
    </>
  );
};
