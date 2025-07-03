import React, { useEffect, useRef, useState } from 'react';

function TermsAndConditionsPage() {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-4xl mx-auto">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-6 text-center">Conditions Générales de Vente et d'Utilisation</h1>
      <p className="text-gray-600 text-lg leading-relaxed mb-8 text-center">
        Ces conditions générales régissent votre utilisation de notre site web et nos services.
      </p>

      <div className="space-y-6 text-gray-700">
        <section>
          <h2 className="text-2xl font-semibold text-gray-700 mb-3">1. Acceptation des Conditions</h2>
          <p>
            En accédant ou en utilisant le site web Vroum-Auto et ses services, vous reconnaissez avoir lu, compris et accepté d'être lié par ces Conditions Générales, ainsi que par notre Politique de Confidentialité. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser notre site web ou nos services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-700 mb-3">2. Services Proposés</h2>
          <p>Vroum-Auto propose les services suivants :</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><span className="font-medium">Vente de véhicules d'occasion :</span> Mise en relation entre acheteurs et vendeurs de véhicules d'occasion certifiés.</li>
            <li><span className="font-medium">Location de véhicules d'occasion :</span> Offre de véhicules à la location pour des durées courtes ou longues.</li>
            <li><span className="font-medium">Services connexes :</span> Assistance au financement, inspection de véhicules, etc.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-700 mb-3">3. Obligations de l'Utilisateur</h2>
          <p>
            En utilisant nos services, vous vous engagez à :
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Fournir des informations exactes et à jour lors de l'inscription et de l'utilisation des services.</li>
            <li>Respecter toutes les lois et réglementations applicables.</li>
            <li>Ne pas utiliser le site à des fins illégales ou non autorisées.</li>
            <li>Maintenir la confidentialité de vos informations de connexion.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-700 mb-3">4. Responsabilité</h2>
          <p>
            Vroum-Auto s'efforce d'assurer l'exactitude des informations diffusées sur le site, mais ne peut garantir que les informations sont complètes, précises et à jour. Vroum-Auto ne saurait être tenue pour responsable des erreurs ou omissions, ni des dommages directs ou indirects résultant de l'accès ou de l'utilisation du site et des informations qui y sont disponibles.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-700 mb-3">5. Propriété Intellectuelle</h2>
          <p>
            Tous les contenus présents sur le site Vroum-Auto (textes, images, graphismes, logos, icônes, sons, logiciels, etc.) sont la propriété exclusive de Vroum-Auto ou de ses partenaires, et sont protégés par les lois ivoiriennes et internationales relatives à la propriété intellectuelle. Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de Vroum-Auto.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-700 mb-3">6. Modifications des Conditions Générales</h2>
          <p>
            Vroum-Auto se réserve le droit de modifier ces Conditions Générales à tout moment. Les modifications prendront effet dès leur publication sur le site web. Il est de votre responsabilité de consulter régulièrement ces conditions pour rester informé des mises à jour. Votre utilisation continue du site après la publication des modifications constitue votre acceptation des nouvelles conditions.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-700 mb-3">7. Droit Applicable et Juridiction Compétente</h2>
          <p>
            Ces Conditions Générales sont régies par le droit ivoirien. Tout litige relatif à l'interprétation ou à l'exécution de ces conditions sera soumis à la juridiction exclusive des tribunaux compétents d'Abidjan, Côte d'Ivoire.
          </p>
        </section>
      </div>

      <div className="mt-8 text-sm text-gray-500 text-right">
        <p>Dernière mise à jour : 23 Juin 2025</p>
      </div>
    </div>
  );
}

export default TermsAndConditionsPage;
