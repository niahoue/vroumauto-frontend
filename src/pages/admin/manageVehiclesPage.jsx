// src/pages/admin/manageVehiclesPage.jsx
import React, { useState, useEffect, useCallback, useContext } from 'react'; // Ajout de useContext
import { Loader2, Trash2, Edit, PlusCircle } from 'lucide-react';
import { UserContext } from '../../context/userContext'; // Importez UserContext
import { makeAuthenticatedRequest } from '../../utils/api'; // Importez makeAuthenticatedRequest

const ManageVehiclesPage = ({ navigateTo, showModal }) => {
  const { user: currentUser, userToken, logout, isAuthLoading } = useContext(UserContext); // Obtenez currentUser, userToken, logout du contexte

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Fonction pour récupérer la liste des véhicules
  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!userToken) {
        showModal('Non autorisé', 'Veuillez vous connecter pour accéder à cette page.', 'error');
        navigateTo('auth');
        setLoading(false); // Stop loading if unauthorized
        return;
      }

      // Utiliser makeAuthenticatedRequest
      const data = await makeAuthenticatedRequest('/vehicles', 'GET', null, userToken);

      setVehicles(data.data);

    } catch (err) {
      console.error('Erreur de fetching des véhicules:', err);
      setError(err.message || 'Erreur de connexion au serveur ou problème inattendu.');
      showModal('Erreur Réseau', err.message || 'Impossible de joindre le serveur. Veuillez réessayer plus tard.', 'error');
      if (err.message.includes('Non autorisé')) {
        logout();
        navigateTo('auth');
      }
    } finally {
      setLoading(false);
    }
  }, [navigateTo, showModal, userToken, logout]); // Ajout de userToken et logout aux dépendances

  useEffect(() => {
    // Vérifier le rôle de l'utilisateur après que l'authentification soit chargée
    if (!isAuthLoading && currentUser && currentUser.role === 'admin') {
      fetchVehicles();
    } else if (!isAuthLoading && (!currentUser || currentUser.role !== 'admin')) {
        showModal('Accès Refusé', 'Votre rôle ne vous permet pas d\'accéder à cette page.', 'error');
        navigateTo('home');
    }
  }, [fetchVehicles, isAuthLoading, currentUser, navigateTo, showModal]); // Ajout de isAuthLoading et currentUser

  // Gère la suppression d'un véhicule
  const handleDeleteVehicle = (id, name) => {
    showModal(
      'Confirmer la suppression',
      `Êtes-vous sûr de vouloir supprimer le véhicule "${name}" ? Cette action est irréversible.`,
      'danger',
      async () => {
        setDeletingId(id);
        try {
          if (!userToken) {
            showModal('Non autorisé', 'Veuillez vous connecter pour supprimer un véhicule.', 'error');
            navigateTo('auth');
            return;
          }

          // Utiliser makeAuthenticatedRequest
          await makeAuthenticatedRequest(`/vehicles/${id}`, 'DELETE', null, userToken);

          showModal('Succès', `Le véhicule "${name}" a été supprimé avec succès.`, 'success');
          fetchVehicles(); // Rafraîchir la liste après suppression

        } catch (err) {
          console.error('Erreur lors de la suppression:', err);
          showModal('Erreur de suppression', err.message || 'Impossible de supprimer le véhicule.', 'error');
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

  // Affichage conditionnel basé sur le rôle et l'état de chargement d'authentification
  if (isAuthLoading || (currentUser && currentUser.role !== 'admin' && loading)) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-500" size={48} />
        <p className="ml-4 text-gray-600">Chargement des véhicules...</p>
      </div>
    );
  }

  // Si l'utilisateur n'est pas un admin après chargement
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
          onClick={fetchVehicles}
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
        <h1 className="text-3xl font-bold text-gray-800">Gestion des Véhicules</h1>
        <button
          onClick={() => navigateTo('add-vehicle')}
          className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md flex items-center"
        >
          <PlusCircle size={20} className="mr-2" /> Ajouter un Véhicule
        </button>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center p-6 bg-gray-50 rounded-lg shadow-inner text-gray-600">
          <p className="text-lg font-semibold mb-2">Aucun véhicule enregistré.</p>
          <p>Utilisez le bouton "Ajouter un Véhicule" pour commencer.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marque / Modèle
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Année
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix / Taux Journalier
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  En vedette
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vehicles.map((vehicle) => (
                <tr key={vehicle._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={vehicle.images[vehicle.coverImageIndex || 0] || 'https://placehold.co/40x40/E0E7FF/3730A3?text=VR'}
                          alt={vehicle.name}
                          onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/40x40/E0E7FF/3730A3?text=VR'; }}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{vehicle.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      vehicle.type === 'buy' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {vehicle.type === 'buy' ? 'À vendre' : 'À louer'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {vehicle.brand} - {vehicle.model}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.year}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {vehicle.type === 'buy' ? `${vehicle.price?.toLocaleString()} FCFA` : `${vehicle.dailyRate?.toLocaleString()} FCFA/jour`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      vehicle.isFeatured ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {vehicle.isFeatured ? 'Oui' : 'Non'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end items-center space-x-3">
                      {/* Bouton d'édition (vers la page EditVehiclePage) */}
                      <button
                        onClick={() => navigateTo('edit-vehicle', { id: vehicle._id })}
                        className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                        title="Modifier"
                        disabled={deletingId === vehicle._id}
                      >
                        <Edit size={20} />
                      </button>
                      {/* Bouton de suppression */}
                      <button
                        onClick={() => handleDeleteVehicle(vehicle._id, vehicle.name)}
                        className="text-red-600 hover:text-red-900 transition-colors duration-200"
                        title="Supprimer"
                        disabled={deletingId === vehicle._id}
                      >
                        {deletingId === vehicle._id ? (
                          <Loader2 className="animate-spin h-5 w-5" />
                        ) : (
                          <Trash2 size={20} />
                        )}
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

export default ManageVehiclesPage;
