// src/pages/DashboardPage.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Users, Car, Settings, LogOut, CalendarCheck, FileText, Loader2, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { UserContext } from '../../context/userContext';
import { makeAuthenticatedRequest } from '../../utils/api';

const DashboardPage = ({ navigateTo, showModal }) => {
  const { user, userToken, logout, isAuthLoading } = useContext(UserContext);
  const [stats, setStats] = useState({
    vehicleAdditions: [],
    reservationStatus: [],
    testDriveStatus: [],
    totalUsers: 0,
    totalVehicles: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState(null);

  // Fonction pour récupérer les statistiques, mise en cache avec useCallback
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    setErrorStats(null);
    try {
      if (!userToken) {
        throw new Error('Jeton d\'authentification manquant.');
      }

      // Correction des URL : Retirez le premier '/api' car makeAuthenticatedRequest l'ajoute déjà via API_BASE_URL
      const vehicleStatsData = await makeAuthenticatedRequest('/vehicles/stats/additions', 'GET', null, userToken);
      const reservationStatsData = await makeAuthenticatedRequest('/reservations/stats/status', 'GET', null, userToken);
      const testDriveStatsData = await makeAuthenticatedRequest('/testdrives/stats/status', 'GET', null, userToken);
      const totalUsersData = await makeAuthenticatedRequest('/users', 'GET', null, userToken);
      const totalVehiclesData = await makeAuthenticatedRequest('/vehicles', 'GET', null, userToken);


      setStats({
        vehicleAdditions: vehicleStatsData.data || [],
        // Assurez-vous que le format est correct pour Recharts si reservationStatsData.data est un objet
        reservationStatus: Array.isArray(reservationStatsData.data) ? reservationStatsData.data : Object.entries(reservationStatsData.data || {}).map(([name, value]) => ({ name, value })),
        testDriveStatus: Array.isArray(testDriveStatsData.data) ? testDriveStatsData.data : Object.entries(testDriveStatsData.data || {}).map(([name, value]) => ({ name, value })),
        totalUsers: totalUsersData.count || 0,
        totalVehicles: totalVehiclesData.count || 0,
      });

    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err.message);
      setErrorStats('Impossible de charger les statistiques: ' + err.message);
      showModal('Erreur Tableau de Bord', err.message || 'Erreur lors du chargement des statistiques.', 'error');
      if (err.message.includes('Non autorisé')) {
        logout();
        navigateTo('auth');
      }
    } finally {
      setLoadingStats(false);
    }
  }, [userToken, navigateTo, showModal, logout]);

  useEffect(() => {
    if (!isAuthLoading) {
      if (user && user.role === 'admin') {
        fetchStats();
      } else if (!user) {
        showModal('Accès Non Autorisé', 'Vous devez être connecté pour accéder au tableau de bord.', 'error');
        navigateTo('auth');
      } else {
        showModal('Accès Refusé', 'Votre rôle ne vous permet pas d\'accéder à cette page.', 'error');
        navigateTo('home');
      }
    }
  }, [user, isAuthLoading, fetchStats, navigateTo, showModal]);

  if (isAuthLoading) {
      return (
          <div className="flex justify-center items-center h-screen-75">
              <Loader2 className="h-24 w-24 text-blue-500 animate-spin" />
              <p className="ml-4 text-xl text-gray-600">Vérification de l'accès...</p>
          </div>
      );
  }

  if (!user || user.role !== 'admin') {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-lg border border-gray-100 p-8 mt-12 mx-auto max-w-lg">
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

  return (
    <div className="container mx-auto p-4 md:p-8 bg-gray-100 rounded-xl shadow-lg">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">Tableau de Bord Administrateur</h1>

      {errorStats && (
        <div className="text-center py-4 px-6 bg-red-100 border border-red-400 text-red-700 rounded-lg mb-6 flex items-center justify-center">
          <AlertTriangle size={24} className="mr-3" />
          <p>{errorStats}</p>
        </div>
      )}

      {/* Cartes de Résumé */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md border border-blue-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Utilisateurs Enregistrés</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{stats.totalUsers}</p>
          </div>
          <Users size={48} className="text-blue-400 opacity-60" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-green-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Véhicules Listés</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{stats.totalVehicles}</p>
          </div>
          <Car size={48} className="text-green-400 opacity-60" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-purple-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Réservations en Attente</p>
            <p className="text-3xl font-bold text-purple-600 mt-1">{stats.reservationStatus.find(s => s.name === 'pending')?.value || 0}</p>
          </div>
          <CalendarCheck size={48} className="text-purple-400 opacity-60" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-yellow-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Demandes d'Essai en Attente</p>
            <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.testDriveStatus.find(s => s.name === 'pending')?.value || 0}</p>
          </div>
          <FileText size={48} className="text-yellow-400 opacity-60" />
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Graphique: Ajouts de Véhicules par Mois */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Ajouts de Véhicules par Mois</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.vehicleAdditions} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthYear" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Nombre de Véhicules" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Graphique: Réservations par Statut */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Réservations par Statut</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.reservationStatus} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" name="Nombre de Demandes" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Graphique: Demandes d'Essai par Statut */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Demandes d'Essai par Statut</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.testDriveStatus} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#ffc658" name="Nombre de Demandes" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Liens rapides vers la gestion administrative */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-700 mb-4 text-center">Gestion Administrative Rapide</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => navigateTo('manage-vehicles')}
            className="flex items-center justify-center px-6 py-4 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition duration-300 text-lg font-semibold"
          >
            <Car size={24} className="mr-3" /> Gérer les Véhicules
          </button>
          <button
            onClick={() => navigateTo('manage-users')}
            className="flex items-center justify-center px-6 py-4 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition duration-300 text-lg font-semibold"
          >
            <Users size={24} className="mr-3" /> Gérer les Utilisateurs
          </button>
          <button
            onClick={() => navigateTo('manage-reservations')}
            className="flex items-center justify-center px-6 py-4 bg-purple-500 text-white rounded-lg shadow-md hover:bg-purple-600 transition duration-300 text-lg font-semibold"
          >
            <CalendarCheck size={24} className="mr-3" /> Gérer les Réservations
          </button>
          <button
            onClick={() => navigateTo('manage-test-drives')}
            className="flex items-center justify-center px-6 py-4 bg-yellow-500 text-gray-900 rounded-lg shadow-md hover:bg-yellow-600 transition duration-300 text-lg font-semibold"
          >
            <FileText size={24} className="mr-3" /> Gérer les Essais
          </button>
          {/* Bouton de déconnexion */}
          <button
            onClick={logout}
            className="flex items-center justify-center px-6 py-4 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition duration-300 text-lg font-semibold"
          >
            <LogOut size={24} className="mr-3" /> Déconnexion Admin
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
