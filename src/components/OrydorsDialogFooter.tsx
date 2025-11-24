import React from 'react';

export const OrydorsDialogFooter: React.FC = () => {
  return (
    <div className="text-center text-sm text-muted-foreground p-4 bg-wood-100 rounded-lg border border-wood-300">
      <p className="font-serif">
        💳 Paiement sécurisé via Stripe
      </p>
      <p className="text-xs mt-2 font-serif">
        Les Orydors sont une monnaie virtuelle utilisable uniquement dans l'application Orydia.
        <br />
        Aucun remboursement possible après l'achat.
      </p>
    </div>
  );
};
