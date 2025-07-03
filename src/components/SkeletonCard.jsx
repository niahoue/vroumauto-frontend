// src/components/SkeletonCard.jsx
import React from 'react';

// Composant SkeletonCard pour simuler le chargement d'une carte de véhicule.
// Il utilise des classes Tailwind pour créer des "blocs" gris animés,
// donnant une indication visuelle que le contenu arrive bientôt.
const SkeletonCard = () => {
  return (
    <div className="flex-none w-72 sm:w-80 md:w-96 snap-center bg-white rounded-xl shadow-lg overflow-hidden relative">
      {/* Zone de l'image (simulée) */}
      <div className="w-full h-48 bg-gray-200 animate-pulse"></div>

      {/* Zone de contenu du texte */}
      <div className="p-4">
        {/* Ligne pour le titre/nom du véhicule */}
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
        {/* Ligne pour la marque/modèle */}
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4 animate-pulse"></div>
        {/* Ligne pour le prix/taux */}
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
        {/* Ligne pour le bouton */}
        <div className="h-10 bg-gray-200 rounded-md w-full animate-pulse"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;
