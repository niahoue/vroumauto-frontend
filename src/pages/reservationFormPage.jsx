// src/pages/ReservationFormPage.jsx
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react'; // Pour l'icône de chargement

// Ce composant reçoit les données du véhicule à réserver
// Renommé vehicleData en vehicle pour correspondre à App.jsx
const ReservationFormPage = ({ vehicle, navigateTo, showModal }) => {
  const [loading, setLoading] = useState(true);
  const [formValues, setFormValues] = useState({
    fullName: '',
    email: '',
    phone: '',
    startDate: '',
    endDate: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false); // État pour la soumission du formulaire
  const [localError, setLocalError] = useState(null); // Pour les erreurs de validation côté client

  // URL de base de votre API backend
  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    // Simuler un léger délai de chargement pour l'UX
    const timer = setTimeout(() => {
      setLoading(false);
      // Pré-remplir les dates avec les valeurs par défaut si nécessaire,
      // ou s'assurer que les champs sont vides pour la saisie utilisateur.
      // Ici, nous nous contentons de ne pas les pré-remplir automatiquement.
    }, 300); // 300ms de délai

    return () => clearTimeout(timer);
  }, []);

  // Si aucune donnée de véhicule n'est passée, rediriger ou afficher une erreur
  useEffect(() => {
    // Utiliser 'vehicle' au lieu de 'vehicleData'
    if (!vehicle) {
      showModal('Erreur de Chargement', 'Aucun véhicule sélectionné pour la réservation.', 'error');
      navigateTo('rent'); // Rediriger l'utilisateur vers la page de location
    }
  }, [vehicle, navigateTo, showModal]); // Mettre à jour la dépendance pour 'vehicle'

  // Gère les changements dans les champs du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
    setLocalError(null); // Efface les erreurs locales lors de la saisie
  };

  // Gère la soumission du formulaire de réservation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); // Active l'état de soumission
    setLocalError(null); // Réinitialise les erreurs locales

    // Validation côté client (basique)
    if (!formValues.fullName || !formValues.email || !formValues.phone || !formValues.startDate || !formValues.endDate) {
      setLocalError('Veuillez remplir tous les champs obligatoires.');
      setSubmitting(false);
      return;
    }

    if (new Date(formValues.startDate) >= new Date(formValues.endDate)) {
      setLocalError('La date de fin doit être postérieure à la date de début.');
      setSubmitting(false);
      return;
    }

    // Le backend attribue le statut initial de 'pending'
    // Il est crucial que toutes les opérations de mise à jour de statut (par ex. par un admin)
    // utilisent les mêmes chaînes de caractères ('pending', 'confirmed', 'cancelled', 'completed')
    // définies dans les modèles Mongoose du backend.

    try {
      // Construction du corps de la requête avec les données du formulaire et l'ID du véhicule
      const reservationData = {
        vehicle: vehicle._id, // Assurez-vous que l'ID du véhicule est passé, en utilisant 'vehicle'
        fullName: formValues.fullName,
        email: formValues.email,
        phone: formValues.phone,
        startDate: formValues.startDate,
        endDate: formValues.endDate,
        message: formValues.message,
      };

      const response = await fetch(`${API_BASE_URL}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Inclure le token d'autorisation si la création de réservation nécessite une authentification
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(reservationData),
      });

      const data = await response.json();

      if (response.ok) {
        showModal('Réservation Confirmée', 'Votre demande de réservation a été envoyée avec succès. Nous vous contacterons bientôt !', 'success');
        navigateTo('rent'); // Rediriger l'utilisateur vers la page de location ou de confirmation
      } else {
        // Gérer les erreurs de validation ou autres erreurs du serveur
        const errorMessage = data.error || data.msg || 'Une erreur est survenue lors de l\'envoi de votre réservation.';
        setLocalError(errorMessage);
        showModal('Erreur de Réservation', errorMessage, 'error');
      }
    } catch (err) {
      console.error('Erreur lors de la soumission de la réservation:', err);
      setLocalError('Impossible de se connecter au serveur. Veuillez vérifier votre connexion.');
      showModal('Erreur Réseau', 'Impossible de se connecter au serveur. Veuillez vérifier votre connexion.', 'error');
    } finally {
      setSubmitting(false); // Désactive l'état de soumission
    }
  };

  // Affichage du spinner de chargement si les données du véhicule sont en cours de chargement
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <Loader2 className="animate-spin text-purple-600 w-12 h-12" />
        <p className="ml-4 text-lg text-gray-700">Chargement du formulaire de réservation...</p>
      </div>
    );
  }

  // Si vehicle est null après le chargement, cela signifie qu'il n'y a pas de véhicule à réserver
  // Utiliser 'vehicle' au lieu de 'vehicleData'
  if (!vehicle) {
    return null; // La modale et la redirection sont gérées dans l'useEffect
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-2xl mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">Réserver un Véhicule</h1>

      {/* Détails du véhicule à réserver */}
      <div className="mb-8 p-6 bg-purple-50 rounded-lg border border-purple-200 shadow-sm">
        <h2 className="text-2xl font-semibold text-purple-800 mb-3">Détails du Véhicule</h2>
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
          <img
            src={vehicle.images[vehicle.coverImageIndex] || vehicle.images[0] || 'https://placehold.co/150x100/EDE9FE/6D28D9?text=Véhicule'}
            alt={vehicle.name}
            className="w-32 h-24 object-cover rounded-md shadow-md"
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x100/EDE9FE/6D28D9?text=Image+non+disponible'; }}
          />
          <div>
            <p className="text-xl font-bold text-gray-900">{vehicle.name}</p>
            <p className="text-md text-gray-700">{vehicle.brand} - {vehicle.model} ({vehicle.year})</p>
            {vehicle.type === 'rent' && (
              <p className="text-lg font-extrabold text-green-600 mt-1">
                {vehicle.dailyRate.toLocaleString()} FCFA/jour
              </p>
            )}
            {vehicle.type === 'buy' && (
              <p className="text-lg font-extrabold text-blue-600 mt-1">
                {vehicle.price.toLocaleString()} FCFA
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Affichage des erreurs locales */}
      {localError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-6" role="alert">
          <span className="block sm:inline">{localError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Champs du formulaire */}
        <div>
          <label htmlFor="fullName" className="block text-gray-700 text-sm font-bold mb-2">Nom Complet</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formValues.fullName}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            placeholder="Votre nom complet"
            required
            disabled={submitting}
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Adresse Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formValues.email}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            placeholder="votre.email@exemple.com"
            required
            disabled={submitting}
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-2">Numéro de Téléphone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formValues.phone}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            placeholder="Ex: +225 07 00 00 00 00"
            required
            disabled={submitting}
          />
        </div>

        {/* Dates de début et de fin pour la location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-gray-700 text-sm font-bold mb-2">Date de Début</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formValues.startDate}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              required
              disabled={submitting}
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-gray-700 text-sm font-bold mb-2">Date de Fin</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formValues.endDate}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              required
              disabled={submitting}
            />
          </div>
        </div>

        {/* Message additionnel */}
        <div>
          <label htmlFor="message" className="block text-gray-700 text-sm font-bold mb-2">Message (facultatif)</label>
          <textarea
            id="message"
            name="message"
            value={formValues.message}
            onChange={handleChange}
            rows="4"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            placeholder="Des besoins spécifiques ou des questions ?"
            disabled={submitting}
          ></textarea>
        </div>

        {/* Bouton de soumission */}
        <button
          type="submit"
          className="w-full bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition-colors duration-200 shadow-lg text-lg font-semibold transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          disabled={submitting}
        >
          {submitting ? (
            <Loader2 className="animate-spin h-5 w-5 mr-3" />
          ) : (
            'Envoyer la Demande de Réservation'
          )}
        </button>
      </form>

      {/* Bouton de retour */}
      <div className="mt-6 text-center">
        <button
          onClick={() => navigateTo('rent')}
          className="text-purple-600 hover:underline font-medium"
          disabled={submitting}
        >
          Retour à la liste des véhicules à louer
        </button>
      </div>
    </div>
  );
};

export default ReservationFormPage;
