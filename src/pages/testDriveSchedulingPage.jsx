// src/pages/testDriveSchedulingPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

const TestDriveSchedulingPage = ({ navigateTo, showModal, vehicleData, user, initialDate, initialTime, testDriveId }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formValues, setFormValues] = useState({
    fullName: user?.fullName || '', // Pré-rempli si l'utilisateur est connecté et a un nom
    email: user?.email || '', // Pré-rempli si l'utilisateur est connecté
    phone: user?.phone || '', // Pré-rempli si l'utilisateur est connecté
    testDriveDate: initialDate || '',
    testDriveTime: initialTime || '',
    message: '',
  });
  const [localError, setLocalError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    // Simuler un léger délai de chargement
    const timer = setTimeout(() => {
      setLoading(false);
      // Mettre à jour les valeurs initiales si l'utilisateur est fourni (pour nom, email, téléphone)
      setFormValues(prev => ({
        ...prev,
        fullName: user?.fullName || prev.fullName,
        email: user?.email || prev.email,
        phone: user?.phone || prev.phone,
      }));
    }, 300);

    return () => clearTimeout(timer);
  }, [user]);

  useEffect(() => {
    if (!vehicleData) {
      showModal('Erreur de Chargement', 'Aucun véhicule sélectionné pour la demande d\'essai.', 'error');
      navigateTo('home'); // Rediriger l'utilisateur
    }
  }, [vehicleData, navigateTo, showModal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
    setLocalError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setLocalError(null);

    // Validation côté client
    if (!formValues.fullName || !formValues.email || !formValues.phone || !formValues.testDriveDate || !formValues.testDriveTime) {
      setLocalError('Veuillez remplir tous les champs obligatoires.');
      setSubmitting(false);
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formValues.email)) {
      setLocalError('Veuillez entrer une adresse email valide.');
      setSubmitting(false);
      return;
    }
    if (new Date(formValues.testDriveDate) < new Date(new Date().setHours(0,0,0,0))) {
        setLocalError('La date de l\'essai ne peut pas être dans le passé.');
        setSubmitting(false);
        return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showModal('Non autorisé', 'Vous devez être connecté pour planifier un essai.', 'error');
        navigateTo('auth');
        setSubmitting(false);
        return;
      }

      const method = testDriveId ? 'PUT' : 'POST';
      const endpoint = testDriveId ? `${API_BASE_URL}/testdrives/${testDriveId}` : `${API_BASE_URL}/testdrives`;

      const bodyData = {
        vehicleId: vehicleData._id,
        fullName: formValues.fullName,
        email: formValues.email,
        phone: formValues.phone,
        testDriveDate: formValues.testDriveDate,
        testDriveTime: formValues.testDriveTime,
        message: formValues.message,
        // Si c'est une modification, on peut inclure le statut si on veut le changer (ex: 'pending')
        ...(testDriveId && { status: 'pending' }) // Remettre en 'pending' si modifié par l'utilisateur
      };

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();

      if (response.ok) {
        showModal('Succès', `Votre demande d'essai a été ${testDriveId ? 'mise à jour' : 'envoyée'} avec succès ! Nous vous contacterons bientôt.`, 'success');
        navigateTo('my-reservations'); // Rediriger vers la page mes réservations
      } else {
        setLocalError(data.msg || data.error || `Une erreur est survenue lors de la ${testDriveId ? 'mise à jour' : 'demande'} d'essai.`);
        showModal('Erreur de Demande d\'Essai', data.msg || data.error || 'Une erreur inattendue est survenue.', 'error');
      }
    } catch (error) {
      console.error('Erreur lors de la soumission de la demande d\'essai:', error);
      setLocalError('Impossible de se connecter au serveur. Veuillez réessayer plus tard.');
      showModal('Erreur Réseau', 'Impossible de se connecter au serveur. Veuillez vérifier votre connexion.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-indigo-600 w-12 h-12" />
        <p className="ml-4 text-lg text-gray-700">Préparation du formulaire de demande d'essai...</p>
      </div>
    );
  }

  if (!vehicleData) {
    return null;
  }

  const pageTitle = testDriveId ? 'Modifier ma Demande d\'Essai' : 'Planifier un Essai Routier';
  const submitButtonText = testDriveId ? 'Mettre à jour la Demande' : 'Envoyer la Demande';

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-2xl mx-auto my-8">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-6 text-center">{pageTitle}</h1>
      <p className="text-gray-600 text-lg leading-relaxed mb-6 text-center">
        {testDriveId ? `Modifiez les détails de votre demande d'essai pour le véhicule : ` : `Planifiez un essai pour le véhicule : `}
        <span className="font-semibold text-indigo-700">{vehicleData.name}</span>.
      </p>

      {/* Informations sur le véhicule */}
      <div className="bg-indigo-50 p-4 rounded-lg mb-6 flex items-center shadow-inner">
        <img
          src={vehicleData.images && vehicleData.images.length > 0 ? vehicleData.images[0] : 'https://placehold.co/100x70/E0E7FF/3730A3?text=Véhicule'}
          alt={vehicleData.name}
          className="w-24 h-16 object-cover rounded-md mr-4"
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x70/E0E7FF/3730A3?text=Image+non+disponible'; }}
        />
        <div>
          <h2 className="text-xl font-bold text-indigo-800">{vehicleData.brand} {vehicleData.model}</h2>
          <p className="text-indigo-600">Année: <span className="font-semibold">{vehicleData.year}</span></p>
        </div>
      </div>

      {localError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Erreur !</strong>
          <span className="block sm:inline"> {localError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nom Complet */}
        <div>
          <label htmlFor="fullName" className="block text-gray-700 text-sm font-bold mb-2">Nom Complet</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formValues.fullName}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Votre nom et prénom"
            required
            disabled={submitting || (user && user.fullName)} // Désactiver si l'utilisateur est connecté et a un nom
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Adresse Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formValues.email}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="votre.email@exemple.com"
            required
            disabled={submitting || (user && user.email)} // Désactiver si l'utilisateur est connecté
          />
        </div>

        {/* Téléphone */}
        <div>
          <label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-2">Numéro de Téléphone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formValues.phone}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="+225 07 00 00 00 00"
            required
            disabled={submitting || (user && user.phone)} // Désactiver si l'utilisateur est connecté et a un téléphone
          />
        </div>

        {/* Date et Heure de l'essai */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="testDriveDate" className="block text-gray-700 text-sm font-bold mb-2">Date de l'Essai</label>
            <input
              type="date"
              id="testDriveDate"
              name="testDriveDate"
              value={formValues.testDriveDate}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              required
              disabled={submitting}
            />
          </div>
          <div>
            <label htmlFor="testDriveTime" className="block text-gray-700 text-sm font-bold mb-2">Heure de l'Essai</label>
            <input
              type="time"
              id="testDriveTime"
              name="testDriveTime"
              value={formValues.testDriveTime}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
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
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Des besoins spécifiques ou des questions ?"
            disabled={submitting}
          ></textarea>
        </div>

        {/* Bouton de soumission */}
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors duration-200 shadow-lg text-lg font-semibold transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          disabled={submitting}
        >
          {submitting ? (
            <Loader2 className="animate-spin h-5 w-5 mr-3" />
          ) : (
            submitButtonText
          )}
        </button>
      </form>
    </div>
  );
};

export default TestDriveSchedulingPage;
