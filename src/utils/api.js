// src/utils/api.js

// Définissez l'URL de base de l'API en utilisant une variable d'environnement.
// En développement, elle sera 'http://localhost:5000'.
// En production, elle sera l'URL de votre API déployée.
// 'VITE_APP_' est le préfixe nécessaire pour que Vite expose la variable au code client.
const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || 'http://localhost:5000'; // Fallback pour le développement local si non défini

/**
 * Fonction utilitaire pour effectuer des requêtes API authentifiées.
 * @param {string} url - L'URL de l'API (peut être relative, ex: '/auth/me' ou absolue si nécessaire).
 * @param {string} method - La méthode HTTP (GET, POST, PUT, DELETE).
 * @param {Object} data - Les données à envoyer dans le corps de la requête (pour POST/PUT).
 * @param {string} token - Le token d'authentification de l'utilisateur.
 * @returns {Promise<Object>} La réponse JSON de l'API.
 */
export const makeAuthenticatedRequest = async (path, method = 'GET', data = null, token = null) => {
  // Construire l'URL complète en préfixant avec API_BASE_URL si le chemin est relatif
  const fullUrl = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;

  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(fullUrl, config); // Utilise fullUrl ici
    const result = await response.json();

    if (!response.ok) {
      const errorMessage = result.msg || result.error || 'Erreur réseau inconnue';
      throw new Error(errorMessage);
    }

    return result;
  } catch (error) {
    console.error(`Erreur lors de la requête ${method} ${fullUrl}:`, error);
    // Relance l'erreur pour qu'elle puisse être gérée par les composants qui appellent cette fonction
    throw error;
  }
};
