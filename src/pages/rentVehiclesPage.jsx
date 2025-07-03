// src/pages/RentVehiclesPage.jsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Loader2, Scale, Frown, Car, DollarSign, Calendar, Fuel, Gauge, Users, Heart } from 'lucide-react';
import SkeletonCard from '../components/SkeletonCard';
import { formatPrice } from '../utils/helpers';
import { makeAuthenticatedRequest } from '../utils/api';
import { UserContext } from '../context/userContext';

// Les props addToCompare et removeFromCompare sont désormais passées depuis App.jsx
const RentVehiclesPage = ({ navigateTo, showModal, compareList, handleToggleCompare }) => {
  const { user, userToken, fetchUserData } = useContext(UserContext); // Utilisez user et userToken du contexte
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    brand: '',
    model: '',
    minDailyRate: '',
    maxDailyRate: '',
    minPassengers: '',
    maxPassengers: '',
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);
    setVehicles([]);
    try {
      const queryParams = new URLSearchParams({ type: 'rent' }); // Toujours filtrer par 'rent'

      if (appliedFilters.brand) queryParams.append('brand', appliedFilters.brand);
      if (appliedFilters.model) queryParams.append('model', appliedFilters.model);
      if (appliedFilters.minDailyRate) queryParams.append('minDailyRate', appliedFilters.minDailyRate);
      if (appliedFilters.maxDailyRate) queryParams.append('maxDailyRate', appliedFilters.maxDailyRate);
      if (appliedFilters.minPassengers) queryParams.append('minPassengers', appliedFilters.minPassengers);
      if (appliedFilters.maxPassengers) queryParams.append('maxPassengers', appliedFilters.maxPassengers);

      const data = await makeAuthenticatedRequest(`/vehicles?${queryParams.toString()}`, 'GET');

      if (data.success) {
        setVehicles(data.data);
      } else {
        setError(data.msg || 'Erreur lors du chargement des véhicules.');
        showModal('Erreur de Chargement', data.msg || 'Impossible de charger les véhicules.', 'error');
      }
    } catch (err) {
      console.error('Erreur de récupération des véhicules:', err);
      setError(err.message || 'Erreur réseau lors de la récupération des véhicules.');
      showModal('Erreur Réseau', err.message || 'Impossible de se connecter au serveur.', 'error');
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, showModal]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
  };

  const handleResetFilters = () => {
    const resetValues = {
      brand: '',
      model: '',
      minDailyRate: '',
      maxDailyRate: '',
      minPassengers: '',
      maxPassengers: '',
    };
    setFilters(resetValues);
    setAppliedFilters(resetValues);
  };

  // Ajout de la logique de favoris (similaire à BuyVehiclesPage)
  const handleToggleFavorite = async (vehicleId, isCurrentlyFavorited) => {
    if (!user || !userToken) {
      showModal('Connexion Requise', 'Vous devez être connecté pour ajouter des véhicules à vos favoris.', 'info');
      navigateTo('auth');
      return;
    }

    try {
      const response = await makeAuthenticatedRequest(`/users/favorites/toggle`, 'POST', { vehicleId: vehicleId }, userToken);

      if (response.success) {
        showModal('Favoris', response.msg, 'success');
        fetchUserData(userToken); // Re-fetch les données utilisateur pour mettre à jour les favoris dans le contexte
      } else {
        showModal('Erreur Favoris', response.msg || 'Une erreur est survenue lors de la mise à jour des favoris.', 'error');
      }
    } catch (err) {
      console.error('Erreur toggle favori:', err);
      showModal('Erreur Réseau', err.message || 'Impossible de se connecter au serveur pour gérer les favoris.', 'error');
    }
  };

  const handleViewComparisonList = () => {
    navigateTo('comparaison');
  };


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">Véhicules à Louer</h1>

      {/* Section Filtres */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Filtrer les Véhicules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <input
            type="text"
            name="brand"
            placeholder="Marque"
            value={filters.brand}
            onChange={handleFilterChange}
            className="p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          />
          <input
            type="text"
            name="model"
            placeholder="Modèle"
            value={filters.model}
            onChange={handleFilterChange}
            className="p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          />
          <input
            type="number"
            name="minDailyRate"
            placeholder="Tarif journalier Min. (XOF)"
            value={filters.minDailyRate}
            onChange={handleFilterChange}
            className="p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          />
          <input
            type="number"
            name="maxDailyRate"
            placeholder="Tarif journalier Max. (XOF)"
            value={filters.maxDailyRate}
            onChange={handleFilterChange}
            className="p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          />
          <input
            type="number"
            name="minPassengers"
            placeholder="Passagers Min."
            value={filters.minPassengers}
            onChange={handleFilterChange}
            className="p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          />
          <input
            type="number"
            name="maxPassengers"
            placeholder="Passagers Max."
            value={filters.maxPassengers}
            onChange={handleFilterChange}
            className="p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={handleApplyFilters}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 font-semibold shadow-md"
          >
            Appliquer les filtres
          </button>
          <button
            onClick={handleResetFilters}
            className="bg-gray-300 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors duration-200 font-semibold shadow-md"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-500 text-lg flex flex-col items-center">
          <Frown size={50} className="mb-4" />
          <p>{error}</p>
          <p className="text-gray-500 text-sm mt-2">Veuillez réessayer plus tard.</p>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-10 text-gray-500 text-lg flex flex-col items-center">
          <Car size={50} className="mb-4" />
          <p>Aucun véhicule à louer ne correspond à vos critères.</p>
          <button
            onClick={handleResetFilters}
            className="mt-4 text-green-600 hover:underline"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {vehicles.map((vehicle) => {
            const isFavorited = user?.favorites?.includes(vehicle._id) || false;
            const isInCompareList = compareList.includes(vehicle._id);

            // Déterminer l'URL de l'image à afficher
            const imageUrl = (vehicle.images && vehicle.images.length > 0)
              ? (vehicle.images[vehicle.coverImageIndex] || vehicle.images[0])
              : "https://placehold.co/400x300/E0E0E0/404040?text=Image+Non+Disponible";

            return (
              <div
                key={vehicle._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                onClick={() => navigateTo('vehicle-details', { id: vehicle._id, type: vehicle.type })}
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x300/E0E0E0/404040?text=Image+Non+Disponible"; }}
                  />
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(vehicle._id, isFavorited);
                      }}
                      className={`p-2 rounded-full shadow-md transition-colors duration-200
                        ${isFavorited ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white text-gray-600 hover:text-red-500'}
                      `}
                      title={isFavorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    >
                      <Heart size={20} fill={isFavorited ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </div>
                <div className="p-4 flex-grow flex flex-col">
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">{vehicle.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{vehicle.brand} {vehicle.model} ({vehicle.year})</p>
                  <p className="text-2xl font-bold text-green-600 mb-4">{formatPrice(vehicle.dailyRate)} / jour</p>

                  <div className="flex items-center text-gray-500 text-sm mb-2">
                    <Users size={16} className="mr-2" />
                    <span>{vehicle.passengers} passagers</span>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm mb-4">
                    <Fuel size={16} className="mr-2" />
                    <span>{vehicle.fuel}</span>
                  </div>

                  <div className="flex gap-3 mt-auto mb-4"> {/* Conteneur pour les boutons */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleCompare(vehicle._id);
                      }}
                      className={`p-2 rounded-md transition-colors duration-200 ${
                        isInCompareList
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      }`}
                      title={isInCompareList ? 'Retirer du comparateur' : 'Ajouter au comparateur'}
                    >
                      <Scale size={20} />
                    </button>
                    {/* Bouton "Voir Détails" */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateTo('vehicle-details', { id: vehicle._id, type: vehicle.type });
                      }}
                      className="flex-grow bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 font-semibold"
                    >
                      Voir les détails
                    </button>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateTo('reservation-form', { vehicle: vehicle });
                    }}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors duration-200 font-semibold"
                  >
                    Réserver maintenant
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bouton pour voir la liste de comparaison (conditionnel) */}
      {compareList.length > 0 && (
        <div className="text-center mt-8">
          <button
            onClick={handleViewComparisonList}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors duration-200 shadow-lg text-lg font-semibold"
            title="Voir la liste de comparaison"
          >
            Voir la liste de comparaison ({compareList.length} véhicules)
          </button>
        </div>
      )}
    </div>
  );
};

export default RentVehiclesPage;
