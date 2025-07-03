// src/pages/EditUserPage.jsx
import React, { useState, useEffect, useContext } from 'react'; // Ajout de useContext
import { Loader2 } from 'lucide-react';
import { UserContext } from '../../context/userContext'; // Importez UserContext
import { makeAuthenticatedRequest } from '../../utils/api'; // Importez makeAuthenticatedRequest

const EditUserPage = ({ navigateTo, showModal, userId }) => { // currentUser vient maintenant du contexte
  const { user: currentUser, userToken, logout } = useContext(UserContext); // Obtenez currentUser, userToken, logout du contexte

  const [user, setUser] = useState(null);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!userToken) {
          showModal('Non autorisé', 'Vous devez être connecté pour accéder à cette ressource.', 'error');
          navigateTo('auth');
          setLoading(false);
          return;
        }

        // Utiliser makeAuthenticatedRequest
        const data = await makeAuthenticatedRequest(`/users/${userId}`, 'GET', null, userToken);

        setUser(data.data);
        setRole(data.data.role); // Initialise le rôle avec la valeur actuelle

      } catch (err) {
        console.error("Erreur réseau ou serveur:", err);
        setError(err.message || 'Erreur réseau ou serveur. Impossible de charger les détails de l\'utilisateur.');
        showModal('Erreur de Chargement', err.message || 'Impossible de charger les détails de l\'utilisateur.', 'error');
        if (err.message.includes('Non autorisé')) {
          logout();
          navigateTo('auth');
        }
        navigateTo('manage-users'); // Rediriger si l'utilisateur n'est pas trouvé ou erreur
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      if (!currentUser || currentUser.role !== 'admin') {
        showModal('Accès Refusé', 'Votre rôle ne vous permet pas d\'accéder à cette page.', 'error');
        navigateTo('home');
        setLoading(false);
        return;
      }
      fetchUser();
    } else {
      setError("Aucun ID utilisateur fourni pour la modification.");
      setLoading(false);
      navigateTo('manage-users');
    }
  }, [userId, navigateTo, showModal, currentUser, userToken, logout]); // Ajout de currentUser, userToken, logout aux dépendances

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setLocalError(null);

    if (currentUser && currentUser.id === userId) {
      setLocalError('Vous ne pouvez pas modifier votre propre rôle via cette page.');
      setSubmitting(false);
      return;
    }

    try {
      if (!userToken) {
        showModal('Non autorisé', 'Veuillez vous connecter pour modifier un rôle.', 'error');
        navigateTo('auth');
        setSubmitting(false);
        return;
      }

      // Utiliser makeAuthenticatedRequest
      await makeAuthenticatedRequest(`/users/${userId}`, 'PUT', { role }, userToken);

      showModal('Succès', 'Rôle utilisateur mis à jour avec succès !', 'success');
      navigateTo('manage-users'); // Retourne à la liste de gestion des utilisateurs

    } catch (err) {
      console.error("Erreur réseau ou serveur:", err);
      setLocalError(err.message || 'Erreur réseau ou serveur. Impossible de mettre à jour le rôle.');
      showModal('Erreur de mise à jour', err.message || 'Erreur lors de la mise à jour du rôle utilisateur.', 'error');
      if (err.message.includes('Non autorisé')) {
        logout();
        navigateTo('auth');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Ajout de la vérification initiale du rôle pour afficher le loader ou le message d'accès refusé
  if (loading || !currentUser || currentUser.role !== 'admin') {
    if (!currentUser || currentUser.role !== 'admin') {
      // Afficher un message d'accès refusé avant même le chargement des données spécifiques
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Accès Refusé</h2>
          <p className="text-gray-700 mb-6 text-center">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
          <button
            onClick={() => navigateTo('home')}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-lg text-lg font-semibold"
          >
            Retour à l'accueil
          </button>
        </div>
      );
    }
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-600 w-12 h-12" />
        <p className="ml-4 text-lg text-gray-700">Chargement des détails de l'utilisateur...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-600 font-semibold">
        {error}
        <button onClick={() => navigateTo('manage-users')} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">Retour à la gestion des utilisateurs</button>
      </div>
    );
  }

  if (!user) { // Ce cas devrait être géré par l'erreur ci-dessus si fetchUser échoue
    return (
      <div className="text-center p-8 text-red-600 font-semibold">
        Utilisateur introuvable.
        <button onClick={() => navigateTo('manage-users')} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">Retour à la gestion des utilisateurs</button>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-md mx-auto">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-6 text-center">Modifier le rôle utilisateur</h1>
      <p className="text-gray-600 text-lg mb-8 text-center">
        Modifier le rôle pour <span className="font-semibold text-blue-700">{user.email}</span>.
      </p>

      {localError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Erreur !</strong>
          <span className="block sm:inline"> {localError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="user-email" className="block text-gray-700 text-sm font-bold mb-2">Email de l'utilisateur</label>
          <input
            type="email"
            id="user-email"
            value={user.email}
            className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
            disabled
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-gray-700 text-sm font-bold mb-2">Rôle</label>
          <select
            id="role"
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={submitting || (currentUser && currentUser.id === userId)}
          >
            <option value="user">Utilisateur</option>
            <option value="admin">Administrateur</option>
          </select>
          {currentUser && currentUser.id === userId && (
            <p className="text-sm text-red-500 mt-2">Vous ne pouvez pas modifier votre propre rôle ici.</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-lg text-lg font-semibold transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          disabled={submitting || (currentUser && currentUser.id === userId)}
        >
          {submitting ? (
            <Loader2 className="animate-spin h-5 w-5 mr-3" />
          ) : (
            'Mettre à jour le rôle'
          )}
        </button>
        <button
          type="button"
          onClick={() => navigateTo('manage-users')}
          className="w-full mt-4 bg-gray-400 text-white px-6 py-3 rounded-md hover:bg-gray-500 transition-colors duration-200 shadow-lg text-lg font-semibold transform hover:scale-105"
          disabled={submitting}
        >
          Annuler
        </button>
      </form>
    </div>
  );
};

export default EditUserPage;
