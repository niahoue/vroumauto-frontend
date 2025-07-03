// src/components/Modal.jsx
import React from 'react';

// Le composant Modal prend des props pour son affichage et son contenu
const Modal = ({ show, title, message, onClose, type = 'info', onConfirm, confirmText = 'Confirmer', cancelText = 'Annuler' }) => {
  if (!show) {
    return null; // Ne rend rien si la modale n'est pas visible
  }

  // Couleurs de fond et de bordure de la modale en fonction du type
  const modalColors = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800', // Nouveau type pour les avertissements/confirmations
    danger: 'bg-red-50 border-red-200 text-red-800', // Alias pour 'error' ou pour confirmations critiques
  };
  const buttonColors = {
    info: 'bg-blue-600 hover:bg-blue-700',
    success: 'bg-green-600 hover:bg-green-700',
    error: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    danger: 'bg-red-600 hover:bg-red-700',
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose(); // Ferme toujours la modale après confirmation
  };

  return (
    // Overlay de fond semi-transparent pour assombrir le reste de la page
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Conteneur de la modale */}
      <div
        className={`relative rounded-lg shadow-xl p-8 w-full max-w-md transform transition-all duration-300 ease-out scale-100 ${modalColors[type]} border`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Bouton de fermeture de la modale */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Fermer la modale"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>

        {/* Titre de la modale */}
        <h2 id="modal-title" className="text-2xl font-bold mb-4 text-center">
          {title}
        </h2>
        {/* Message de la modale */}
        <p className="text-gray-700 text-center mb-6">
          {message}
        </p>

        {/* Bouton(s) d'action */}
        <div className="flex justify-center space-x-4">
          {onConfirm && ( // Affiche le bouton "Annuler" uniquement si onConfirm est fourni
            <button
              onClick={onClose}
              className="bg-gray-300 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors duration-200 font-semibold"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm ? handleConfirm : onClose} // Si onConfirm existe, utilise handleConfirm, sinon onClose (pour les infos/erreurs simples)
            className={`${buttonColors[type]} text-white px-6 py-2 rounded-md transition-colors duration-200 font-semibold`}
          >
            {onConfirm ? confirmText : 'OK'} {/* Texte du bouton en fonction de la présence de onConfirm */}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
