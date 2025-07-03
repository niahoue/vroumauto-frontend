// src/pages/contactPage.jsx
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react'; // <-- Assurez-vous que Loader2 est importé ici

const ContactPage = ({ showModal, navigateTo, initialValues }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  const API_BASE_URL = 'http://localhost:5000/api'; // Assurez-vous que c'est le bon port de votre backend

  useEffect(() => {
    if (initialValues) {
      setFormData(prev => ({
        ...prev,
        ...initialValues
      }));
    }
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setLocalError(null); // Clear errors on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Active le chargement
    setLocalError(null); // Réinitialise les erreurs

    // Simple client-side validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setLocalError('Veuillez remplir tous les champs obligatoires.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/contact`, { // Appel à la nouvelle route de contact
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const textResponse = await response.text(); // Lire la réponse comme texte d'abord

      let data;
      try {
        data = JSON.parse(textResponse); // Tenter de parser comme JSON
      } catch (jsonParseError) {
        // Si le parsing JSON échoue, cela signifie que la réponse n'était pas JSON
        console.error("Erreur de parsing JSON de la réponse backend:", jsonParseError);
        console.error("Contenu qui n'est pas JSON:", textResponse.substring(0, 200) + "..."); // Affiche le début de la réponse pour débogage
        setLocalError('Le serveur n\'a pas renvoyé une réponse valide. Veuillez contacter l\'administrateur.');
        showModal('Erreur Serveur', 'Le format de la réponse du serveur est incorrect. Veuillez contacter le support.', 'error');
        setLoading(false);
        return; // Arrêter l'exécution ici
      }


      if (response.ok) {
        showModal('Message Envoyé', data.msg || 'Votre message a été envoyé avec succès !', 'success');
        setFormData({ name: '', email: '', subject: '', message: '' }); // Réinitialiser le formulaire
      } else {
        setLocalError(data.msg || 'Échec de l\'envoi du message.');
        showModal('Erreur d\'Envoi', data.msg || 'Impossible d\'envoyer votre message.', 'error');
      }
    } catch (apiError) {
      console.error('Erreur réseau ou serveur lors de l\'envoi du message:', apiError);
      setLocalError('Erreur réseau. Impossible de se connecter au serveur.');
      showModal('Erreur Réseau', 'Impossible de se connecter au serveur. Veuillez vérifier votre connexion.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-4xl mx-auto">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-6 text-center">Contactez-nous</h1>
      <p className="text-gray-600 text-lg mb-8 text-center">
        Nous sommes là pour répondre à toutes vos questions. N'hésitez pas à nous envoyer un message.
      </p>

      {localError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Erreur !</strong>
          <span className="block sm:inline"> {localError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Votre Nom</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Jean Dupont"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Votre Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="votre.email@exemple.com"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="subject" className="block text-gray-700 text-sm font-bold mb-2">Sujet</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Sujet de votre message"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-gray-700 text-sm font-bold mb-2">Votre Message</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="5"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-y"
            placeholder="Écrivez votre message ici..."
            required
            disabled={loading}
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-lg text-lg font-semibold transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="animate-spin h-5 w-5 mr-3" />
          ) : (
            'Envoyer le Message'
          )}
        </button>
      </form>

      <div className="mt-10 text-center">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Nos Coordonnées</h2>
        <p className="text-gray-700">
          **Adresse:** 70 Rue des Balances Marcory, Abidjan, Côte d'Ivoire
        </p>
        <p className="text-gray-700 mt-2">
          **Téléphone:** +225 01 61 55 65 09
        </p>
        <p className="text-gray-700 mt-2">
          **Email:** vroumauto225@gmail.com
        </p>

        <div className="mt-6">
          {/* Placeholder pour la carte (vous pouvez intégrer Google Maps ici) */}
          <div className="bg-gray-200 h-64 w-full rounded-lg flex items-center justify-center text-gray-500 text-sm italic">
            Placeholder pour la carte de localisation
          </div>
        </div>

        <div className="mt-6 text-xl space-x-6">
          <a href="#" className="text-gray-600 hover:text-blue-600"><i className="fab fa-facebook"></i></a>
          <a href="#" className="text-gray-600 hover:text-blue-400"><i className="fab fa-twitter"></i></a>
          <a href="#" className="text-gray-600 hover:text-red-600"><i className="fab fa-instagram"></i></a>
          <a href="#" className="text-gray-600 hover:text-blue-800"><i className="fab fa-linkedin"></i></a>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
