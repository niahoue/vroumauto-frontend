// src/components/Header.jsx
import React, { useState, useContext } from 'react';
import logovr from '/logovr.png';
import { Heart, User, LogOut, LayoutDashboard, Menu, X, ChevronDown } from 'lucide-react'; // Importez les icônes nécessaires
import { UserContext } from '../context/userContext'; // Importez le UserContext

const Header = ({ navigateTo }) => { // onLogout n'est plus une prop directe, vient du contexte
  const { user, logout } = useContext(UserContext); // Utilisez useContext pour obtenir l'utilisateur et la fonction de déconnexion
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBuyDropdownOpen, setIsBuyDropdownOpen] = useState(false);
  const [isRentDropdownOpen, setIsRentDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsBuyDropdownOpen(false);
    setIsRentDropdownOpen(false);
    setIsUserDropdownOpen(false); // Ferme aussi le menu utilisateur mobile
  };

  const toggleBuyDropdown = () => {
    setIsBuyDropdownOpen(!isBuyDropdownOpen);
    setIsRentDropdownOpen(false);
    setIsUserDropdownOpen(false); // Ferme les autres menus
  };

  const toggleRentDropdown = () => {
    setIsRentDropdownOpen(!isRentDropdownOpen);
    setIsBuyDropdownOpen(false);
    setIsUserDropdownOpen(false); // Ferme les autres menus
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
    setIsBuyDropdownOpen(false); // Ferme les autres menus
    setIsRentDropdownOpen(false);
  };

  const handleNavigate = (page) => {
    navigateTo(page);
    // Ferme tous les menus après navigation
    setIsMobileMenuOpen(false);
    setIsBuyDropdownOpen(false);
    setIsRentDropdownOpen(false);
    setIsUserDropdownOpen(false);
  };

  const handleLogoutClick = () => {
    logout(); // Appel de la fonction logout du contexte
    // Ferme tous les menus après déconnexion
    setIsMobileMenuOpen(false);
    setIsBuyDropdownOpen(false);
    setIsRentDropdownOpen(false);
    setIsUserDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 w-full bg-white shadow-md z-50">
      <div className="container mx-auto flex justify-between items-center">

        <div className="flex-shrink-0 flex items-center"> 
          <button onClick={() => handleNavigate('home')} className="flex items-center focus:outline-none">
            <img src={logovr} alt="Vroum-Auto Logo" className="h-16 w-auto mr-2" /> 
            <span className="text-3xl font-extrabold text-blue-600">Vroum-Auto</span> 
          </button>
        </div>

        {/* Navigation principale (Desktop) */}
        <nav className="hidden md:flex items-center space-x-6">
          <button onClick={() => handleNavigate('home')} className="text-gray-700 hover:text-blue-600 font-semibold transition-colors">
            Accueil
          </button>

          {/* Menu déroulant Acheter */}
          <div className="relative">
            <button
              onClick={toggleBuyDropdown}
              className="flex items-center text-gray-700 hover:text-blue-600 font-semibold transition-colors focus:outline-none"
            >
              Acheter <ChevronDown size={16} className={`ml-1 transition-transform ${isBuyDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
            </button>
            {isBuyDropdownOpen && (
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 animate-fade-in">
                <button
                  onClick={() => handleNavigate('buy-vehicles')}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Véhicules à Vendre
                </button>
                {/* <button
                  onClick={() => handleNavigate('sell-vehicle')}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Vendre mon véhicule
                </button> */}
              </div>
            )}
          </div>

          {/* Menu déroulant Louer */}
          <div className="relative">
            <button
              onClick={toggleRentDropdown}
              className="flex items-center text-gray-700 hover:text-green-600 font-semibold transition-colors focus:outline-none"
            >
              Louer <ChevronDown size={16} className={`ml-1 transition-transform ${isRentDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
            </button>
            {isRentDropdownOpen && (
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 animate-fade-in">
                <button
                  onClick={() => handleNavigate('rent-vehicles')}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Véhicules à Louer
                </button>
                {/* <button
                  onClick={() => handleNavigate('rent-out-vehicle')}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Louer mon véhicule
                </button> */}
              </div>
            )}
          </div>

          <button onClick={() => handleNavigate('about')} className="text-gray-700 hover:text-purple-600 font-semibold transition-colors">
            À Propos
          </button>
          <button onClick={() => handleNavigate('contact')} className="text-gray-700 hover:text-red-600 font-semibold transition-colors">
            Contact
          </button>

          {/* Boutons d'authentification ou menu utilisateur */}
          {user ? (
            <div className="relative">
              <button
                onClick={toggleUserDropdown}
                className="flex items-center text-blue-600 hover:text-blue-800 font-semibold transition-colors focus:outline-none"
              >
                <User size={20} className="mr-1" /> {user.email.split('@')[0]} <ChevronDown size={16} className={`ml-1 transition-transform ${isUserDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
              </button>
              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 animate-fade-in">
                  {user.role === 'admin' && (
                    <button
                      onClick={() => handleNavigate('dashboard')}
                      className="block w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-50 font-semibold flex items-center"
                    >
                      <LayoutDashboard size={20} className="mr-2" /> Tableau de Bord
                    </button>
                  )}
                  <button
                    onClick={() => handleNavigate('favorites')}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 font-semibold flex items-center"
                  >
                    <Heart size={20} fill="currentColor" className="mr-2" /> Mes favoris
                  </button>
                  <button
                    onClick={() => handleNavigate('profile')}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 font-semibold flex items-center"
                  >
                    <User size={20} className="mr-2" /> Mon profil
                  </button>
                  <hr className="my-1 border-gray-200" />
                  <button
                    onClick={handleLogoutClick}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 font-semibold flex items-center"
                  >
                    <LogOut size={20} className="mr-2" /> Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => handleNavigate('auth')}
              className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition-colors font-semibold shadow-md"
            >
              Se Connecter / S'inscrire
            </button>
          )}
        </nav>

        {/* Bouton du menu mobile (Hamburger) */}
        <div className="md:hidden">
          <button onClick={toggleMobileMenu} className="text-gray-700 focus:outline-none">
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Menu mobile (affiché conditionnellement) */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg py-4 mt-4 rounded-b-lg animate-slideDown">
          <button
            onClick={() => handleNavigate('home')}
            className="block w-full text-left px-6 py-3 text-gray-700 hover:bg-gray-100 font-semibold"
          >
            Accueil
          </button>

          {/* Menu déroulant Acheter (mobile) */}
          <div className="relative">
            <button
              onClick={toggleBuyDropdown}
              className="flex items-center justify-between w-full text-left px-6 py-3 text-gray-700 hover:bg-gray-100 font-semibold"
            >
              Acheter <ChevronDown size={16} className={`transition-transform ${isBuyDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
            </button>
            {isBuyDropdownOpen && (
              <div className="pl-8 py-1 bg-gray-50 animate-fade-in">
                <button
                  onClick={() => handleNavigate('buy-vehicles')}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Véhicules à Vendre
                </button>
                {/* <button
                  onClick={() => handleNavigate('sell-vehicle')}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Vendre mon véhicule
                </button> */}
              </div>
            )}
          </div>

          {/* Menu déroulant Louer (mobile) */}
          <div className="relative">
            <button
              onClick={toggleRentDropdown}
              className="flex items-center justify-between w-full text-left px-6 py-3 text-gray-700 hover:bg-gray-100 font-semibold"
            >
              Louer <ChevronDown size={16} className={`transition-transform ${isRentDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
            </button>
            {isRentDropdownOpen && (
              <div className="pl-8 py-1 bg-gray-50 animate-fade-in">
                <button
                  onClick={() => handleNavigate('rent-vehicles')}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Véhicules à Louer
                </button>
                {/* <button
                  onClick={() => handleNavigate('rent-out-vehicle')}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Louer mon véhicule
                </button> */}
              </div>
            )}
          </div>

          <button
            onClick={() => handleNavigate('about')}
            className="block w-full text-left px-6 py-3 text-gray-700 hover:bg-gray-100 font-semibold"
          >
            À Propos
          </button>
          <button
            onClick={() => handleNavigate('contact')}
            className="block w-full text-left px-6 py-3 text-gray-700 hover:bg-gray-100 font-semibold"
          >
            Contact
          </button>

          <hr className="my-2 border-gray-200" />

          {/* Options de l'utilisateur (mobile) */}
          {user ? (
            <>
              {user.role === 'admin' && (
                <button
                  onClick={() => handleNavigate('dashboard')}
                  className="block w-full text-left px-6 py-3 text-blue-600 hover:bg-blue-50 font-semibold flex items-center"
                >
                  <LayoutDashboard size={20} className="mr-2" /> Tableau de Bord
                </button>
              )}
              <button
                onClick={() => handleNavigate('favorites')}
                className="block w-full text-left px-6 py-3 text-red-600 hover:bg-red-50 font-semibold flex items-center"
              >
                <Heart size={20} fill="currentColor" className="mr-2" /> Mes favoris
              </button>
              <button
                onClick={() => handleNavigate('profile')}
                className="block w-full text-left px-6 py-3 text-gray-700 hover:bg-gray-100 font-semibold flex items-center"
              >
                <User size={20} className="mr-2" /> Mon profil
              </button>
              <span className="block px-6 py-3 text-gray-700 font-medium">Connecté: {user.email}</span>
              <button
                onClick={handleLogoutClick}
                className="block w-full text-left px-6 py-3 text-red-600 hover:bg-red-50 font-semibold flex items-center"
              >
                <LogOut size={20} className="mr-2" /> Déconnexion
              </button>
            </>
          ) : (
            <button
              onClick={() => handleNavigate('auth')}
              className="block w-full text-left px-6 py-3 text-blue-600 hover:bg-blue-50 font-semibold"
            >
              Se Connecter / S'inscrire
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
