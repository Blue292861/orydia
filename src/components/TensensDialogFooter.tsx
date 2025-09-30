
import React from 'react';

export const TensensDialogFooter: React.FC = () => {
  return (
    <div className="mt-6 p-4 bg-gradient-to-r from-forest-100 via-forest-50 to-forest-100 rounded-lg border border-forest-300 parchment-texture">
      <p className="text-sm text-center text-forest-700 font-serif">
        🛡️ Paiement sécurisé par les mages de Stripe • 🔐 Vos secrets sont protégés par magie ancienne • ⚡ Tensens transférés instantanément dans votre bourse
      </p>
    </div>
  );
};
