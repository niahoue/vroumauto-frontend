// src/pages/ComparisonPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, XCircle, Car, DollarSign, Calendar, Fuel, Gauge, Users, Tag, AlertTriangle } from 'lucide-react';
import { makeAuthenticatedRequest } from '../utils/api'; // Importez l'utilitaire API
import { formatPrice } from '../utils/helpers'; // Importez le helper pour formater le prix

// Ajout de removeFromCompare dans les props
const ComparisonPage = ({ navigateTo, showModal, compareList, clearCompare, removeFromCompare }) => {
  const [vehiclesToCompare, setVehiclesToCompare] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fonction pour récupérer les détails des véhicules à comparer
  const fetchVehiclesForComparison = useCallback(async () => {
    setLoading(true);
    setError(null);
    setVehiclesToCompare([]); // Vide la liste actuelle des véhicules avant un nouveau fetch

    if (compareList.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const fetchedVehicles = [];
      for (const vehicleId of compareList) {
        // Utilise makeAuthenticatedRequest pour chaque véhicule
        // Le chemin est relatif car makeAuthenticatedRequest gère la base URL
        const data = await makeAuthenticatedRequest(`/vehicles/${vehicleId}`, 'GET');
        if (data.success) {
          fetchedVehicles.push(data.data);
        } else {
          console.error(`Erreur lors du chargement du véhicule ${vehicleId}:`, data.msg || 'Erreur inconnue.');
          showModal('Erreur de Chargement', `Impossible de charger le véhicule ID: ${vehicleId}. ${data.msg || ''}`, 'error');
        }
      }
      setVehiclesToCompare(fetchedVehicles);
    } catch (err) {
      console.error('Erreur de récupération des véhicules pour comparaison:', err);
      setError(err.message || 'Erreur réseau lors de la récupération des véhicules.');
      showModal('Erreur Réseau', err.message || 'Impossible de se connecter au serveur.', 'error');
    } finally {
      setLoading(false);
    }
  }, [compareList, showModal]); // Dépend de compareList et showModal

  useEffect(() => {
    fetchVehiclesForComparison();
  }, [fetchVehiclesForComparison]); // Re-déclenche quand fetchVehiclesForComparison change (i.e., quand compareList change)

  // Extraire toutes les clés de spécifications uniques de tous les véhicules
  const allSpecsKeys = [
    ...new Set(vehiclesToCompare.flatMap(vehicle => Object.keys(vehicle.specs || {})))
  ].sort(); // Trie les clés pour un affichage cohérent

  // Spécifications de base à toujours afficher en haut du tableau
  const basicSpecs = [
    { key: 'price', label: 'Prix', icon: DollarSign, format: formatPrice },
    { key: 'dailyRate', label: 'Tarif Journalier', icon: DollarSign, format: formatPrice }, // Pour les véhicules de location
    { key: 'year', label: 'Année', icon: Calendar, format: (val) => val || 'N/A' },
    { key: 'mileage', label: 'Kilométrage', icon: Gauge, format: (val) => val ? `${val.toLocaleString()} km` : 'N/A' }, // Pour les véhicules à vendre
    { key: 'fuel', label: 'Carburant', icon: Fuel, format: (val) => val || 'N/A' },
    { key: 'passengers', label: 'Passagers', icon: Users, format: (val) => val || 'N/A' }, // Pour les véhicules de location
  ];


  return (
    <div className="container mx-auto p-4 bg-white rounded-xl shadow-lg border border-gray-100">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-6 text-center">Comparaison de Véhicules</h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
          <p className="ml-4 text-gray-600 text-lg">Chargement des véhicules pour comparaison...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-500 text-lg flex flex-col items-center">
          <AlertTriangle size={50} className="mb-4" />
          <p>{error}</p>
          <p className="text-gray-500 text-sm mt-2">Veuillez réessayer plus tard.</p>
        </div>
      ) : vehiclesToCompare.length === 0 ? (
        <div className="text-center py-10 text-gray-500 text-lg flex flex-col items-center">
          <Car size={50} className="mb-4" />
          <p>Aucun véhicule à comparer. Ajoutez des véhicules depuis les pages "Acheter" ou "Louer".</p>
          <button
            onClick={() => navigateTo('buy')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 font-semibold"
          >
            Voir les véhicules à vendre
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto relative shadow-md rounded-lg">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="py-3 px-4 sticky left-0 bg-gray-50 z-10 w-48">Caractéristique</th>
                {vehiclesToCompare.map((vehicle) => (
                  <th key={vehicle._id} scope="col" className="py-3 px-4 text-center">
                    <div className="flex flex-col items-center">
                      <img
                        src={vehicle.images[vehicle.coverImageIndex] || "https://placehold.co/100x75/E0E0E0/404040?text=Image"}
                        alt={vehicle.name}
                        className="w-24 h-18 object-cover rounded-md mb-2"
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x75/E0E0E0/404040?text=Image"; }}
                      />
                      <span className="font-bold text-gray-800 text-base">{vehicle.name}</span>
                      <span className="text-gray-600 text-xs">{vehicle.brand} {vehicle.model}</span>
                      {/* Utilise removeFromCompare ici */}
                      <button
                        onClick={() => removeFromCompare(vehicle._id)}
                        className="text-red-500 hover:text-red-700 mt-1 text-xs flex items-center"
                        title="Retirer de la comparaison"
                      >
                        <XCircle size={14} className="mr-1" /> Retirer
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Lignes pour les spécifications de base */}
              {basicSpecs.map((spec) => {
                const shouldDisplayRow = vehiclesToCompare.some(vehicle => {
                  if (spec.key === 'dailyRate' && vehicle.type === 'rent' && vehicle.dailyRate !== undefined) return true;
                  if (spec.key === 'mileage' && vehicle.type === 'buy' && vehicle.mileage !== undefined) return true;
                  return (spec.key === 'price' || vehicle[spec.key] !== undefined || (vehicle.specs && vehicle.specs[spec.key] !== undefined));
                });

                if (!shouldDisplayRow) return null;

                return (
                  <tr key={spec.key} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-800 flex items-center sticky left-0 bg-white z-0">
                      {spec.icon && <spec.icon size={18} className="mr-2 text-gray-600" />} {spec.label}
                    </td>
                    {vehiclesToCompare.map((vehicle) => (
                      <td key={vehicle._id} className="py-3 px-4 text-center text-sm">
                        {spec.key === 'price' && vehicle.type === 'buy' ? spec.format(vehicle.price) :
                         spec.key === 'dailyRate' && vehicle.type === 'rent' ? spec.format(vehicle.dailyRate) + '/jour' :
                         spec.key === 'mileage' && vehicle.type === 'buy' ? spec.format(vehicle.mileage) :
                         spec.key === 'passengers' && vehicle.type === 'rent' ? spec.format(vehicle.passengers) :
                         (vehicle[spec.key] || vehicle.specs?.[spec.key] || 'N/A')}
                      </td>
                    ))}
                  </tr>
                );
              })}

              {/* Lignes pour les spécifications dynamiques (extraites de 'specs' Map) */}
              {allSpecsKeys.map((key) => (
                <tr key={key} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-800 flex items-center sticky left-0 bg-white z-0">
                    <Tag size={18} className="mr-2 text-gray-600" /> {key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}
                  </td>
                  {vehiclesToCompare.map((vehicle) => (
                    <td key={vehicle._id} className="py-3 px-4 text-center text-sm">
                      {vehicle.specs?.[key] || 'N/A'}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Ligne d'actions */}
              <tr className="border-t border-gray-300 bg-gray-50">
                <td className="py-3 px-4 text-sm font-bold text-gray-800 sticky left-0 bg-gray-50 z-0">Actions</td>
                {vehiclesToCompare.map((vehicle) => (
                  <td key={vehicle._id} className="py-3 px-4 text-center">
                    <button
                      onClick={() => navigateTo('vehicle-details', { id: vehicle._id, type: vehicle.type })}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 font-semibold"
                    >
                      Voir les détails
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {vehiclesToCompare.length > 0 && (
        <div className="text-center mt-8">
          <button
            onClick={clearCompare}
            className="bg-red-500 text-white px-6 py-3 rounded-md hover:bg-red-600 transition-colors duration-200 font-semibold shadow-lg"
          >
            Effacer la liste de comparaison
          </button>
        </div>
      )}
    </div>
  );
};

export default ComparisonPage;
