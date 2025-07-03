// src/AboutPage.jsx
import React from 'react';

const AboutPage = () => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-4xl mx-auto">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-6 text-center">À propos de Vroum-Auto</h1>
      <p className="text-gray-600 text-lg leading-relaxed mb-8 text-center">
        Nous sommes votre partenaire de confiance pour l'achat et la location de véhicules d'occasion en Côte d'Ivoire.
      </p>

      <div className="space-y-10">
        <section>
          <h2 className="text-3xl font-semibold text-gray-700 mb-4">Notre Mission</h2>
          <p className="text-gray-700 leading-relaxed">
            Vroum-Auto s'engage à offrir une expérience transparente et fiable pour l'acquisition et la location de véhicules d'occasion de qualité supérieure. Nous croyons que trouver la voiture parfaite devrait être simple, agréable et sans stress. Notre mission est de construire une communauté de clients satisfaits en offrant un service exceptionnel et des véhicules qui répondent à toutes les attentes.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-semibold text-gray-700 mb-4">Notre Histoire</h2>
          <p className="text-gray-700 leading-relaxed">
            Fondée en [Année de fondation] par une équipe de passionnés de l'automobile avec une profonde connaissance du marché ivoirien, Vroum-Auto est née de la volonté de combler le fossé entre les acheteurs et les vendeurs de véhicules d'occasion. Nous avons commencé petit, mais grâce à notre dévouement à la qualité et à la satisfaction client, nous sommes rapidement devenus une référence dans le secteur.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-semibold text-gray-700 mb-4">Nos Valeurs</h2>
          <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
            <li><span className="font-medium text-blue-700">Transparence :</span> Des informations claires et honnêtes sur tous nos véhicules.</li>
            <li><span className="font-medium text-blue-700">Qualité :</span> Chaque véhicule est inspecté pour garantir sa fiabilité.</li>
            <li><span className="font-medium text-blue-700">Confiance :</span> Bâtir des relations durables basées sur l'intégrité et le respect.</li>
            <li><span className="font-medium text-blue-700">Innovation :</span> Améliorer constamment nos services grâce aux nouvelles technologies.</li>
            <li><span className="font-medium text-blue-700">Client :</span> Mettre nos clients au centre de toutes nos décisions.</li>
          </ul>
        </section>

        <section className="text-center">
          <h2 className="text-3xl font-semibold text-gray-700 mb-6">Notre Équipe</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Exemple de membre de l'équipe */}
            <div className="flex flex-col items-center p-6 bg-blue-50 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
              <img src="https://placehold.co/120x120/E0E7FF/3730A3?text=Photo" alt="Membre de l'équipe" className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-blue-600" />
              <h3 className="text-xl font-bold text-gray-800">Nom du Fondateur</h3>
              <p className="text-blue-700 font-medium">PDG & Fondateur</p>
              <p className="text-gray-600 text-sm mt-2">Passionné d'automobile avec plus de 20 ans d'expérience dans l'industrie.</p>
            </div>
            {/* Répétez pour d'autres membres de l'équipe */}
            <div className="flex flex-col items-center p-6 bg-purple-50 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
              <img src="https://placehold.co/120x120/EDE9FE/6D28D9?text=Photo" alt="Membre de l'équipe" className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-purple-600" />
              <h3 className="text-xl font-bold text-gray-800">Nom du Responsable</h3>
              <p className="text-purple-700 font-medium">Directeur des Opérations</p>
              <p className="text-gray-600 text-sm mt-2">Expert en logistique et en gestion de flotte.</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-green-50 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
              <img src="https://placehold.co/120x120/D1FAE5/15803D?text=Photo" alt="Membre de l'équipe" className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-green-600" />
              <h3 className="text-xl font-bold text-gray-800">Nom du Conseiller</h3>
              <p className="text-green-700 font-medium">Conseiller Clientèle Senior</p>
              <p className="text-gray-600 text-sm mt-2">Dédié à l'accompagnement des clients pour trouver la meilleure solution.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
