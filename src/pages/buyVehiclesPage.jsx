// src/pages/BuyVehiclesPage.jsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Loader2, Heart, Scale, Frown, Car, DollarSign, Calendar, Fuel, Gauge, Users } from 'lucide-react';
import SkeletonCard from '../components/SkeletonCard';
import { formatPrice } from '../utils/helpers';
import { makeAuthenticatedRequest } from '../utils/api';
import { UserContext } from '../context/userContext';

// Les props addToCompare et removeFromCompare sont désormais passées depuis App.jsx
const BuyVehiclesPage = ({ navigateTo, showModal, compareList, handleToggleCompare }) => {
  const { user, userToken, fetchUserData } = useContext(UserContext); // Utilisez user et userToken du contexte
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    brand: '',
    model: '',
    minPrice: '',
    maxPrice: '',
    minYear: '',
    maxYear: '',
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);
    setVehicles([]); // Vide la liste actuelle des véhicules avant un nouveau fetch
    try {
      const queryParams = new URLSearchParams({ type: 'buy' }); // Toujours filtrer par 'buy'

      // Appliquer les filtres depuis appliedFilters
      if (appliedFilters.brand) queryParams.append('brand', appliedFilters.brand);
      if (appliedFilters.model) queryParams.append('model', appliedFilters.model);
      if (appliedFilters.minPrice) queryParams.append('minPrice', appliedFilters.minPrice);
      if (appliedFilters.maxPrice) queryParams.append('maxPrice', appliedFilters.maxPrice);
      if (appliedFilters.minYear) queryParams.append('minYear', appliedFilters.minYear);
      if (appliedFilters.maxYear) queryParams.append('maxYear', appliedFilters.maxYear);

      // Utiliser makeAuthenticatedRequest pour l'appel API
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
  }, [appliedFilters, showModal]); // Dépendances pour useCallback

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filters); // Applique les filtres et déclenche le fetch
  };

  const handleResetFilters = () => {
    const resetValues = {
      brand: '',
      model: '',
      minPrice: '',
      maxPrice: '',
      minYear: '',
      maxYear: '',
    };
    setFilters(resetValues);
    setAppliedFilters(resetValues); // Applique les filtres effacés
  };

  // Logique pour gérer l'ajout/retrait des favoris via l'API et la mise à jour du contexte
  const handleToggleFavorite = async (vehicleId, isCurrentlyFavorited) => {
    if (!user || !userToken) {
      showModal('Connexion Requise', 'Vous devez être connecté pour ajouter des véhicules à vos favoris.', 'info');
      navigateTo('auth');
      return;
    }

    try {
      // makeAuthenticatedRequest gère déjà la méthode et l'URL.
      // Le point de terminaison '/users/favorites/toggle' est un POST,
      // et le backend décide d'ajouter ou de retirer en fonction de la logique interne.
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
    navigateTo('comparaison'); // Navigue vers la page de comparaison
  };


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">Véhicules à Vendre</h1>

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
            className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="text"
            name="model"
            placeholder="Modèle"
            value={filters.model}
            onChange={handleFilterChange}
            className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="number"
            name="minPrice"
            placeholder="Prix Min. (XOF)"
            value={filters.minPrice}
            onChange={handleFilterChange}
            className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="number"
            name="maxPrice"
            placeholder="Prix Max. (XOF)"
            value={filters.maxPrice}
            onChange={handleFilterChange}
            className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="number"
            name="minYear"
            placeholder="Année Min."
            value={filters.minYear}
            onChange={handleFilterChange}
            className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="number"
            name="maxYear"
            placeholder="Année Max."
            value={filters.maxYear}
            onChange={handleFilterChange}
            className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={handleApplyFilters}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 font-semibold shadow-md"
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
          <p>Aucun véhicule à vendre ne correspond à vos critères.</p>
          <button
            onClick={handleResetFilters}
            className="mt-4 text-blue-600 hover:underline"
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
            // Utilisez vehicle.images[vehicle.coverImageIndex] si disponible, sinon la première image, sinon un placeholder
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
                        handleToggleFavorite(vehicle._id, isFavorited); // isFavorited est déjà un booléen
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
                  <p className="text-2xl font-bold text-blue-600 mb-4">{formatPrice(vehicle.price)}</p>

                  <div className="flex items-center text-gray-500 text-sm mb-2">
                    <Gauge size={16} className="mr-2" />
                    <span>{vehicle.mileage?.toLocaleString()} km</span>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm mb-4">
                    <Fuel size={16} className="mr-2" />
                    <span>{vehicle.fuel}</span>
                  </div>

                  <div className="flex items-center justify-between mt-auto mb-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Empêche l'événement de navigation du parent
                        handleToggleCompare(vehicle._id); // handleToggleCompare gère l'ajout/retrait
                      }}
                      className={`flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200
                        ${isInCompareList
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                      title={isInCompareList ? "Retirer de la comparaison" : "Ajouter à la comparaison"}
                    >
                      <Scale size={16} className="mr-1" />
                      Comparer
                    </button>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateTo('vehicle-details', { id: vehicle._id, type: vehicle.type });
                    }}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 font-semibold"
                  >
                    Voir les détails
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

export default BuyVehiclesPage;
