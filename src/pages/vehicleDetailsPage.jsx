// src/pages/vehicleDetailsPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Heart, Scale } from 'lucide-react'; // Ajout de Heart et Scale pour les icônes

// Cette page accepte `vehicleId`, `vehicleType`, `navigateTo`, `showModal` et `vehicleData` (optionnel, pour données factices) comme props
const VehicleDetailsPage = ({ vehicleId, vehicleType, navigateTo, showModal, vehicleData: initialVehicleData }) => {
  const [vehicle, setVehicle] = useState(initialVehicleData || null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Nouveaux états pour les favoris et la comparaison
  const [isFavorited, setIsFavorited] = useState(false);
  const [comparisonList, setComparisonList] = useState([]); // Stocke les IDs des véhicules à comparer

  const hasFetchedRef = useRef(false);

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const fetchVehicleData = async () => {
      // Vérification simple si l'ID ressemble à un ID MongoDB réel
      const isRealObjectId = (str) => /^[0-9a-fA-F]{24}$/.test(str);

      // Si initialVehicleData est fourni et que son _id n'est pas un vrai ObjectId (donc c'est une fausse donnée)
      // OU si hasFetchedRef est déjà vrai (pour éviter les double fetch en mode StrictMode de React)
      if (initialVehicleData && !isRealObjectId(initialVehicleData._id) && !hasFetchedRef.current) {
        setVehicle(initialVehicleData);
        setLoading(false);
        hasFetchedRef.current = true; // Marquer comme déjà traité
        return;
      }

      // Si l'ID du véhicule n'est pas fourni via les props, on ne peut pas faire de fetch
      if (!vehicleId && !initialVehicleData?._id) {
        setError('ID du véhicule manquant pour l\'affichage des détails.');
        setLoading(false);
        return;
      }

      // Utiliser vehicleId s'il est disponible, sinon l'ID de initialVehicleData
      const idToFetch = vehicleId || initialVehicleData._id;

      if (hasFetchedRef.current) return; // Empêcher le double fetch en développement StrictMode

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/vehicles/${idToFetch}`);
        const data = await response.json();

        if (response.ok) {
          setVehicle(data.data);
          // Initialiser l'état des favoris et de la comparaison après avoir chargé le véhicule
          const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
          setIsFavorited(favorites.includes(data.data._id));

          const compares = JSON.parse(localStorage.getItem('comparisonItems') || '[]');
          setComparisonList(compares);

        } else {
          setError(data.msg || 'Erreur lors du chargement des détails du véhicule.');
          showModal('Erreur de Chargement', data.msg || 'Impossible de charger les détails du véhicule.', 'error');
          navigateTo('home'); // Rediriger en cas d'erreur grave
        }
      } catch (err) {
        console.error('Erreur réseau ou serveur:', err);
        setError('Impossible de se connecter au serveur pour charger les détails du véhicule.');
        showModal('Erreur Réseau', 'Impossible de se connecter au serveur. Veuillez vérifier votre connexion.', 'error');
        navigateTo('home'); // Rediriger en cas d'erreur réseau
      } finally {
        setLoading(false);
        hasFetchedRef.current = true;
      }
    };

    fetchVehicleData();
  }, [vehicleId, initialVehicleData, navigateTo, showModal]);

  // Gestion de l'état des favoris
  const handleToggleFavorite = () => {
    if (!vehicle) return; // S'assurer que le véhicule est chargé

    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const vehicleIdStr = vehicle._id;

    if (favorites.includes(vehicleIdStr)) {
      // Retirer des favoris
      favorites = favorites.filter(id => id !== vehicleIdStr);
      setIsFavorited(false);
      showModal('Favoris', `${vehicle.name} a été retiré de vos favoris.`, 'info');
    } else {
      // Ajouter aux favoris
      favorites.push(vehicleIdStr);
      setIsFavorited(true);
      showModal('Favoris', `${vehicle.name} a été ajouté à vos favoris !`, 'success');
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
  };

  // Gestion de l'état de comparaison
  const handleToggleCompare = () => {
    if (!vehicle) return; // S'assurer que le véhicule est chargé

    let compares = JSON.parse(localStorage.getItem('comparisonItems') || '[]');
    const vehicleIdStr = vehicle._id;
    const MAX_COMPARE_ITEMS = 3; // Limite de 3 véhicules pour la comparaison

    if (compares.includes(vehicleIdStr)) {
      // Retirer de la comparaison
      compares = compares.filter(id => id !== vehicleIdStr);
      showModal('Comparaison', `${vehicle.name} a été retiré de la liste de comparaison.`, 'info');
    } else {
      // Ajouter à la comparaison
      if (compares.length >= MAX_COMPARE_ITEMS) {
        showModal(
          'Limite de Comparaison Atteinte',
          `Vous ne pouvez comparer que ${MAX_COMPARE_ITEMS} véhicules à la fois. Veuillez en retirer un pour en ajouter un nouveau.`,
          'error'
        );
        return;
      }
      compares.push(vehicleIdStr);
      showModal('Comparaison', `${vehicle.name} a été ajouté à la liste de comparaison. Il y a ${compares.length} véhicule(s) dans votre liste.`, 'success');
    }
    localStorage.setItem('comparisonItems', JSON.stringify(compares));
    setComparisonList(compares); // Mettre à jour l'état local
  };

  // Si le chargement est en cours
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen-75">
        <Loader2 className="animate-spin text-blue-600 w-16 h-16" />
        <p className="ml-4 text-xl text-gray-700">Chargement des détails du véhicule...</p>
      </div>
    );
  }

  // Si une erreur est survenue après le chargement
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen-75 bg-red-100 border border-red-400 text-red-700 p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Erreur</h2>
        <p className="text-lg text-center">{error}</p>
        <button
          onClick={() => navigateTo('home')}
          className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-lg text-lg font-semibold"
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  // Si le véhicule est null après le chargement (par exemple, ID invalide non détecté plus tôt)
  if (!vehicle) {
    return (
      <div className="flex flex-col items-center justify-center h-screen-75 bg-yellow-100 border border-yellow-400 text-yellow-700 p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Véhicule non trouvé</h2>
        <p className="text-lg text-center">Les détails du véhicule n'ont pas pu être chargés.</p>
        <button
          onClick={() => navigateTo('home')}
          className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-lg text-lg font-semibold"
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  // Fonctions de navigation pour les images du carrousel
  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      (prevIndex + 1) % vehicle.images.length
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      (prevIndex - 1 + vehicle.images.length) % vehicle.images.length
    );
  };

  // Déterminez si c'est un véhicule à vendre ou à louer pour l'affichage du prix/taux
  const isForRent = vehicle.type === 'rent';

  // Liste des champs à exclure des spécifications détaillées
  const excludedSpecFields = [
    'name', 'brand', 'model', 'year', 'mileage', 'fuel', 'price', 'dailyRate',
    'passengers', 'description', 'images', 'coverImageIndex', 'type',
    'isFeatured', '_id', '__v', 'user', 'createdAt', 'resetPasswordToken', 'resetPasswordExpire' // Assurez-vous d'exclure les champs User si présents par erreur
  ];


  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-6xl mx-auto my-8">
      <button
        onClick={() => navigateTo(isForRent ? 'rent' : 'buy')}
        className="text-gray-600 hover:text-blue-600 flex items-center mb-6 transition-colors duration-200"
      >
        <ChevronLeft size={20} className="mr-2" /> Retour à la liste
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Colonne Gauche: Images du Carrousel */}
        <div className="relative rounded-xl overflow-hidden shadow-md group">
          <img
            src={vehicle.images[currentImageIndex] || 'https://placehold.co/800x600/E0E7FF/3730A3?text=Image+non+disponible'}
            alt={`${vehicle.name} - ${currentImageIndex + 1}`}
            className="w-full h-80 md:h-96 object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/800x600/E0E7FF/3730A3?text=Image+non+disponible'; }}
          />
          {vehicle.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full shadow-lg hover:bg-opacity-75 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                aria-label="Image précédente"
              >
                <ChevronLeft size={28} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full shadow-lg hover:bg-opacity-75 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                aria-label="Image suivante"
              >
                <ChevronRight size={28} />
              </button>
            </>
          )}
          {/* Indicateurs de pagination des images */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {vehicle.images.map((_, index) => (
              <span
                key={index}
                className={`block w-3 h-3 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-gray-400 bg-opacity-70'} cursor-pointer`}
                onClick={() => setCurrentImageIndex(index)}
                aria-label={`Voir l'image ${index + 1}`}
              ></span>
            ))}
          </div>
        </div>

        {/* Colonne Droite: Détails du Véhicule */}
        <div className="flex flex-col justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{vehicle.name}</h1>
            <p className="text-xl text-gray-700 mb-4">{vehicle.brand} - {vehicle.model} ({vehicle.year})</p>

            <div className="flex items-baseline mb-6">
              {isForRent ? (
                <span className="text-4xl font-extrabold text-green-600 mr-2">
                  {vehicle.dailyRate.toLocaleString()} FCFA/jour
                </span>
              ) : (
                <span className="text-4xl font-extrabold text-blue-600 mr-2">
                  {vehicle.price.toLocaleString()} FCFA
                </span>
              )}
            </div>

            {/* Boutons Favoris et Comparaison */}
            <div className="flex space-x-4 mb-6">
              <button
                onClick={handleToggleFavorite}
                className={`flex items-center px-4 py-2 rounded-md transition-colors duration-200 shadow-sm
                  ${isFavorited ? 'bg-pink-500 text-white hover:bg-pink-600' : 'bg-pink-100 text-pink-600 hover:bg-pink-200'}`
                }
                title={isFavorited ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                <Heart size={20} className={`mr-2 ${isFavorited ? 'fill-current' : ''}`} />
                {isFavorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              </button>
              <button
                onClick={handleToggleCompare}
                className={`flex items-center px-4 py-2 rounded-md transition-colors duration-200 shadow-sm
                  ${comparisonList.includes(vehicle._id) ? 'bg-purple-500 text-white hover:bg-purple-600' : 'bg-purple-100 text-purple-600 hover:bg-purple-200'}`
                }
                title={comparisonList.includes(vehicle._id) ? "Retirer de la comparaison" : "Ajouter à la comparaison"}
              >
                <Scale size={20} className="mr-2" />
                {comparisonList.includes(vehicle._id) ? 'Retirer de la comparaison' : 'Ajouter à la comparaison'}
                {comparisonList.length > 0 && ` (${comparisonList.length})`}
              </button>
              {/* Bouton pour voir la liste de comparaison (conditionnel) */}
              {comparisonList.length > 0 && (
                <button
                  onClick={() => showModal(
                    'Véhicules à Comparer',
                    `Actuellement ${comparisonList.length} véhicule(s) sélectionné(s) pour la comparaison. Pour une comparaison détaillée, vous devrez naviguer vers une page de comparaison dédiée.`,
                    'info'
                  )}
                  className="flex items-center px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200 shadow-sm"
                  title="Voir la liste de comparaison"
                >
                  Voir la liste
                </button>
              )}
            </div>

            <p className="text-gray-700 leading-relaxed mb-6">
              {vehicle.description || 'Aucune description disponible pour ce véhicule.'}
            </p>

            {/* Spécifications Détaillées */}
            <div className="mb-6">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Spécifications</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700">
                <li className="flex items-center"><strong className="w-1/2 font-medium">Type :</strong> <span className="w-1/2 capitalize">{vehicle.type}</span></li>
                <li className="flex items-center"><strong className="w-1/2 font-medium">Carburant :</strong> <span className="w-1/2">{vehicle.fuel}</span></li>
                <li className="flex items-center"><strong className="w-1/2 font-medium">Kilométrage :</strong> <span className="w-1/2">{vehicle.mileage?.toLocaleString() || 'N/A'} km</span></li>
                <li className="flex items-center"><strong className="w-1/2 font-medium">Passagers :</strong> <span className="w-1/2">{vehicle.passengers || 'N/A'}</span></li>
                 {/* Boucle sur les specs dynamiques */}
                {vehicle.specs && Object.entries(vehicle.specs).map(([key, value]) => (
                  !excludedSpecFields.includes(key) && (
                    <li key={key} className="flex items-center">
                      <strong className="w-1/2 font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()} :</strong>
                      <span className="w-1/2">{value}</span>
                    </li>
                  )
                ))}
              </ul>
            </div>
          </div>

          {/* Section Bouton (Acheter ou Réserver) */}
          {isForRent ? (
            <button
              onClick={() => navigateTo('reservation-form', { vehicle: vehicle })}
              className="w-full bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors duration-200 shadow-lg text-lg font-semibold transform hover:scale-105"
            >
              Réserver maintenant
            </button>
          ) : (
            <>
              <p className="text-gray-700 text-center mb-4">Intéressé par ce véhicule ? Contactez-nous pour l'acheter !</p>
              <button
                onClick={() => navigateTo('contact', { initialValues: { subject: `Demande d'achat: ${vehicle.name} (${vehicle.year})`, message: `Bonjour, je suis intéressé(e) par le véhicule ${vehicle.brand} ${vehicle.model} (${vehicle.year}). Veuillez me contacter pour plus d'informations.` } })}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-lg text-lg font-semibold transform hover:scale-105"
              >
                Contacter pour l'achat
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailsPage;
