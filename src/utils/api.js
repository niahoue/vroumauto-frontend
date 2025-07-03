// src/utils/api.js

// Définissez l'URL de base de l'API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

console.log('API_BASE_URL:', API_BASE_URL); // Pour debug

/**
 * Fonction utilitaire pour effectuer des requêtes API authentifiées.
 */
export const makeAuthenticatedRequest = async (path, method = 'GET', data = null, token = null) => {
  // Construire l'URL complète
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
    credentials: 'include', // Important pour CORS avec credentials
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(fullUrl, config);
    
    // Vérifier si c'est une erreur CORS
    if (!response.ok && response.status === 0) {
      throw new Error('Erreur CORS - Vérifiez que votre API est déployée et accessible');
    }

    const result = await response.json();

    if (!response.ok) {
      const errorMessage = result.msg || result.error || `Erreur HTTP ${response.status}`;
      throw new Error(errorMessage);
    }

    return result;
  } catch (error) {
    console.error(`Erreur lors de la requête ${method} ${fullUrl}:`, error);
    
    // Améliorer les messages d'erreur pour CORS
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Impossible de contacter l\'API. Vérifiez votre connexion et que l\'API est déployée.');
    }
    
    throw error;
  }
};

// Fonction spécifique pour les requêtes de véhicules
export const fetchVehicles = async (type, limit = 8) => {
  try {
    const response = await makeAuthenticatedRequest(`/api/vehicles?type=${type}&limit=${limit}&sort=-createdAt`);
    return response;
  } catch (error) {
    console.error(`Erreur réseau ou serveur pour véhicules à ${type === 'rent' ? 'louer' : 'vendre'}:`, error);
    throw error;
  }
};