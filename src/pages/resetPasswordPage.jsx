// src/pages/ResetPasswordPage.jsx
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react'; // Pour le spinner de chargement

// Le composant ResetPasswordPage prend `showModal` et `navigateTo` en props
const ResetPasswordPage = ({ showModal, navigateTo }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null); // Le token de réinitialisation
  const [localError, setLocalError] = useState(null); // Pour les erreurs de validation côté client

  const API_BASE_URL = 'http://localhost:5000/api';

  // Récupérer le token de l'URL au chargement du composant
  useEffect(() => {
    // La route attend un format /resetpassword/:token
    const pathSegments = window.location.pathname.split('/');
    const extractedToken = pathSegments[pathSegments.length - 1]; // Le dernier segment devrait être le token

    if (extractedToken && extractedToken !== 'resetpassword') { // S'assurer que ce n'est pas juste le nom de la page
      setToken(extractedToken);
    } else {
      setLocalError('Lien de réinitialisation invalide ou manquant.');
      showModal('Lien Invalide', 'Le lien de réinitialisation de mot de passe est invalide ou incomplet.', 'error');
      navigateTo('forgot-password'); // Rediriger vers la page de demande de réinitialisation
    }
  }, [navigateTo, showModal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);

    // Valider la présence du token
    if (!token) {
      setLocalError('Aucun token de réinitialisation trouvé.');
      setLoading(false);
      return;
    }

    // Validation des mots de passe
    if (password.length < 6) {
      setLocalError('Le mot de passe doit contenir au moins 6 caractères.');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Les mots de passe ne correspondent pas.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/resetpassword/${token}`, {
        method: 'PUT', // La route de réinitialisation est généralement une PUT
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }), // N'envoyer que le nouveau mot de passe
      });

      const data = await response.json();

      if (response.ok) {
        showModal('Succès', data.msg || 'Votre mot de passe a été réinitialisé avec succès !', 'success');
        setPassword('');
        setConfirmPassword('');
        navigateTo('auth'); // REDIRECTION VERS LA PAGE DE CONNEXION APRÈS SUCCÈS
      } else {
        setLocalError(data.msg || data.error || 'Erreur lors de la réinitialisation du mot de passe.');
        showModal('Erreur', data.msg || data.error || 'Une erreur est survenue lors de la réinitialisation du mot de passe.', 'error');
      }
    } catch (error) {
      console.error('Erreur réseau ou serveur lors de la réinitialisation du mot de passe:', error);
      setLocalError('Impossible de se connecter au serveur. Veuillez vérifier votre connexion.');
      showModal('Erreur Réseau', 'Impossible de se connecter au serveur pour réinitialiser le mot de passe.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-md mx-auto">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-6 text-center">Réinitialiser le mot de passe</h1>
      <p className="text-gray-600 text-lg mb-8 text-center">
        Entrez et confirmez votre nouveau mot de passe.
      </p>

      {localError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Erreur !</strong>
          <span className="block sm:inline"> {localError}</span>
        </div>
      )}

      {!token && !localError ? ( // Affiche un message d'attente si le token n'est pas encore extrait
        <div className="flex justify-center items-center h-24">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
          <p className="ml-3 text-gray-700">Vérification du lien de réinitialisation...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Nouveau mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Minimum 6 caractères"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-gray-700 text-sm font-bold mb-2">Confirmer le nouveau mot de passe</label>
            <input
              type="password"
              id="confirm-password"
              name="confirm-password"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Confirmez votre nouveau mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              'Réinitialiser le mot de passe'
            )}
          </button>
        </form>
      )}

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

export default ResetPasswordPage;
