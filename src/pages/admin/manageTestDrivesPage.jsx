// src/pages/admin/manageTestDrivesPage.jsx
import React, { useState, useEffect, useCallback, useContext } from 'react'; // Ajout de useContext
import { Loader2, CheckCircle, XCircle, Calendar, Car } from 'lucide-react'; // Icônes
import { UserContext } from '../../context/userContext'; // Importez UserContext
import { makeAuthenticatedRequest } from '../../utils/api'; // Importez makeAuthenticatedRequest

const ManageTestDrivesPage = ({ navigateTo, showModal, userId: adminViewingUserId }) => { // currentUser vient maintenant du contexte
  const { user: currentUser, userToken, logout, isAuthLoading } = useContext(UserContext); // Obtenez currentUser, userToken, logout du contexte

  const [testDrives, setTestDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchTestDrives = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!userToken) {
        showModal('Non autorisé', 'Veuillez vous connecter pour accéder à cette page.', 'error');
        navigateTo('auth');
        setLoading(false);
        return;
      }

      // Si adminViewingUserId est présent, cela signifie qu'un admin regarde les essais d'un user spécifique
      // Sinon, pour l'admin lui-même, il veut toutes les demandes d'essai.
      const url = adminViewingUserId
        ? `/testdrives/my?user=${adminViewingUserId}` // Note: le /api est géré par makeAuthenticatedRequest
        : `/testdrives/my`; // Cette route retourne toutes les demandes d'essai pour admin

      // Utiliser makeAuthenticatedRequest
      const data = await makeAuthenticatedRequest(url, 'GET', null, userToken);

      setTestDrives(data.data);

    } catch (err) {
      console.error('Erreur de fetching des demandes d\'essai:', err);
      setError(err.message || 'Erreur de connexion au serveur ou problème inattendu.');
      showModal('Erreur Réseau', err.message || 'Impossible de joindre le serveur. Veuillez réessayer plus tard.', 'error');
      if (err.message.includes('Non autorisé')) {
        logout();
        navigateTo('auth');
      }
    } finally {
      setLoading(false);
    }
  }, [navigateTo, showModal, adminViewingUserId, userToken, logout]); // Ajout de userToken et logout aux dépendances

  useEffect(() => {
    if (!isAuthLoading && currentUser && currentUser.role === 'admin') {
      fetchTestDrives();
    } else if (!isAuthLoading && (!currentUser || currentUser.role !== 'admin')) {
        showModal('Accès Refusé', 'Votre rôle ne vous permet pas d\'accéder à cette page.', 'error');
        navigateTo('home');
    }
  }, [fetchTestDrives, isAuthLoading, currentUser, navigateTo, showModal]); // Ajout de isAuthLoading et currentUser

  const handleUpdateStatus = (testDriveId, currentStatus, newStatus, vehicleName) => {
    showModal(
      'Confirmer le changement de statut',
      `Êtes-vous sûr de vouloir changer le statut de la demande d'essai pour "${vehicleName}" de "${currentStatus}" à "${newStatus}" ?`,
      'info',
      async () => {
        setUpdatingId(testDriveId);
        try {
          if (!userToken) {
            showModal('Non autorisé', 'Veuillez vous connecter pour modifier le statut.', 'error');
            navigateTo('auth');
            return;
          }

          // Utiliser makeAuthenticatedRequest
          await makeAuthenticatedRequest(`/testdrives/${testDriveId}/status`, 'PUT', { status: newStatus }, userToken);

          showModal('Succès', `Statut de la demande d'essai pour "${vehicleName}" mis à jour à "${newStatus}".`, 'success');
          fetchTestDrives();
        } catch (err) {
          console.error('Erreur lors de la mise à jour du statut:', err);
          showModal('Erreur', err.message || 'Impossible de mettre à jour le statut.', 'error');
          if (err.message.includes('Non autorisé')) {
            logout();
            navigateTo('auth');
          }
        } finally {
          setUpdatingId(null);
        }
      }
    );
  };

  const handleCancelTestDrive = (testDriveId, vehicleName) => {
    showModal(
      'Confirmer l\'annulation',
      `Êtes-vous sûr de vouloir annuler la demande d'essai pour "${vehicleName}" ?`,
      'danger',
      async () => {
        setUpdatingId(testDriveId);
        try {
          if (!userToken) {
            showModal('Non autorisé', 'Veuillez vous connecter pour annuler une demande d\'essai.', 'error');
            navigateTo('auth');
            return;
          }

          // Utiliser makeAuthenticatedRequest
          await makeAuthenticatedRequest(`/testdrives/${testDriveId}/cancel`, 'PUT', null, userToken);

          showModal('Succès', `La demande d'essai pour "${vehicleName}" a été annulée.`, 'success');
          fetchTestDrives();
        } catch (err) {
          console.error('Erreur lors de l\'annulation:', err);
          showModal('Erreur Réseau', err.message || 'Impossible d\'annuler la demande d\'essai.', 'error');
          if (err.message.includes('Non autorisé')) {
            logout();
            navigateTo('auth');
          }
        } finally {
          setUpdatingId(null);
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
        <p className="ml-4 text-gray-600">Chargement des demandes d'essai...</p>
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
          onClick={fetchTestDrives}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        {adminViewingUserId ? `Historique des Demandes d'Essai de ${adminViewingUserId}` : 'Gestion des Demandes d\'Essai'}
      </h1>

      {testDrives.length === 0 ? (
        <div className="text-center p-6 bg-gray-50 rounded-lg shadow-inner text-gray-600">
          <p className="text-lg font-semibold mb-2">Aucune demande d'essai trouvée.</p>
          {adminViewingUserId && <p>Cet utilisateur n'a pas encore de demandes d'essai.</p>}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Véhicule
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Heure
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {testDrives.map((testDrive) => (
                <tr key={testDrive._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {testDrive.vehicle ? (
                      <div className="flex items-center">
                        <img
                          src={testDrive.vehicle.images[testDrive.vehicle.coverImageIndex || 0] || 'https://placehold.co/40x40/E0E7FF/3730A3?text=VR'}
                          alt={testDrive.vehicle.name}
                          className="w-10 h-10 rounded-full object-cover mr-3"
                        />
                        <span>{testDrive.vehicle.name} ({testDrive.vehicle.year})</span>
                      </div>
                    ) : 'Véhicule introuvable'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {testDrive.user ? testDrive.user.email : 'Utilisateur introuvable'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(testDrive.testDriveDate).toLocaleDateString()} à {new Date(testDrive.testDriveDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(testDrive.status)}`}>
                      {testDrive.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate text-sm text-gray-500" title={testDrive.message}>
                    {testDrive.message || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end items-center space-x-2">
                      {testDrive.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(testDrive._id, testDrive.status, 'confirmed', testDrive.vehicle.name)}
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="Confirmer la demande d'essai"
                            disabled={updatingId === testDrive._id}
                          >
                            {updatingId === testDrive._id ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle size={20} />}
                          </button>
                          <button
                            onClick={() => handleCancelTestDrive(testDrive._id, testDrive.vehicle.name)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Annuler la demande d'essai"
                            disabled={updatingId === testDrive._id}
                          >
                            {updatingId === testDrive._id ? <Loader2 size={20} className="animate-spin" /> : <XCircle size={20} />}
                          </button>
                        </>
                      )}
                      {(testDrive.status === 'confirmed' || testDrive.status === 'pending') && (
                        <button
                          onClick={() => handleUpdateStatus(testDrive._id, testDrive.status, 'completed', testDrive.vehicle.name)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Marquer comme terminée"
                          disabled={updatingId === testDrive._id}
                        >
                          {updatingId === testDrive._id ? <Loader2 size={20} className="animate-spin" /> : <Calendar size={20} />}
                        </button>
                      )}
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

export default ManageTestDrivesPage;
