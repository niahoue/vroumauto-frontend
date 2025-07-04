// src/App.jsx
import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import HomePage from './pages/homePage.jsx';
import BuyVehiclesPage from './pages/buyVehiclesPage.jsx';
import RentVehiclesPage from './pages/rentVehiclesPage.jsx';
import AboutPage from './pages/aboutPage.jsx';
import ContactPage from './pages/contactPage.jsx';
import AuthPage from './pages/authPage.jsx';
import TermsAndConditionsPage from './pages/termsAndConditionsPage.jsx';
import PrivacyPolicyPage from './pages/privacyPolicyPage.jsx';
import VehicleDetailsPage from './pages/vehicleDetailsPage.jsx';
import ReservationFormPage from './pages/reservationFormPage.jsx';
import ForgotPasswordPage from './pages/forgotPasswordPage.jsx';
import DashboardPage from './pages/admin/dashboardPage.jsx';
import ResetPasswordPage from './pages/resetPasswordPage.jsx';
import ManageVehiclesPage from './pages/admin/manageVehiclesPage.jsx';
import AddVehiclePage from './pages/admin/addVehiclePage.jsx';
import EditVehiclePage from './pages/admin/editVehiclePage.jsx';
import ManageUsersPage from './pages/admin/manageUsersPage.jsx';
import EditUserPage from './pages/admin/editUserPage.jsx';
import MyReservationsPage from './pages/myReservationsPage.jsx';
import TestDriveSchedulingPage from './pages/testDriveSchedulingPage.jsx';
import FavoritePage from './pages/favoritePage.jsx';
import ComparisonPage from './pages/comparisonPage.jsx';
import ManageReservationsPage from './pages/admin/manageReservationsPage.jsx';
import ManageTestDrivesPage from './pages/admin/manageTestDrivesPage.jsx';
import UserProfilePage from './pages/userProfilePage.jsx';
import Modal from './components/Modal.jsx';
import { UserProvider } from './context/userContext'; 

const App = () => {
  // Fonction pour déterminer la page et les paramètres depuis l'URL actuelle
  const getPageFromUrl = () => {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    const params = {};
    for (const [key, value] of searchParams.entries()) {
      // Pour les objets JSON passés en paramètre (ex: vehicleData), on les parse
      if (key === 'vehicleData') {
        try {
          params[key] = JSON.parse(decodeURIComponent(value));
        } catch (e) {
          console.error("Erreur lors du parsing de vehicleData depuis l'URL:", e);
          params[key] = {}; // Fallback à un objet vide en cas d'erreur
        }
      } else {
        params[key] = value;
      }
    }

    // Mapping des chemins d'URL vers les noms de page et extraction des IDs
    if (path.startsWith('/vehicle-details/')) {
      return { name: 'vehicle-details', params: { id: path.split('/').pop(), type: params.type } };
    } else if (path.startsWith('/edit-vehicle/')) {
      return { name: 'edit-vehicle', params: { id: path.split('/').pop() } };
    } else if (path.startsWith('/edit-user/')) {
      return { name: 'edit-user', params: { id: path.split('/').pop() } }; // Utilise 'id' pour la cohérence avec EditUserPage
    } else if (path.startsWith('/my-reservations/')) {
      return { name: 'my-reservations', params: { userId: path.split('/').pop(), userEmail: params.userEmail } };
    } else if (path === '/buy-vehicles') {
      return { name: 'buy', params: {} }; // Nom de page 'buy' pour la logique interne
    } else if (path === '/rent-vehicles') {
      return { name: 'rent', params: {} }; // Nom de page 'rent' pour la logique interne
    } else if (path === '/about') {
      return { name: 'about', params: {} };
    } else if (path === '/contact') {
      return { name: 'contact', params: {} };
    } else if (path === '/auth') {
      return { name: 'auth', params: {} };
    } else if (path === '/terms-and-conditions') {
      return { name: 'terms-and-conditions', params: {} };
    } else if (path === '/privacy-policy') {
      return { name: 'privacy-policy', params: {} };
    } else if (path === '/reservation-form') {
      return { name: 'reservation-form', params: { vehicleData: params.vehicleData } }; // Passe 'vehicleData'
    } else if (path === '/forgot-password') {
      return { name: 'forgot-password', params: {} };
    } else if (path === '/reset-password') {
      return { name: 'reset-password', params: { token: params.token } };
    } else if (path === '/dashboard') {
      return { name: 'dashboard', params: {} };
    } else if (path === '/manage-vehicles') {
      return { name: 'manage-vehicles', params: {} };
    } else if (path === '/add-vehicle') {
      return { name: 'add-vehicle', params: {} };
    } else if (path === '/manage-users') {
      return { name: 'manage-users', params: {} };
    } else if (path === '/test-drive-scheduling') {
      return { name: 'test-drive-scheduling', params: { vehicleData: params.vehicleData } }; // Passe 'vehicleData'
    } else if (path === '/favorites') { // Correction pour correspondre au sitemap
      return { name: 'favorites', params: {} };
    } else if (path === '/comparison') {
      return { name: 'comparison', params: {} };
    } else if (path === '/manage-reservations') {
      return { name: 'manage-reservations', params: { userId: params.userId } };
    } else if (path === '/manage-test-drives') {
      return { name: 'manage-test-drives', params: { userId: params.userId } };
    } else if (path === '/profile') {
      return { name: 'profile', params: {} };
    } else if (path === '/test-drive-confirmation') {
      return { name: 'test-drive-confirmation', params: {} };
    }
    return { name: 'home', params: {} };
  };

  const [currentPage, setCurrentPage] = useState(getPageFromUrl());
  const [modal, setModal] = useState({ show: false, title: '', message: '', type: '', onConfirm: null, confirmText: 'Confirmer', cancelText: 'Annuler' });
  const [compareList, setCompareList] = useState([]);

  // URL de base pour les liens canoniques
  const BASE_CANONICAL_URL = 'https://www.vroumauto.com';

  // Fonction de navigation qui met à jour l'URL et l'état de la page
  const navigateTo = (pageName, params = {}) => {
    let path = '/';
    let search = '';

    switch (pageName) {
      case 'home':
        path = '/';
        break;
      case 'buy': // Utilise le nom de page interne
        path = '/buy-vehicles'; // Chemin d'URL réel
        break;
      case 'rent': // Utilise le nom de page interne
        path = '/rent-vehicles'; // Chemin d'URL réel
        break;
      case 'about':
        path = '/about';
        break;
      case 'contact':
        path = '/contact';
        break;
      case 'auth':
        path = '/auth';
        break;
      case 'terms-and-conditions':
        path = '/terms-and-conditions';
        break;
      case 'privacy-policy':
        path = '/privacy-policy';
        break;
      case 'forgot-password':
        path = '/forgot-password';
        break;
      case 'reset-password':
        path = '/reset-password';
        if (params.token) search = `?token=${params.token}`;
        break;
      case 'dashboard':
        path = '/dashboard';
        break;
      case 'manage-vehicles':
        path = '/manage-vehicles';
        break;
      case 'add-vehicle':
        path = '/add-vehicle';
        break;
      case 'edit-vehicle':
        path = `/edit-vehicle/${params.id}`;
        break;
      case 'manage-users':
        path = '/manage-users';
        break;
      case 'edit-user':
        path = `/edit-user/${params.id}`; // Utilise 'id' pour l'URL
        break;
      case 'my-reservations':
        path = `/my-reservations/${params.userId || ''}`;
        if (params.userEmail) search = `?userEmail=${params.userEmail}`;
        break;
      case 'manage-reservations':
        path = '/manage-reservations';
        if (params.userId) search = `?userId=${params.userId}`;
        break;
      case 'manage-test-drives':
        path = '/manage-test-drives';
        if (params.userId) search = `?userId=${params.userId}`;
        break;
      case 'test-drive-scheduling':
        path = '/test-drive-scheduling';
        if (params.vehicleData) search = `?vehicleData=${encodeURIComponent(JSON.stringify(params.vehicleData))}`; // Encode l'objet vehicleData
        break;
      case 'favorites': // Utilise le nom de page interne
        path = '/favorites'; // Chemin d'URL réel
        break;
      case 'comparison':
        path = '/comparison';
        break;
      case 'profile':
        path = '/profile';
        break;
      case 'vehicle-details':
        path = `/vehicle-details/${params.id}`;
        if (params.type) search = `?type=${params.type}`;
        break;
      case 'reservation-form':
        path = '/reservation-form';
        if (params.vehicleData) search = `?vehicleData=${encodeURIComponent(JSON.stringify(params.vehicleData))}`; // Encode l'objet vehicleData
        break;
      case 'test-drive-confirmation':
        path = '/test-drive-confirmation';
        break;
      default:
        path = '/';
    }

    const newUrl = path + search;
    window.history.pushState(params, '', newUrl); // Met à jour l'URL sans recharger
    setCurrentPage({ name: pageName, params: params }); // Met à jour l'état React
    window.scrollTo(0, 0); // Faire défiler la fenêtre vers le haut lors du changement de page
  };

  // Gestion des événements de navigation (boutons retour/avant du navigateur)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(getPageFromUrl());
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []); // Le tableau de dépendances est vide pour que l'effet ne s'exécute qu'une fois au montage

  // Effet pour mettre à jour la balise canonique et le titre de la page
  useEffect(() => {
    let canonicalPath = '';
    let pageTitle = 'Vroum-Auto - Votre Partenaire Auto de Confiance';

    // Mapper les noms de page aux chemins canoniques et aux titres
    const pageMap = {
      'home': { path: '/', title: 'Vroum-Auto - Votre Partenaire Auto de Confiance' },
      'buy': { path: '/buy-vehicles', title: 'Acheter un Véhicule - Vroum-Auto' },
      'rent': { path: '/rent-vehicles', title: 'Louer un Véhicule - Vroum-Auto' },
      'about': { path: '/about', title: 'À Propos de Nous - Vroum-Auto' },
      'contact': { path: '/contact', title: 'Contactez-nous - Vroum-Auto' },
      'auth': { path: '/auth', title: 'Connexion / Inscription - Vroum-Auto' },
      'terms-and-conditions': { path: '/terms-and-conditions', title: 'Termes et Conditions - Vroum-Auto' },
      'privacy-policy': { path: '/privacy-policy', title: 'Politique de Confidentialité - Vroum-Auto' },
      'vehicle-details': { path: `/vehicle-details/${currentPage.params?.id || ''}`, title: 'Détails du Véhicule - Vroum-Auto' },
      'reservation-form': { path: '/reservation-form', title: 'Demande de Réservation - Vroum-Auto' },
      'forgot-password': { path: '/forgot-password', title: 'Mot de passe oublié - Vroum-Auto' },
      'dashboard': { path: '/dashboard', title: 'Tableau de Bord Admin - Vroum-Auto' },
      'reset-password': { path: '/reset-password', title: 'Réinitialiser le mot de passe - Vroum-Auto' },
      'manage-vehicles': { path: '/manage-vehicles', title: 'Gérer les Véhicules - Vroum-Auto' },
      'add-vehicle': { path: '/add-vehicle', title: 'Ajouter un Véhicule - Vroum-Auto' },
      'edit-vehicle': { path: `/edit-vehicle/${currentPage.params?.id || ''}`, title: 'Modifier un Véhicule - Vroum-Auto' },
      'manage-users': { path: '/manage-users', title: 'Gérer les Utilisateurs - Vroum-Auto' },
      'edit-user': { path: `/edit-user/${currentPage.params?.id || ''}`, title: 'Modifier un Utilisateur - Vroum-Auto' },
      'my-reservations': { path: '/my-reservations', title: 'Mes Réservations - Vroum-Auto' },
      'test-drive-scheduling': { path: '/test-drive-scheduling', title: 'Planifier un Essai - Vroum-Auto' },
      'favorites': { path: '/favorites', title: 'Mes Favoris - Vroum-Auto' },
      'comparison': { path: '/comparison', title: 'Comparaison de Véhicules - Vroum-Auto' },
      'manage-reservations': { path: '/manage-reservations', title: 'Gérer les Réservations - Vroum-Auto' },
      'manage-test-drives': { path: '/manage-test-drives', title: 'Gérer les Essais - Vroum-Auto' },
      'profile': { path: '/profile', title: 'Mon Profil - Vroum-Auto' },
      'test-drive-confirmation': { path: '/test-drive-confirmation', title: 'Confirmation d\'Essai - Vroum-Auto' },
    };

    const currentPageInfo = pageMap[currentPage.name];

    if (currentPageInfo) {
      canonicalPath = currentPageInfo.path;
      pageTitle = currentPageInfo.title;
    } else {
      // Fallback pour les pages non définies, pointer vers la racine
      canonicalPath = '/';
    }

    // Construire l'URL canonique complète
    const fullCanonicalUrl = `${BASE_CANONICAL_URL}${canonicalPath}`;

    // Mettre à jour la balise <link rel="canonical">
    let link = document.querySelector("link[rel='canonical']");
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', fullCanonicalUrl);

    // Mettre à jour le titre du document
    document.title = pageTitle;

  }, [currentPage]); // L'effet se réexécute à chaque changement de currentPage

  // Fonctions pour la modale
  const showModal = (title, message, type = 'info', onConfirm = null, confirmText = 'Confirmer', cancelText = 'Annuler') => {
    setModal({ show: true, title, message, type, onConfirm, confirmText, cancelText });
  };

  const hideModal = () => {
    setModal(prev => ({ ...prev, show: false }));
  };

  // Logique pour ajouter/retirer de la liste de comparaison
  const handleAddToCompare = (vehicleId) => {
    setCompareList(prev => {
      if (!prev.includes(vehicleId)) {
        if (prev.length >= 4) { // Limite la comparaison à 4 véhicules
          showModal('Limite de Comparaison', 'Vous ne pouvez comparer que jusqu\'à 4 véhicules à la fois.', 'warning');
          return prev;
        }
        showModal('Comparaison', 'Véhicule ajouté à la comparaison.', 'success');
        return [...prev, vehicleId];
      }
      return prev;
    });
  };

  const handleRemoveFromCompare = (vehicleId) => {
    setCompareList(prev => {
      const newList = prev.filter((id) => id !== vehicleId);
      showModal('Comparaison', 'Véhicule retiré de la comparaison.', 'info');
      return newList;
    });
  };

  const handleClearCompare = () => {
    setCompareList([]);
    showModal('Comparaison', 'Liste de comparaison vidée.', 'info');
  };

  // Rendu conditionnel des pages
  const renderPage = () => {
    switch (currentPage.name) {
      case 'home':
        return <HomePage navigateTo={navigateTo} showModal={showModal} />;
      case 'buy': // Utilise le nom de page interne
        return <BuyVehiclesPage navigateTo={navigateTo} showModal={showModal} compareList={compareList} addToCompare={handleAddToCompare} removeFromCompare={handleRemoveFromCompare} />;
      case 'rent': // Utilise le nom de page interne
        return <RentVehiclesPage navigateTo={navigateTo} showModal={showModal} compareList={compareList} addToCompare={handleAddToCompare} removeFromCompare={handleRemoveFromCompare} />;
      case 'about':
        return <AboutPage navigateTo={navigateTo} />;
      case 'contact':
        return <ContactPage navigateTo={navigateTo} showModal={showModal} />;
      case 'auth':
        return <AuthPage navigateTo={navigateTo} showModal={showModal} />;
      case 'terms-and-conditions':
        return <TermsAndConditionsPage navigateTo={navigateTo} />;
      case 'privacy-policy':
        return <PrivacyPolicyPage navigateTo={navigateTo} />;
      case 'vehicle-details':
        return <VehicleDetailsPage navigateTo={navigateTo} showModal={showModal} vehicleId={currentPage.params.id} vehicleType={currentPage.params.type} />;
      case 'reservation-form':
        return <ReservationFormPage navigateTo={navigateTo} showModal={showModal} vehicleData={currentPage.params.vehicleData} />;
      case 'forgot-password':
        return <ForgotPasswordPage navigateTo={navigateTo} showModal={showModal} />;
      case 'reset-password':
        return <ResetPasswordPage navigateTo={navigateTo} showModal={showModal} token={currentPage.params.token} />;
      case 'dashboard':
        return <DashboardPage navigateTo={navigateTo} showModal={showModal} />;
      case 'manage-vehicles':
        return <ManageVehiclesPage navigateTo={navigateTo} showModal={showModal} />;
      case 'add-vehicle':
        return <AddVehiclePage navigateTo={navigateTo} showModal={showModal} />;
      case 'edit-vehicle':
        return <EditVehiclePage navigateTo={navigateTo} showModal={showModal} vehicleId={currentPage.params.id} />;
      case 'manage-users':
        return <ManageUsersPage navigateTo={navigateTo} showModal={showModal} />;
      case 'edit-user':
        return <EditUserPage navigateTo={navigateTo} showModal={showModal} userId={currentPage.params.id} />;
      case 'my-reservations':
        return <MyReservationsPage navigateTo={navigateTo} showModal={showModal} adminViewingUserId={currentPage.params.userId} userEmail={currentPage.params.userEmail} />;
      case 'test-drive-scheduling':
        return <TestDriveSchedulingPage navigateTo={navigateTo} showModal={showModal} vehicleData={currentPage.params.vehicleData} />;
      case 'test-drive-confirmation':
        return <TestDriveConfirmationPage navigateTo={navigateTo} showModal={showModal} />;
      case 'favorites':
        return <FavoritePage navigateTo={navigateTo} showModal={showModal} compareList={compareList} addToCompare={handleAddToCompare} removeFromCompare={handleRemoveFromCompare} />;
      case 'comparison':
        return <ComparisonPage navigateTo={navigateTo} showModal={showModal} compareList={compareList} clearCompare={handleClearCompare} />;
      case 'manage-reservations':
        return <ManageReservationsPage navigateTo={navigateTo} showModal={showModal} userId={currentPage.params.userId} />;
      case 'manage-test-drives':
        return <ManageTestDrivesPage navigateTo={navigateTo} showModal={showModal} userId={currentPage.params.userId} />;
      case 'profile':
        return <UserProfilePage navigateTo={navigateTo} showModal={showModal} />;
      default:
        return <HomePage navigateTo={navigateTo} />;
    }
  };

  // Déterminez les classes de la balise <main> en fonction de la page actuelle
  const mainClasses = currentPage.name === 'home'
    ? 'flex-grow flex flex-col' // La homepage gérera ses propres conteneurs
    : 'flex-grow container mx-auto py-8 px-4 md:px-6'; // Conteneurs standard pour les autres pages


  return (
    <UserProvider showModal={showModal} navigateTo={navigateTo}>
      <div className="min-h-screen bg-gray-100 font-sans antialiased flex flex-col overflow-x-hidden">
        <Header navigateTo={navigateTo} />

        <main className={mainClasses}>
          {renderPage()}
        </main>

        <Footer navigateTo={navigateTo} />

        <Modal
          show={modal.show}
          title={modal.title}
          message={modal.message}
          type={modal.type}
          onClose={hideModal}
          onConfirm={modal.onConfirm}
          confirmText={modal.confirmText}
          cancelText={modal.cancelText}
        />
      </div>
    </UserProvider>
  );
};

export default App;
