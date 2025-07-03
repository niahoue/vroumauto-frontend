// src/pages/myReservationsPage.jsx
import React, { useState, useEffect, useCallback } from 'react'; // Ajout de useCallback
import { Loader2, Car, Calendar, Info, Edit, XCircle } from 'lucide-react';

const MyReservationsPage = ({ navigateTo, showModal, user }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming-rentals'); // 'upcoming-rentals', 'past-rentals', 'test-drives'

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'; // Assurez-vous que c'est le bon port

  // Fonction pour récupérer les réservations et demandes d'essai de l'utilisateur
  // Utilisant useCallback pour éviter les recréations inutiles et les boucles infinies dans useEffect
  const fetchUserEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    setReservations([]); // Effacer les réservations précédentes

    const token = localStorage.getItem('token');
    if (!token) {
      showModal('Non autorisé', 'Veuillez vous connecter pour voir vos réservations et demandes d\'essai.', 'error');
      navigateTo('auth');
      setLoading(false);
      return;
    }

    try {
      let data = [];
      if (activeTab.includes('rentals')) {
        // Récupérer les réservations de location
        const response = await fetch(`${API_BASE_URL}/reservations/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.msg || 'Échec de la récupération des locations.');
        }
        const resData = await response.json();
        const rentals = resData.data || [];

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        if (activeTab === 'upcoming-rentals') {
          // Filtrer les locations à venir (startDate >= aujourd'hui et statut confirmé/en attente)
          data = rentals.filter(res => {
            const startDate = new Date(res.startDate);
            startDate.setHours(0, 0, 0, 0); // Pour comparer la date sans l'heure
            return startDate >= now && (res.status === 'confirmed' || res.status === 'pending');
          });
        } else if (activeTab === 'past-rentals') {
          // Filtrer les locations passées (endDate < aujourd'hui ou statut annulé/terminé)
          data = rentals.filter(res => {
            const endDate = new Date(res.endDate);
            endDate.setHours(0, 0, 0, 0); // Pour comparer la date sans l'heure
            return endDate < now || res.status === 'cancelled' || res.status === 'completed';
          });
        }
        // Ajouter un indicateur de type pour le rendu
        data = data.map(item => ({ ...item, type: 'location' }));

      } else if (activeTab === 'test-drives') {
        // Récupérer les demandes d'essai
        const response = await fetch(`${API_BASE_URL}/testdrives/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.msg || 'Échec de la récupération des demandes d\'essai.');
        }
        const resData = await response.json();
        data = resData.data || [];
        // Ajouter un indicateur de type pour le rendu
        data = data.map(item => ({ ...item, type: 'essai' }));
      }

      setReservations(data);

    } catch (err) {
      console.error("Erreur lors de la récupération des entrées:", err);
      setError(err.message || 'Erreur lors du chargement de vos entrées.');
      showModal('Erreur', err.message || 'Impossible de charger vos entrées. Veuillez réessayer.', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, activeTab, navigateTo, showModal]); // Dépendances pour useCallback

  useEffect(() => {
    if (user) { // Assurez-vous que l'utilisateur est connecté avant de récupérer les données
      fetchUserEntries();
    } else {
      setLoading(false);
      setError('Vous devez être connecté pour voir vos réservations et demandes d\'essai.');
    }
  }, [user, activeTab, fetchUserEntries]); // Déclenche le fetch si l'utilisateur change ou l'onglet actif change

  const handleCancelEntry = async (entryId, type, entryName) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir annuler cette ${type === 'location' ? 'réservation' : 'demande d\'essai'} pour ${entryName} ?`)) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = type === 'location' ? `${API_BASE_URL}/reservations/${entryId}` : `${API_BASE_URL}/testdrives/${entryId}`;
      const response = await fetch(endpoint, {
        method: 'PUT', // Utiliser PUT pour changer le statut à 'cancelled'
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'cancelled' })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Échec de l\'annulation.');
      }

      showModal('Succès', `${type === 'location' ? 'Réservation' : 'Demande d\'essai'} annulée avec succès !`, 'success');
      fetchUserEntries(); // Recharger la liste après annulation
    } catch (err) {
      console.error("Erreur annulation:", err);
      showModal('Erreur', err.message || `Impossible d'annuler la ${type === 'location' ? 'réservation' : 'demande d\'essai'}. Veuillez réessayer.`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleModifyEntry = (entry) => {
    if (entry.type === 'location') {
      showModal('Modification Non Implémentée', 'La modification complète des réservations n\'est pas encore disponible. Veuillez annuler et refaire une nouvelle réservation si nécessaire.', 'info');
      // Idéalement, naviguer vers une page de modification pré-remplie
      // navigateTo('edit-reservation', { reservationId: entry._id, vehicleData: entry.vehicle, initialValues: entry });
    } else if (entry.type === 'essai') {
      // Pour les demandes d'essai, naviguer vers TestDriveSchedulingPage avec les données existantes
      navigateTo('test-drive-scheduling', {
        vehicleData: entry.vehicle, // L'objet vehicle est déjà peuplé
        initialDate: entry.testDriveDate,
        initialTime: entry.testDriveTime,
        testDriveId: entry._id // Passer l'ID pour indiquer une modification
      });
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Accès Refusé</h2>
        <p className="text-gray-700 mb-6 text-center">Vous devez être connecté pour accéder à cette page.</p>
        <button
          onClick={() => navigateTo('auth')}
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-lg text-lg font-semibold"
        >
          Se connecter
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-600 w-12 h-12" />
        <p className="ml-4 text-lg text-gray-700">Chargement de vos réservations et demandes d'essai...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-600 font-semibold">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-6xl mx-auto">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-6 text-center">Mes Réservations & Demandes d'Essai</h1>
      <p className="text-gray-600 text-lg mb-8 text-center">
        Gérez l'historique de vos locations de véhicules et de vos demandes d'essai routier.
      </p>

      {/* Onglets de navigation */}
      <div className="flex justify-center border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('upcoming-rentals')}
          className={`py-3 px-6 text-lg font-medium ${activeTab === 'upcoming-rentals' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Locations à Venir
        </button>
        <button
          onClick={() => setActiveTab('past-rentals')}
          className={`py-3 px-6 text-lg font-medium ${activeTab === 'past-rentals' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Locations Passées
        </button>
        <button
          onClick={() => setActiveTab('test-drives')}
          className={`py-3 px-6 text-lg font-medium ${activeTab === 'test-drives' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Demandes d'Essai
        </button>
      </div>

      {reservations.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg shadow-inner">
          <p className="text-gray-600 text-xl font-semibold">
            {activeTab === 'upcoming-rentals' && 'Aucune location à venir.'}
            {activeTab === 'past-rentals' && 'Aucune location passée.'}
            {activeTab === 'test-drives' && 'Aucune demande d\'essai enregistrée.'}
          </p>
          <p className="text-gray-500 mt-2">
            Commencez par <button onClick={() => navigateTo('buy')} className="text-blue-600 hover:underline">acheter</button> ou <button onClick={() => navigateTo('rent')} className="text-blue-600 hover:underline">louer</button> un véhicule !
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reservations.map((res) => (
            <div key={res._id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden flex flex-col sm:flex-row">
              <img
                src={res.vehicle.images && res.vehicle.images.length > 0 ? res.vehicle.images[0] : 'https://placehold.co/150x100/E0E7FF/3730A3?text=Véhicule'}
                alt={res.vehicle.name}
                className="w-full sm:w-40 h-32 sm:h-auto object-cover"
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x100/E0E7FF/3730A3?text=Image+non+disponible'; }}
              />
              <div className="p-4 flex-grow">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{res.vehicle.name}</h3>
                <p className="text-sm text-gray-600 mb-1">{res.vehicle.brand} {res.vehicle.model}</p>
                {res.type === 'location' ? (
                  <>
                    <p className="text-gray-700 text-sm flex items-center mb-1">
                      <Calendar size={16} className="mr-2 text-blue-500" /> Du {new Date(res.startDate).toLocaleDateString()} au {new Date(res.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-gray-700 text-sm flex items-center mb-3">
                      <Info size={16} className="mr-2 text-green-500" /> Tarif: {res.totalPrice.toLocaleString()} FCFA ({res.vehicle.dailyRate.toLocaleString()} FCFA/jour)
                    </p>
                  </>
                ) : (
                  <p className="text-gray-700 text-sm flex items-center mb-3">
                    <Calendar size={16} className="mr-2 text-purple-500" /> Date d'essai: {new Date(res.testDriveDate).toLocaleDateString()} à {res.testDriveTime}
                  </p>
                )}

                <p className="text-sm font-semibold mb-3">
                  Statut: <span className={`px-2 py-0.5 rounded-full text-white ${
                    res.status === 'confirmed' ? 'bg-green-500' :
                    res.status === 'pending' ? 'bg-yellow-500' :
                    res.status === 'completed' ? 'bg-gray-500' :
                    res.status === 'cancelled' ? 'bg-red-500' : 'bg-blue-500'
                  }`}>
                    {res.status.charAt(0).toUpperCase() + res.status.slice(1).replace('_', ' ')}
                  </span>
                </p>

                <div className="flex space-x-2 mt-4">
                  {(res.status === 'confirmed' || res.status === 'pending') && ( // Seulement si en cours ou en attente
                    <>
                      {res.type === 'essai' && ( // Seules les demandes d'essai peuvent être modifiées pour l'instant
                        <button
                          onClick={() => handleModifyEntry(res)}
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-semibold"
                        >
                          <Edit size={16} className="mr-2" /> Modifier
                        </button>
                      )}
                      <button
                        onClick={() => handleCancelEntry(res._id, res.type, res.vehicle.name)}
                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-semibold"
                      >
                        <XCircle size={16} className="mr-2" /> Annuler
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => navigateTo('vehicle-details', { id: res.vehicle._id, type: res.vehicle.type })}
                    className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors text-sm font-semibold"
                  >
                    <Car size={16} className="mr-2" /> Voir le véhicule
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReservationsPage;
