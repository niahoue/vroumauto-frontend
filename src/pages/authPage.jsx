// src/pages/AuthPage.jsx
import React, { useState, useContext } from 'react';
import { UserContext } from '../context/userContext'; // Importez le UserContext
import { makeAuthenticatedRequest } from '../utils/api'; // Importez l'utilitaire API

const AuthPage = ({ navigateTo, showModal }) => {
  const { login } = useContext(UserContext); // Utilisez useContext pour obtenir la fonction login
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState(''); // Si votre inscription nécessite un nom d'utilisateur
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'; // Assurez-vous que c'est la bonne URL de votre API

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let url = '';
    let body = {};

    if (isLogin) {
      url = `${API_BASE_URL}/auth/login`;
      body = { email, password };
    } else {
      // Logique d'inscription
      if (password !== confirmPassword) {
        showModal('Erreur d\'inscription', 'Les mots de passe ne correspondent pas.', 'error');
        setLoading(false);
        return;
      }
      url = `${API_BASE_URL}/auth/register`;
      body = { email, password, name: username }; // Assurez-vous que votre backend gère 'name' si vous l'ajoutez
    }

    try {
      const data = await makeAuthenticatedRequest(url, 'POST', body);

      if (data.success) {
        showModal('Succès', data.msg || (isLogin ? 'Connexion réussie !' : 'Inscription réussie ! Vous pouvez maintenant vous connecter.'), 'success');
        if (isLogin) {
          login(data.token, data.user); // Appelez la fonction login du contexte avec le token et les données utilisateur
          navigateTo('home'); // Redirigez vers la page d'accueil ou le tableau de bord
        } else {
          setIsLogin(true); // Après l'inscription, passer en mode connexion
        }
      } else {
        showModal('Erreur', data.msg || 'Une erreur est survenue.', 'error');
      }
    } catch (err) {
      console.error('Erreur d\'authentification:', err);
      showModal('Erreur réseau', err.message || 'Impossible de se connecter au serveur.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-160px)] px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 w-full max-w-md">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
          {isLogin ? 'Connexion' : 'Inscription'}
        </h1>
        <p className="text-gray-600 text-center mb-8">
          {isLogin
            ? 'Connectez-vous à votre compte pour accéder à toutes les fonctionnalités.'
            : 'Créez un compte pour commencer à explorer notre sélection de véhicules.'
          }
        </p>

        {/* Formulaire d'authentification */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">Nom d'utilisateur (Optionnel)</label>
              <input
                type="text"
                id="username"
                name="username"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Votre nom d'utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Adresse Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="votre.email@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Minimum 6 caractères"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          {!isLogin && (
            <div>
              <label htmlFor="confirm-password" className="block text-gray-700 text-sm font-bold mb-2">Confirmer le mot de passe</label>
              <input
                type="password"
                id="confirm-password"
                name="confirmPassword"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Confirmez votre mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          )}

          {isLogin && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => navigateTo('forgot-password')}
                className="text-sm text-blue-600 hover:underline font-medium"
                disabled={loading}
              >
                Mot de passe oublié ?
              </button>
            </div>
          )}

          <button
            type="submit"
            className={`w-full flex items-center justify-center px-6 py-3 rounded-md transition-colors duration-200 shadow-lg text-lg font-semibold transform hover:scale-105
              ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            disabled={loading}
          >
            {loading && (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isLogin ? (loading ? 'Connexion en cours...' : 'Se Connecter') : (loading ? 'Inscription en cours...' : 'S\'inscrire')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:underline font-medium"
            disabled={loading}
          >
            {isLogin ? 'Pas encore de compte ? S\'inscrire' : 'Déjà un compte ? Se Connecter'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
