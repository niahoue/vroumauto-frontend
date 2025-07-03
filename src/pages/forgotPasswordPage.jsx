// src/pages/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react'; // Pour le spinner de chargement

// Le composant ForgotPasswordPage prend `showModal` et `navigateTo` en props
const ForgotPasswordPage = ({ showModal, navigateTo }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null); // Pour les erreurs de validation côté client

  // URL de base de votre API backend
  const API_BASE_URL = 'http://localhost:5000/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null); // Réinitialise les erreurs locales

    // Validation simple de l'email
    if (!email) {
      setLocalError('Veuillez entrer votre adresse email.');
      setLoading(false);
      return;
    }
    // Simple validation de format d'email
    if (!/\S+@\S+\.\S+/.test(email)) {
      setLocalError('Veuillez entrer une adresse email valide.');
      setLoading(false);
      return;
    }

    try {
      // *** CECI EST MAINTENANT UN VRAI APPEL API AU BACKEND ***
      const response = await fetch(`${API_BASE_URL}/auth/forgotpassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        showModal(
          'Email Envoyé',
          data.msg || `Si votre adresse email est enregistrée, vous recevrez un lien de réinitialisation de mot de passe à l'adresse ${email}. Veuillez vérifier votre boîte de réception (et vos spams).`,
          'success'
        );
        setEmail(''); // Réinitialise le champ email
        navigateTo('auth'); // Redirige l'utilisateur vers la page de connexion
      } else {
        // Le backend renvoie 200 même si l'email n'existe pas pour des raisons de sécurité,
        // mais si une erreur réelle survient (ex: 500 du serveur), elle sera gérée ici.
        setLocalError(data.error || data.msg || 'Erreur lors de la demande de réinitialisation. Veuillez réessayer.');
        showModal(
          'Erreur',
          data.error || data.msg || 'Une erreur est survenue lors de l\'envoi de l\'email de réinitialisation. Veuillez réessayer plus tard.',
          'error'
        );
      }
    } catch (error) {
      console.error('Erreur réseau ou serveur lors de la demande de réinitialisation:', error);
      setLocalError('Impossible de se connecter au serveur. Veuillez vérifier votre connexion.');
      showModal(
        'Erreur Réseau',
        'Impossible de se connecter au serveur pour envoyer l\'email de réinitialisation. Veuillez vérifier votre connexion.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-md mx-auto">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-6 text-center">Mot de passe oublié ?</h1>
      <p className="text-gray-600 text-lg mb-8 text-center">
        Entrez votre adresse email ci-dessous pour recevoir un lien de réinitialisation de mot de passe.
      </p>

      {localError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Erreur !</strong>
          <span className="block sm:inline"> {localError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Adresse Email</label>
          <input
            type="email"
            id="email"
            name="email"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="votre.email@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-lg text-lg font-semibold transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="animate-spin h-5 w-5 mr-3" />
          ) : (
            'Envoyer le lien de réinitialisation'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => navigateTo('auth')}
          className="text-blue-600 hover:underline font-medium"
          disabled={loading}
        >
          Retour à la connexion
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
