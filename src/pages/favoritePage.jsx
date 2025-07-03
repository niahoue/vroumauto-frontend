// src/pages/FavoritesPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Loader2, Heart, Frown } from 'lucide-react'; // Icônes
import { UserContext } from '../context/userContext'; // Assurez-vous que le chemin est correct
import { makeAuthenticatedRequest } from '../utils/api'; // Importez l'utilitaire API
import { formatPrice } from '../utils/helpers'; // Importez le helper pour formater le prix
import SkeletonCard from '../components/SkeletonCard'; // Réutilisation du SkeletonCard


const FavoritePage = ({ navigateTo, showModal }) => {
  const { user, userToken, fetchUserData } = useContext(UserContext); // Utilisez le UserContext
  const [favoriteVehicles, setFavoriteVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pas besoin de API_BASE_URL ici si makeAuthenticatedRequest gère les chemins relatifs

  useEffect(() => {
    const fetchFavorites = async () => {
      // Rediriger ou afficher un message si l'utilisateur n'est pas connecté ou n'a pas de token
      if (!user || !userToken) {
        showModal('Non autorisé', 'Vous devez être connecté pour voir vos favoris.', 'info');
        navigateTo('auth');
        setLoading(false); // Arrêter le chargement
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Utilisez makeAuthenticatedRequest pour récupérer les favoris
        // Le endpoint '/users/favorites' est configuré pour renvoyer les véhicules populés
        const data = await makeAuthenticatedRequest('/users/favorites', 'GET', null, userToken);
        
        if (data.success) {
          setFavoriteVehicles(data.data);
        } else {
          setError(data.msg || 'Erreur lors du chargement des favoris.');
          showModal('Erreur de Chargement', data.msg || 'Impossible de charger vos favoris.', 'error');
        }
      } catch (err) {
        console.error('Erreur de récupération des favoris:', err);
        setError(err.message || 'Erreur réseau lors de la récupération des favoris.');
        showModal('Erreur Réseau', err.message || 'Impossible de se connecter au serveur.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user, userToken, navigateTo, showModal]); // Déclenche le fetch lorsque l'utilisateur ou le token change

  const handleRemoveFavorite = async (vehicleId, vehicleName) => {
    // Demander confirmation avant de supprimer
    showModal(
      'Confirmer la suppression',
      `Voulez-vous vraiment retirer ${vehicleName} de vos favoris ?`,
      'warning',
      async () => {
        // Logique de suppression confirmée
        try {
          const response = await makeAuthenticatedRequest(`/users/favorites/toggle`, 'POST', { vehicleId: vehicleId }, userToken);

          if (response.success) {
            showModal('Succès', `"${vehicleName}" a été retiré de vos favoris.`, 'success');
            // Mettre à jour l'état local pour refléter la suppression immédiatement
            setFavoriteVehicles(prev => prev.filter(vehicle => vehicle._id !== vehicleId));
            fetchUserData(userToken); // Re-fetch les données utilisateur pour mettre à jour la liste des favoris globale
          } else {
            showModal('Erreur', response.msg || 'Une erreur est survenue lors du retrait des favoris.', 'error');
          }
        } catch (err) {
          console.error('Erreur de retrait des favoris:', err);
          showModal('Erreur Réseau', err.message || 'Impossible de se connecter au serveur pour retirer le favori.', 'error');
        }
      },
      'Oui, retirer',
      'Annuler'
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">Mes Véhicules Favoris</h1>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-500 text-lg flex flex-col items-center">
          <Frown size={50} className="mb-4" />
          <p>{error}</p>
          <p className="text-gray-500 text-sm mt-2">Veuillez réessayer plus tard.</p>
        </div>
      ) : favoriteVehicles.length === 0 ? (
        <div className="text-center py-10 text-gray-500 text-lg flex flex-col items-center">
          <Heart size={50} className="mb-4 text-red-400" fill="currentColor" />
          <p>Vous n'avez pas encore de véhicules favoris.</p>
          <p className="text-gray-500 text-sm mt-2">Explorez nos véhicules pour en ajouter !</p>
          <button
            onClick={() => navigateTo('buy-vehicles')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 font-semibold"
          >
            Voir les véhicules à vendre
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteVehicles.map((vehicle) => (
            <div
              key={vehicle._id}
              className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={(vehicle.images && vehicle.images.length > 0) ? (vehicle.images[vehicle.coverImageIndex] || vehicle.images[0]) : "https://placehold.co/400x300/E0E0E0/404040?text=Image+Non+Disponible"}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x300/E0E0E0/404040?text=Image+Non+Disponible"; }}
                />
              </div>
              <div className="p-4 flex-grow flex flex-col">
                <h3 className="text-xl font-semibold text-gray-800 mb-1">{vehicle.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{vehicle.brand} {vehicle.model} ({vehicle.year})</p>
                <p className="text-2xl font-bold text-blue-600 mb-4">
                  {vehicle.type === 'buy' ? formatPrice(vehicle.price) : formatPrice(vehicle.dailyRate) + '/jour'}
                </p>
                <div className="flex items-center text-gray-500 text-sm mb-4 justify-between">
                  {vehicle.type === 'buy' ? (
                    <span>{vehicle.mileage?.toLocaleString()} km</span>
                  ) : (
                    <span>{vehicle.dailyRate?.toLocaleString()} FCFA/jour</span>
                  )}
                  <span className="text-gray-500 text-sm">
                    {vehicle.type === 'buy' ? `${vehicle.mileage?.toLocaleString()} km` : `${vehicle.passengers} passagers`}
                  </span>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateTo('vehicle-details', { id: vehicle._id, type: vehicle.type });
                    }}
                    className="flex-grow bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 font-semibold"
                  >
                    Voir les détails
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Empêche le clic sur la carte parent
                      handleRemoveFavorite(vehicle._id, vehicle.name);
                    }}
                    className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition-colors duration-200"
                    title="Retirer des favoris"
                  >
                    <Heart size={20} fill="currentColor" /> {/* Icône coeur rempli pour le retrait */}
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

export default FavoritePage;
