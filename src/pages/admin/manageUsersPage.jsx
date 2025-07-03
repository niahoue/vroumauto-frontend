// src/pages/admin/manageUsersPage.jsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Pencil, Trash2, Loader2, UserPlus, Eye } from 'lucide-react';
import { UserContext } from '../../context/userContext';
import { makeAuthenticatedRequest } from '../../utils/api';

const ManageUsersPage = ({ navigateTo, showModal }) => {
  const { user: currentUser, userToken, logout, isAuthLoading } = useContext(UserContext);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [blockingId, setBlockingId] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!userToken) {
        showModal('Non autorisé', 'Vous devez être connecté pour accéder à cette ressource.', 'error');
        navigateTo('auth');
        setLoading(false);
        return;
      }

      const data = await makeAuthenticatedRequest('/users', 'GET', null, userToken);

      setUsers(data.data);

    } catch (err) {
      console.error('Erreur de fetching des utilisateurs:', err);
      setError(err.message || 'Erreur de connexion au serveur ou problème inattendu.');
      showModal('Erreur Réseau', err.message || 'Impossible de joindre le serveur. Veuillez réessayer plus tard.', 'error');
      if (err.message.includes('Non autorisé')) {
        logout();
        navigateTo('auth');
      }
    } finally {
      setLoading(false);
    }
  }, [navigateTo, showModal, userToken, logout]);

  useEffect(() => {
    if (!isAuthLoading && currentUser && currentUser.role === 'admin') {
      fetchUsers();
    } else if (!isAuthLoading && (!currentUser || currentUser.role !== 'admin')) {
        showModal('Accès Refusé', 'Votre rôle ne vous permet pas d\'accéder à cette page.', 'error');
        navigateTo('home');
    }
  }, [fetchUsers, isAuthLoading, currentUser, navigateTo, showModal]);

  const handleDeleteUser = (id, email) => {
    if (currentUser && currentUser.id === id) {
      showModal('Action Interdite', 'Vous ne pouvez pas supprimer votre propre compte.', 'warning');
      return;
    }

    showModal(
      'Confirmer la suppression',
      `Êtes-vous sûr de vouloir supprimer l'utilisateur "${email}" ? Cette action est irréversible.`,
      'danger',
      async () => {
        setDeletingId(id);
        try {
          if (!userToken) {
            showModal('Non autorisé', 'Veuillez vous connecter pour supprimer un utilisateur.', 'error');
            navigateTo('auth');
            return;
          }

          await makeAuthenticatedRequest(`/users/${id}`, 'DELETE', null, userToken);

          showModal('Succès', `L'utilisateur "${email}" a été supprimé avec succès.`, 'success');
          fetchUsers();

        } catch (err) {
          console.error('Erreur lors de la suppression:', err);
          showModal('Erreur de suppression', err.message || 'Impossible de supprimer l\'utilisateur.', 'error');
          if (err.message.includes('Non autorisé')) {
            logout();
            navigateTo('auth');
          }
        } finally {
          setDeletingId(null);
        }
      }
    );
  };

  // Gère le blocage/déblocage d'un utilisateur
  const handleToggleBlockUser = async (id, email, currentStatus) => {
    if (currentUser && currentUser.id === id) {
      showModal('Action Interdite', 'Vous ne pouvez pas bloquer/débloquer votre propre compte.', 'warning');
      return;
    }

    const newStatus = !currentStatus;
    showModal(
      newStatus ? 'Confirmer le blocage' : 'Confirmer le déblocage',
      `Êtes-vous sûr de vouloir ${newStatus ? 'bloquer' : 'débloquer'} l'utilisateur "${email}" ?`,
      newStatus ? 'warning' : 'info',
      async () => {
        setBlockingId(id);
        try {
          if (!userToken) {
            showModal('Non autorisé', 'Veuillez vous connecter pour modifier le statut d\'un utilisateur.', 'error');
            navigateTo('auth');
            return;
          }

          // ***************************************************************
          // CORRECTION ICI: Changer l'URL pour correspondre à PUT /api/users/:id
          // et envoyer isActive dans le corps de la requête.
          // ***************************************************************
          await makeAuthenticatedRequest(`/users/${id}`, 'PUT', { isActive: newStatus }, userToken);

          showModal('Succès', `L'utilisateur "${email}" a été ${newStatus ? 'bloqué' : 'débloqué'} avec succès.`, 'success');
          fetchUsers();
        } catch (err) {
          console.error('Erreur lors du changement de statut:', err);
          showModal('Erreur', err.message || `Impossible de ${newStatus ? 'bloquer' : 'débloquer'} l'utilisateur.`, 'error');
          if (err.message.includes('Non autorisé')) {
            logout();
            navigateTo('auth');
          }
        } finally {
          setBlockingId(null);
        }
      }
    );
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isAuthLoading || (currentUser && currentUser.role !== 'admin' && loading)) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-500" size={48} />
        <p className="ml-4 text-gray-600">Chargement des utilisateurs...</p>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'admin') {
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

  if (error) {
    return (
      <div className="text-center p-6 bg-red-100 rounded-lg shadow-md text-red-700">
        <h2 className="text-xl font-bold mb-3">Erreur de chargement</h2>
        <p>{error}</p>
        <button
          onClick={fetchUsers}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestion des Utilisateurs</h1>
        <button
          onClick={() => showModal('Ajouter un utilisateur', 'La création de nouveaux utilisateurs se fait via la page d\'inscription publique pour le moment.', 'info')}
          className="bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 shadow-md flex items-center"
        >
          <UserPlus size={20} className="mr-2" /> Ajouter un Utilisateur
        </button>
      </div>

      {users.length === 0 ? (
        <div className="text-center p-6 bg-gray-50 rounded-lg shadow-inner text-gray-600">
          <p className="text-lg font-semibold mb-2">Aucun utilisateur enregistré.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Utilisateur
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.email}</div>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Actif' : 'Bloqué'}
                    </span>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-xs text-gray-500">{user._id}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end items-center space-x-3">
                      <button
                        onClick={() => navigateTo('edit-user', { id: user._id })}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors"
                        title="Modifier le rôle"
                        disabled={currentUser && currentUser.id === user._id}
                      >
                        <Pencil size={20} />
                      </button>
                      <button
                        onClick={() => handleToggleBlockUser(user._id, user.email, user.isActive)}
                        className={`transition-colors ${user.isActive ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}`}
                        title={user.isActive ? 'Bloquer l\'utilisateur' : 'Débloquer l\'utilisateur'}
                        disabled={blockingId === user._id || (currentUser && currentUser.id === user._id)}
                      >
                        {blockingId === user._id ? (
                          <Loader2 className="animate-spin h-5 w-5" />
                        ) : (
                          user.isActive ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ban"><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-unlock"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        )}
                      </button>
                      <button
                        onClick={() => navigateTo('my-reservations', { userId: user._id, userEmail: user.email })}
                        className="text-purple-600 hover:text-purple-900 transition-colors"
                        title="Voir l'historique des réservations"
                      >
                        <Eye size={20} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id, user.email)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Supprimer l'utilisateur"
                        disabled={deletingId === user._id || (currentUser && currentUser.id === user._id)}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageUsersPage;
