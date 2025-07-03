// src/pages/UserProfilePage.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Heart, Calendar, Car, Wrench, ChevronRight, Loader2, User as UserIcon, Mail, Phone, Clock } from 'lucide-react'; // Importez d'autres icônes
import { UserContext } from '../context/userContext';
import { makeAuthenticatedRequest } from '../utils/api';
import { formatPrice } from '../utils/helpers';

const UserProfilePage = ({ navigateTo, showModal }) => {
  const { user, userToken, isAuthLoading, fetchUserData } = useContext(UserContext); // Récupérer l'utilisateur du contexte
  const [loadingContent, setLoadingContent] = useState(true); // Pour le chargement des données spécifiques à la page
  const [error, setError] = useState(null);

  // States pour les données spécifiques de l'utilisateur
  const [reservations, setReservations] = useState([]);
  const [favoriteVehicles, setFavoriteVehicles] = useState([]);
  const [testDriveRequests, setTestDriveRequests] = useState([]);

  // Utiliser un useCallback pour les fonctions de fetch afin d'éviter les recréations inutiles
  const fetchUserSpecificData = useCallback(async () => {
    if (!user || !userToken) {
      // Géré par UserContext, mais une sécurité supplémentaire ici
      setLoadingContent(false);
      return;
    }

    setLoadingContent(true);
    setError(null);

    try {
      // Fetch Reservations
      const reservationsData = await makeAuthenticatedRequest('/reservations/my', 'GET', null, userToken);
      if (reservationsData.success) {
        setReservations(reservationsData.data);
      } else {
        console.error('Erreur de récupération des réservations:', reservationsData.msg);
        setError(reservationsData.msg || 'Erreur lors du chargement de vos réservations.');
      }

      // Fetch Test Drives
      const testDrivesData = await makeAuthenticatedRequest('/testdrives/my', 'GET', null, userToken);
      if (testDrivesData.success) {
        setTestDriveRequests(testDrivesData.data);
      } else {
        console.error('Erreur de récupération des demandes d\'essai:', testDrivesData.msg);
        setError(testDrivesData.msg || 'Erreur lors du chargement de vos demandes d\'essai.');
      }

      // Fetch Favorites (déjà populés via le user object du contexte si le backend est configuré ainsi)
      // Si le user object du contexte contient déjà les favoris populés, pas besoin de refaire un appel API ici
      if (user && user.favorites) {
        // Assurez-vous que favorites est un tableau et contient les objets véhicule complets
        setFavoriteVehicles(user.favorites);
      } else {
        // Sinon, si les favoris ne sont pas populés dans user.favorites, faites un appel pour les obtenir
        const favoritesData = await makeAuthenticatedRequest('/users/favorites', 'GET', null, userToken);
        if (favoritesData.success) {
          setFavoriteVehicles(favoritesData.data);
        } else {
          console.error('Erreur de récupération des favoris:', favoritesData.msg);
          setError(favoritesData.msg || 'Erreur lors du chargement de vos favoris.');
        }
      }

    } catch (err) {
      console.error('Erreur globale de récupération de données profil:', err);
      setError(err.message || 'Erreur réseau lors du chargement de vos données.');
      showModal('Erreur Réseau', err.message || 'Impossible de se connecter au serveur.', 'error');
    } finally {
      setLoadingContent(false);
    }
  }, [user, userToken, showModal]); // Dépendances de fetchUserSpecificData

  useEffect(() => {
    // Ne fetch les données spécifiques que si l'authentification est terminée et l'utilisateur est présent
    if (!isAuthLoading && user) {
      fetchUserSpecificData();
    }
  }, [isAuthLoading, user, fetchUserSpecificData]); // Déclenche quand l'état d'auth change ou l'objet user

  // Si l'authentification est encore en cours de chargement ou si l'utilisateur est null/non chargé
  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center h-screen-minus-header">
        <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
        <p className="ml-4 text-gray-700 text-lg">Chargement du profil...</p>
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté après le chargement, rediriger ou afficher un message
  if (!user) {
    return (
      <div className="text-center py-10 text-red-500 text-lg flex flex-col items-center">
        <Frown size={50} className="mb-4" />
        <p>Vous devez être connecté pour voir cette page.</p>
        <button
          onClick={() => navigateTo('auth')}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 font-semibold"
        >
          Se connecter
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">Mon Profil</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Erreur :</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {/* Informations de base de l'utilisateur */}
      <div className="bg-white p-8 rounded-xl shadow-lg mb-8 border border-gray-100 flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8">
        <div className="flex-shrink-0">
          <UserIcon size={80} className="text-blue-600 bg-blue-50 p-3 rounded-full" />
        </div>
        <div className="text-center md:text-left flex-grow">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{user.email}</h2>
          <p className="text-gray-700 text-lg flex items-center justify-center md:justify-start mb-1">
            <Mail size={20} className="mr-2 text-gray-500" /> {user.email}
          </p>
          {user.phone && (
            <p className="text-gray-700 text-lg flex items-center justify-center md:justify-start mb-1">
              <Phone size={20} className="mr-2 text-gray-500" /> {user.phone}
            </p>
          )}
          <p className="text-gray-700 text-lg flex items-center justify-center md:justify-start">
            <Clock size={20} className="mr-2 text-gray-500" /> Membre depuis : {new Date(user.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p className="text-gray-700 text-lg flex items-center justify-center md:justify-start mt-2">
            Rôle : <span className="font-semibold ml-2 capitalize">{user.role}</span>
          </p>
        </div>
      </div>

      {/* Sections dynamiques (Favoris, Réservations, Essais) */}
      {loadingContent ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="animate-spin h-10 w-10 text-gray-500" />
          <p className="ml-3 text-gray-600">Chargement de vos données...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Section Mes Favoris */}
          <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Heart size={28} className="mr-3 text-red-600" fill="currentColor" />
              Mes Favoris ({favoriteVehicles.length})
            </h2>
            {favoriteVehicles.length === 0 ? (
              <p className="text-gray-600">Vous n'avez pas encore de véhicules favoris.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoriteVehicles.slice(0, 3).map((vehicle) => ( // Afficher les 3 premiers favoris
                  <div key={vehicle._id} className="border border-gray-200 rounded-lg p-3 flex items-center space-x-3">
                    <img
                      src={(vehicle.images && vehicle.images.length > 0) ? (vehicle.images[vehicle.coverImageIndex] || vehicle.images[0]) : "https://placehold.co/80x60/E0E0E0/404040?text=Auto"}
                      alt={vehicle.name}
                      className="w-20 h-16 object-cover rounded-md"
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/80x60/E0E0E0/404040?text=Auto"; }}
                    />
                    <div>
                      <p className="font-semibold text-gray-800">{vehicle.name}</p>
                      <p className="text-sm text-gray-600">{formatPrice(vehicle.price || vehicle.dailyRate)} {vehicle.type === 'rent' && '/jour'}</p>
                    </div>
                    <button
                      onClick={() => navigateTo('vehicle-details', { id: vehicle._id, type: vehicle.type })}
                      className="ml-auto text-blue-600 hover:text-blue-800"
                      title="Voir les détails"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {favoriteVehicles.length > 0 && (
              <div className="text-center mt-4">
                <button
                  onClick={() => navigateTo('favorites')}
                  className="text-blue-600 hover:underline flex items-center mx-auto"
                >
                  Voir tous les favoris <ChevronRight size={18} className="ml-1" />
                </button>
              </div>
            )}
          </div>

          {/* Section Mes Réservations */}
          <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Calendar size={28} className="mr-3 text-green-600" />
              Mes Réservations ({reservations.length})
            </h2>
            {reservations.length === 0 ? (
              <p className="text-gray-600">Vous n'avez aucune réservation en cours.</p>
            ) : (
              <ul className="space-y-4">
                {reservations.slice(0, 3).map((res) => ( // Afficher les 3 premières réservations
                  <li key={res._id} className="border-b pb-3 last:border-b-0 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-lg">{res.vehicle?.name || 'Véhicule inconnu'}</p>
                      <p className="text-gray-600 text-sm">Statut: <span className={`font-medium ${res.status === 'confirmed' ? 'text-green-500' : res.status === 'pending' ? 'text-yellow-500' : 'text-red-500'}`}>{res.status}</span></p>
                      <p className="text-gray-600 text-sm">Du {new Date(res.startDate).toLocaleDateString('fr-FR')} au {new Date(res.endDate).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <button
                      onClick={() => navigateTo('my-reservations', { activeTab: 'upcoming-rentals' })} // Naviguer vers la page de gestion des réservations
                      className="text-blue-600 hover:text-blue-800"
                      title="Voir les détails"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {reservations.length > 0 && (
              <div className="text-center mt-4">
                <button
                  onClick={() => navigateTo('my-reservations')}
                  className="text-blue-600 hover:underline flex items-center mx-auto"
                >
                  Voir toutes les réservations <ChevronRight size={18} className="ml-1" />
                </button>
              </div>
            )}
          </div>

          {/* Section Mes Demandes d'Essai */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Car size={28} className="mr-3 text-indigo-600" />
              Mes Demandes d'Essai ({testDriveRequests.length})
            </h2>
            {testDriveRequests.length === 0 ? (
              <p className="text-gray-600">Vous n'avez aucune demande d'essai en cours.</p>
            ) : (
              <ul className="space-y-4">
                {testDriveRequests.slice(0, 3).map((req) => ( // Afficher les 3 premières demandes d'essai
                  <li key={req._id} className="border-b pb-3 last:border-b-0 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-lg">{req.vehicle?.name || 'Véhicule inconnu'}</p>
                      <p className="text-gray-600 text-sm">Statut: <span className={`font-medium ${req.status === 'confirmed' ? 'text-green-500' : req.status === 'pending' ? 'text-yellow-500' : 'text-red-500'}`}>{req.status}</span></p>
                      <p className="text-gray-600 text-sm">Date: {new Date(req.testDriveDate).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <button
                      onClick={() => navigateTo('my-reservations', { activeTab: 'test-drives' })} // Naviguer vers la page de gestion des essais
                      className="text-blue-600 hover:text-blue-800"
                      title="Voir les détails"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {testDriveRequests.length > 0 && (
              <div className="text-center mt-4">
                <button
                  onClick={() => navigateTo('my-reservations', { activeTab: 'test-drives' })}
                  className="text-blue-600 hover:underline flex items-center mx-auto"
                >
                  Voir toutes les demandes d'essai <ChevronRight size={18} className="ml-1" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;
