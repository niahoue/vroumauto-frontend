// src/utils/helpers.js

export const formatPrice = (price) => {
  if (typeof price !== 'number' || isNaN(price)) return 'N/A';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF', // Franc CFA (Afrique de l'Ouest)
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};
