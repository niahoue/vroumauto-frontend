// src/Footer.jsx
import React from 'react';

// Le composant Footer prend `navigateTo` en prop
const Footer = ({ navigateTo }) => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-12 rounded-t-lg">
      <div className="container mx-auto text-center text-gray-400">
        <p className="text-sm md:text-base">&copy; {new Date().getFullYear()} Vroum-Auto. Tous droits réservés.</p>
        <p className="text-sm md:text-base">Vroum-Auto est la propriété exclusive de Webklor sarl </p>
        <p className="mt-2 text-xs">Conçu avec passion en Côte d'Ivoire.</p>
        {/* Navigation des liens du footer */}
        <div className="flex justify-center space-x-4 mt-4">
          <a
            href="#"
            onClick={() => navigateTo('politique-confidentialite')} // Navigue vers la page de politique de confidentialité
            className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
          >
            Politique de Confidentialité
          </a>
          <span className="text-gray-600">|</span>
          <a
            href="#"
            onClick={() => navigateTo('conditions-generales')} // Navigue vers la page des conditions générales
            className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
          >
            Conditions Générales
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;