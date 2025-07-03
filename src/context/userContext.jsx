// src/context/UserContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { makeAuthenticatedRequest } from '../utils/api'; // Votre utilitaire pour les appels API

// Créez le contexte
export const UserContext = createContext(null);

// Créez le fournisseur de contexte
export const UserProvider = ({ children, showModal, navigateTo }) => {
  const [user, setUser] = useState(null); // L'objet utilisateur complet
  const [userToken, setUserToken] = useState(localStorage.getItem('token') || null); // Le token JWT
  const [isAuthLoading, setIsAuthLoading] = useState(true); // État de chargement de l'authentification

  // Fonction pour recharger les données utilisateur (y compris les favoris)
  // Utilise useCallback pour éviter des recréations inutiles et des boucles de dépendance
  const fetchUserData = useCallback(async (token) => {
    if (!token) {
      setUser(null); // S'assurer que l'utilisateur est null si pas de token
      return;
    }
    try {
      const data = await makeAuthenticatedRequest('/auth/me', 'GET', null, token);
      if (data.success) {
        // CORRECTION ICI: Le backend renvoie `data.user`, pas `data.data`
        setUser(data.user); // data.user doit contenir l'objet utilisateur avec les favoris populés
      } else {
        console.error('Échec de la récupération des données utilisateur:', data.msg);
        setUser(null);
        localStorage.removeItem('token'); // Nettoyer le token si invalide
        setUserToken(null);
        showModal('Session expirée', data.msg || 'Votre session a expiré. Veuillez vous reconnecter.', 'error');
        navigateTo('auth');
      }
    } catch (error) {
      console.error('Erreur lors du fetch des données utilisateur:', error);
      setUser(null);
      localStorage.removeItem('token');
      setUserToken(null);
      showModal('Erreur de connexion', 'Impossible de récupérer les informations de l\'utilisateur. Veuillez vous reconnecter.', 'error');
      navigateTo('auth');
    } finally {
      setIsAuthLoading(false); // Fin du chargement de l'authentification, quelle que soit l'issue
    }
  }, [showModal, navigateTo]); // fetchUserData dépend de showModal et navigateTo


  // Effet principal pour gérer l'authentification au montage et les changements de token
  useEffect(() => {
    const initializeAuth = async () => {
      setIsAuthLoading(true); // Commencer le chargement de l'authentification

      if (userToken) {
        // Tente de récupérer les données utilisateur si un token existe
        await fetchUserData(userToken);
      } else {
        // Si aucun token n'est trouvé, assurez-vous que l'utilisateur est null
        setUser(null);
        setIsAuthLoading(false); // Terminer le chargement si pas de token
      }
      // setIsAuthLoading(false); // Déplacé à l'intérieur des branches pour une meilleure précision
    };

    initializeAuth();
  }, [userToken, fetchUserData]); // Déclenche cet effet si userToken ou fetchUserData change

  // Fonction de connexion
  const login = (token, userData) => {
    localStorage.setItem('token', token);
    setUserToken(token); // Cela déclenchera le useEffect ci-dessus pour (re)fetch les données utilisateur
    // Il est important que userData ici soit le même format que celui que fetchUserData s'attend à recevoir de l'API /auth/me
    setUser(userData); // Met à jour l'utilisateur immédiatement avec les données reçues de la connexion
  };

  // Fonction de déconnexion
  const logout = () => {
    localStorage.removeItem('token');
    setUserToken(null); // Cela déclenchera le useEffect ci-dessus pour nettoyer l'utilisateur
    setUser(null); // Nettoie l'utilisateur immédiatement pour une réactivité instantanée de l'UI
    showModal('Déconnexion', 'Vous avez été déconnecté avec succès.', 'info');
    navigateTo('auth'); // Redirige vers la page de connexion
  };

  // Valeurs fournies par le contexte
  const contextValue = {
    user,
    userToken,
    login,
    logout,
    fetchUserData,
    isAuthLoading, // Utile pour afficher un loader global ou conditionner le rendu
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};
