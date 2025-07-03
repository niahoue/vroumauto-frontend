import React, { useEffect, useRef, useState } from 'react';

function PrivacyPolicyPage() {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-4xl mx-auto">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-6 text-center">Politique de Confidentialité</h1>
      <p className="text-gray-600 text-lg leading-relaxed mb-8 text-center">
        Votre vie privée est importante pour nous. Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations personnelles.
      </p>

      <div className="space-y-6 text-gray-700">
        <section>
          <h2 className="text-2xl font-semibold text-gray-700 mb-3">1. Informations que nous collectons</h2>
          <p>
            Nous collectons des informations pour fournir de meilleurs services à tous nos utilisateurs. Les types d'informations que nous collectons dépendent de la manière dont vous utilisez nos services.
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><span className="font-medium">Informations que vous nous donnez directement :</span> Par exemple, lorsque vous créez un compte, remplissez un formulaire de contact ou effectuez un achat. Cela peut inclure votre nom, adresse e-mail, numéro de téléphone, adresse postale et informations de paiement.</li>
            <li><span className="font-medium">Informations que nous obtenons de votre utilisation de nos services :</span> Nous collectons des informations sur les services que vous utilisez et la manière dont vous les utilisez. Cela inclut :
              <ul className="list-circle list-inside ml-4 mt-1 space-y-1">
                <li><span className="font-medium">Informations sur l'appareil :</span> Par exemple, le type d'appareil, le système d'exploitation, les identifiants uniques de l'appareil et les informations sur le réseau mobile.</li>
                <li><span className="font-medium">Informations de journal :</span> Détails sur la manière dont vous utilisez notre service, les requêtes de recherche, l'adresse IP, les informations sur les événements de l'appareil, l'activité du système, les paramètres matériels, le type de navigateur, la langue du navigateur, la date et l'heure de votre requête et l'URL de référence.</li>
                <li><span className="font-medium">Informations de localisation :</span> Nous pouvons collecter et traiter des informations sur votre localisation réelle.</li>
                <li><span className="font-medium">Cookies et technologies similaires :</span> Nous utilisons diverses technologies pour collecter et stocker des informations lorsque vous visitez un service Vroum-Auto, ce qui peut inclure l'envoi d'un ou plusieurs cookies ou d'identificateurs anonymes à votre appareil.</li>
              </ul>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-700 mb-3">2. Comment nous utilisons les informations collectées</h2>
          <p>
            Nous utilisons les informations que nous collectons pour fournir, maintenir, protéger et améliorer nos services, développer de nouveaux services, et protéger Vroum-Auto et nos utilisateurs.
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Pour personnaliser votre expérience (les informations nous aident à mieux répondre à vos besoins individuels).</li>
            <li>Pour améliorer notre site web (nous nous efforçons continuellement d'améliorer nos offres de site web en fonction des informations et des retours que nous recevons de votre part).</li>
            <li>Pour améliorer le service client (vos informations nous aident à répondre plus efficacement à vos demandes de service client et à vos besoins de support).</li>
            <li>Pour traiter les transactions.</li>
            <li>Pour administrer un concours, une promotion, un sondage ou une autre fonctionnalité du site.</li>
            <li>Pour envoyer des e-mails périodiques concernant votre commande ou d'autres produits et services.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-700 mb-3">3. Partage des informations</h2>
          <p>
            Nous ne vendons, n'échangeons ni ne louons vos informations d'identification personnelle à des tiers. Nous pouvons partager des informations démographiques agrégées génériques non liées à des informations d'identification personnelle concernant les visiteurs et les utilisateurs avec nos partenaires commerciaux, nos affiliés de confiance et nos annonceurs aux fins décrites ci-dessus.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-700 mb-3">4. Sécurité des données</h2>
          <p>
            Nous mettons en œuvre une variété de mesures de sécurité pour maintenir la sécurité de vos informations personnelles lorsque vous passez une commande ou accédez à vos informations personnelles.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-700 mb-3">5. Modifications de cette politique de confidentialité</h2>
          <p>
            Vroum-Auto a le pouvoir de mettre à jour cette politique de confidentialité à tout moment. Lorsque nous le ferons, nous réviserons la date de "dernière mise à jour" en bas de cette page. Nous encourageons les utilisateurs à consulter fréquemment cette page pour tout changement afin de rester informés de la manière dont nous contribuons à protéger les informations personnelles que nous collectons. Vous reconnaissez et acceptez qu'il est de votre responsabilité de revoir cette politique de confidentialité périodiquement et de prendre connaissance des modifications.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-700 mb-3">6. Votre acceptation de ces termes</h2>
          <p>
            En utilisant ce site, vous signifiez votre acceptation de cette politique. Si vous n'acceptez pas cette politique, veuillez ne pas utiliser notre site. Votre utilisation continue du site après la publication de modifications de cette politique sera considérée comme votre acceptation de ces modifications.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-700 mb-3">7. Nous contacter</h2>
          <p>
            Si vous avez des questions concernant cette politique de confidentialité, les pratiques de ce site ou vos relations avec ce site, veuillez nous contacter à :
          </p>
          <p className="font-medium mt-2">Vroum-Auto</p>
          <p>contact@Vroum-Auto.ci</p>
          <p>[Numéro de téléphone de contact]</p>
        </section>
      </div>

      <div className="mt-8 text-sm text-gray-500 text-right">
        <p>Dernière mise à jour : 23 Juin 2025</p>
      </div>
    </div>
  );
}

export default PrivacyPolicyPage;
