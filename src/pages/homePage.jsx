// src/pages/homePage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react'; // Importez useRef et useCallback
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import SkeletonCard from '../components/SkeletonCard';


const HomePage = ({ navigateTo, showModal }) => {
  const [featuredBuyVehicles, setFeaturedBuyVehicles] = useState([]);
  const [featuredRentVehicles, setFeaturedRentVehicles] = useState([]);
  const [loadingBuy, setLoadingBuy] = useState(true);
  const [loadingRent, setLoadingRent] = useState(true);
  const [errorBuy, setErrorBuy] = useState(null);
  const [errorRent, setErrorRent] = useState(null);

  // Refs pour accéder aux éléments DOM des carrousels
  const buyCarouselRef = useRef(null);
  const rentCarouselRef = useRef(null);
  const testimonialCarouselRef = useRef(null);

  // États pour la pause du défilement automatique
  const [pauseBuyScroll, setPauseBuyScroll] = useState(false);
  const [pauseRentScroll, setPauseRentScroll] = useState(false);
  const [pauseTestimonialScroll, setPauseTestimonialScroll] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  // Données fictives pour les témoignages
  const testimonials = [
    {
      id: 1,
      quote: "Vroum-Auto a rendu l'achat de ma première voiture si simple et sans stress. L'équipe est professionnelle et à l'écoute. Je recommande à 100% !",
      author: "Adama K.",
      city: "Abidjan"
    },
    {
      id: 2,
      quote: "J'ai loué un SUV pour mon voyage d'affaires et j'ai été impressionné par la qualité du véhicule et la flexibilité du service. Excellent rapport qualité-prix.",
      author: "Fatou B.",
      city: "Yamoussoukro"
    },
    {
      id: 3,
    quote: "Le processus de vente de ma voiture a été étonnamment rapide et transparent. Vroum-Auto s'est occupé de tout, j'ai juste eu à signer.",
      author: "Marc O.",
      city: "Grand-Bassam"
    },
    {
      id: 4,
      quote: "Un service client exceptionnel ! J'avais une question sur ma réservation et j'ai eu une réponse immédiate et très utile. Merci Vroum-Auto !",
      author: "Sophie L.",
      city: "San-Pédro"
    },
    {
      id: 5,
      quote: "Trouver la voiture de mes rêves n'a jamais été aussi facile. La variété des modèles disponibles est impressionnante, et les prix sont très compétitifs.",
      author: "Koffi N.",
      city: "Bouaké"
    }
  ];

  // Fonction pour faire défiler un carrousel donné
  const scrollCarousel = useCallback((carouselRef, direction = 'right', smooth = true) => {
    const carouselElement = carouselRef.current;
    if (carouselElement) {
      // Calculer la largeur d'un élément pour un défilement "par carte"
      // ou utiliser une valeur fixe si les cartes n'ont pas de largeur fixe
      const itemWidth = carouselElement.querySelector('.flex-none')?.offsetWidth || 300; // Largeur par défaut si aucun enfant trouvé
      const scrollAmount = direction === 'left' ? -itemWidth : itemWidth;

      carouselElement.scrollBy({
        left: scrollAmount,
        behavior: smooth ? 'smooth' : 'auto'
      });

      // Si nous sommes à la fin et que nous essayons de défiler à droite, revenir au début
      if (direction === 'right' && (carouselElement.scrollLeft + carouselElement.clientWidth >= carouselElement.scrollWidth - 10)) {
        carouselElement.scrollTo({ left: 0, behavior: smooth ? 'smooth' : 'auto' });
      }
      // Si nous sommes au début et que nous essayons de défiler à gauche, aller à la fin
      else if (direction === 'left' && carouselElement.scrollLeft <= 10) {
        carouselElement.scrollTo({ left: carouselElement.scrollWidth, behavior: smooth ? 'smooth' : 'auto' });
      }
    }
  }, []);

  // Effet pour le défilement automatique des véhicules à vendre
  useEffect(() => {
    let interval;
    if (featuredBuyVehicles.length > 0 && !pauseBuyScroll) {
      interval = setInterval(() => {
        scrollCarousel(buyCarouselRef, 'right');
      }, 3000); // Défilement toutes les 3 secondes
    }
    return () => clearInterval(interval);
  }, [featuredBuyVehicles, pauseBuyScroll, scrollCarousel]);

  // Effet pour le défilement automatique des véhicules à louer
  useEffect(() => {
    let interval;
    if (featuredRentVehicles.length > 0 && !pauseRentScroll) {
      interval = setInterval(() => {
        scrollCarousel(rentCarouselRef, 'right');
      }, 3000); // Défilement toutes les 3 secondes
    }
    return () => clearInterval(interval);
  }, [featuredRentVehicles, pauseRentScroll, scrollCarousel]);

  // Effet pour le défilement automatique des témoignages
  useEffect(() => {
    let interval;
    if (testimonials.length > 0 && !pauseTestimonialScroll) {
      interval = setInterval(() => {
        scrollCarousel(testimonialCarouselRef, 'right');
      }, 4000); // Défilement toutes les 4 secondes
    }
    return () => clearInterval(interval);
  }, [testimonials, pauseTestimonialScroll, scrollCarousel]);


  // Fetch featured vehicles for sale
  useEffect(() => {
    const fetchBuyVehicles = async () => {
      setLoadingBuy(true);
      setErrorBuy(null);
      try {
        const response = await fetch(`${API_BASE_URL}/vehicles?type=buy&limit=8&sort=-createdAt`);
        const data = await response.json();

        if (response.ok) {
          setFeaturedBuyVehicles(data.data);
        } else {
          setErrorBuy(data.error || 'Erreur lors du chargement des véhicules à vendre.');
          showModal('Erreur de Chargement', data.error || 'Erreur lors du chargement des véhicules à vendre.', 'error');
        }
      } catch (err) {
        console.error("Erreur réseau ou serveur pour véhicules à vendre:", err);
        setErrorBuy('Impossible de charger les véhicules à vendre. Veuillez vérifier votre connexion.');
        showModal('Erreur Réseau', 'Impossible de charger les véhicules à vendre. Veuillez vérifier votre connexion.', 'error');
      } finally {
        setLoadingBuy(false);
      }
    };
    fetchBuyVehicles();
  }, [showModal]);

  // Fetch featured vehicles for rent
  useEffect(() => {
    const fetchRentVehicles = async () => {
      setLoadingRent(true);
      setErrorRent(null);
      try {
        const response = await fetch(`${API_BASE_URL}/vehicles?type=rent&limit=8&sort=-createdAt`);
        const data = await response.json();

        if (response.ok) {
          setFeaturedRentVehicles(data.data);
        } else {
          setErrorRent(data.error || 'Erreur lors du chargement des véhicules à louer.');
          showModal('Erreur de Chargement', data.error || 'Erreur lors du chargement des véhicules à louer.', 'error');
        }
      } catch (err) {
        console.error("Erreur réseau ou serveur pour véhicules à louer:", err);
        setErrorRent('Impossible de charger les véhicules à louer. Veuillez vérifier votre connexion.');
        showModal('Erreur Réseau', 'Impossible de charger les véhicules à louer. Veuillez vérifier votre connexion.', 'error');
      } finally {
        setLoadingRent(false);
      }
    };
    fetchRentVehicles();
  }, [showModal]);


  return (
    <div className="home-page flex flex-col flex-grow">
      {/* Hero Section - Doit être pleine largeur et toucher le header */}
      <section
        className="relative w-screen left-1/2 -translate-x-1/2 h-[400px] md:h-[500px] flex items-center justify-center text-white overflow-hidden"
      >
        {/* Balise video pour le fond */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/video.mp4" type="video/mp4" />
          Votre navigateur ne supporte pas la balise vidéo.
        </video>

        {/* Overlay sombre pour la lisibilité du texte */}
        <div className="absolute inset-0 bg-black opacity-60"></div>

        <div className="relative z-10 text-center max-w-3xl mx-auto px-4 md:px-6">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 animate-fade-in-down">
            Votre prochain véhicule vous attend !
          </h1>
          <p className="text-lg md:text-xl mb-8 opacity-90 animate-fade-in-up">
            Achetez ou louez des véhicules de qualité supérieure en Côte d'Ivoire.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-scale-in">
            <button
              onClick={() => navigateTo('buy')} 
              className="bg-white text-blue-600 hover:bg-blue-50 transition-colors duration-300 px-8 py-3 rounded-full text-lg font-semibold shadow-md transform hover:scale-105"
            >
              Acheter un véhicule
            </button>
            <button
              onClick={() => navigateTo('rent')} 
              className="border-2 border-white text-white hover:bg-white hover:text-purple-600 transition-colors duration-300 px-8 py-3 rounded-full text-lg font-semibold shadow-md transform hover:scale-105"
            >
              Louer un véhicule
            </button>
          </div>
        </div>
      </section>

      {/* Reste du contenu de la page, enveloppé dans un conteneur pour rester centré */}
      <div className="container mx-auto px-4 py-8">
        {/* Section Véhicules en Vedette à Vendre */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Nos véhicules en vedette à vendre</h2>
          {loadingBuy ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
              <p className="ml-3 text-gray-700">Chargement des véhicules à vendre...</p>
            </div>
          ) : errorBuy ? (
            <div className="text-center p-8 text-red-600 font-semibold">{errorBuy}</div>
          ) : featuredBuyVehicles.length === 0 ? (
            <div className="text-center p-8 text-gray-600">Aucun véhicule à vendre disponible pour le moment.</div>
          ) : (
            <div
              className="relative"
              onMouseEnter={() => setPauseBuyScroll(true)}
              onMouseLeave={() => setPauseBuyScroll(false)}
              onTouchStart={() => setPauseBuyScroll(true)}
              onTouchEnd={() => setPauseBuyScroll(false)}
            >
              <div
                id="buy-carousel"
                ref={buyCarouselRef} // Associez la ref
                className="flex overflow-x-auto scrollbar-hide space-x-6 pb-4 -mx-4 px-4 snap-x snap-mandatory"
              >
                {featuredBuyVehicles.map((vehicle) => {
                  const imageUrl = (vehicle.images && vehicle.images.length > 0)
                    ? (vehicle.images[vehicle.coverImageIndex] || vehicle.images[0])
                    : 'https://placehold.co/600x400/E0E7FF/3730A3?text=Véhicule';

                  return (
                    <div
                      key={vehicle._id}
                      className="flex-none w-72 sm:w-80 md:w-96 snap-center bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden relative"
                    >
                      <span className="absolute top-3 left-3 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10 uppercase">
                        En Vedette
                      </span>
                      <img
                        src={imageUrl}
                        alt={vehicle.name}
                        className="w-full h-48 object-cover object-center"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/E0E7FF/3730A3?text=Image+non+disponible'; }}
                      />
                      <div className="p-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-1 truncate">{vehicle.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{vehicle.brand} - {vehicle.model} ({vehicle.year})</p>
                        <span className="text-2xl font-extrabold text-blue-600">
                          {vehicle.price.toLocaleString()} FCFA
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateTo('vehicle-details', { id: vehicle._id, type: vehicle.type });
                          }}
                          className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 font-semibold"
                        >
                          Voir les détails
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {featuredBuyVehicles.length > 0 && ( // Affiche les flèches si au moins 1 véhicule pour le défilement manuel
                <>
                  <button
                    onClick={() => scrollCarousel(buyCarouselRef, 'left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full z-20 hover:bg-opacity-75 transition-colors hidden md:block"
                    aria-label="Défiler à gauche"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={() => scrollCarousel(buyCarouselRef, 'right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full z-20 hover:bg-opacity-75 transition-colors hidden md:block"
                    aria-label="Défiler à droite"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>
          )}
          <div className="text-center mt-8">
            <button
              onClick={() => navigateTo('buy')} 
              className="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition-colors duration-300 text-lg font-semibold shadow-md transform hover:scale-105"
            >
              Voir tous les véhicules à vendre
            </button>
          </div>
        </section>

        {/* Section Véhicules en Vedette à Louer */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Nos véhicules en vedette à louer</h2>
          {loadingRent ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="animate-spin text-green-600 w-10 h-10" />
              <p className="ml-3 text-gray-700">Chargement des véhicules à louer...</p>
            </div>
          ) : errorRent ? (
            <div className="text-center p-8 text-red-600 font-semibold">{errorRent}</div>
          ) : featuredRentVehicles.length === 0 ? (
            <div className="text-center p-8 text-gray-600">Aucun véhicule à louer disponible pour le moment.</div>
          ) : (
            <div
              className="relative"
              onMouseEnter={() => setPauseRentScroll(true)}
              onMouseLeave={() => setPauseRentScroll(false)}
              onTouchStart={() => setPauseRentScroll(true)}
              onTouchEnd={() => setPauseRentScroll(false)}
            >
              <div
                id="rent-carousel"
                ref={rentCarouselRef} // Associez la ref
                className="flex overflow-x-auto scrollbar-hide space-x-6 pb-4 -mx-4 px-4 snap-x snap-mandatory"
              >
                {featuredRentVehicles.map((vehicle) => {
                  const imageUrl = (vehicle.images && vehicle.images.length > 0)
                    ? (vehicle.images[vehicle.coverImageIndex] || vehicle.images[0])
                    : 'https://placehold.co/600x400/E0E7FF/3730A3?text=Véhicule';

                  return (
                    <div
                      key={vehicle._id}
                      className="flex-none w-72 sm:w-80 md:w-96 snap-center bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden relative"
                    >
                      <span className="absolute top-3 left-3 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10 uppercase">
                        En Vedette
                      </span>
                      <img
                        src={imageUrl}
                        alt={vehicle.name}
                        className="w-full h-48 object-cover object-center"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/E0E7FF/3730A3?text=Image+non+disponible'; }}
                      />
                      <div className="p-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-1 truncate">{vehicle.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{vehicle.brand} - {vehicle.model} ({vehicle.year})</p>
                        <span className="text-2xl font-extrabold text-green-600">
                          {vehicle.dailyRate.toLocaleString()} FCFA/jour
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateTo('reservation-form', { vehicleData: vehicle }); // Passe 'vehicleData'
                          }}
                          className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors duration-200 font-semibold"
                        >
                          Réserver maintenant
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {featuredRentVehicles.length > 0 && ( // Affiche les flèches si au moins 1 véhicule pour le défilement manuel
                <>
                  <button
                    onClick={() => scrollCarousel(rentCarouselRef, 'left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full z-20 hover:bg-opacity-75 transition-colors hidden md:block"
                    aria-label="Défiler à gauche"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={() => scrollCarousel(rentCarouselRef, 'right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full z-20 hover:bg-opacity-75 transition-colors hidden md:block"
                    aria-label="Défiler à droite"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>
          )}
          <div className="text-center mt-8">
            <button
              onClick={() => navigateTo('rent')} 
              className="bg-green-600 text-white px-8 py-3 rounded-full hover:bg-green-700 transition-colors duration-300 text-lg font-semibold shadow-md transform hover:scale-105"
            >
              Voir tous les véhicules à louer
            </button>
          </div>
        </section>

        {/* Nouvelle Section Pourquoi Choisir Vroum-Auto ? */}
        <section className="bg-purple-50 p-8 rounded-xl shadow-lg mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Pourquoi Choisir Vroum-Auto ?</h2>
          <div className="max-w-4xl mx-auto text-gray-700 text-lg leading-relaxed grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-semibold text-purple-700 mb-3 flex items-center">
                <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Un Large Choix de Véhicules
              </h3>
              <p className="mb-4">
                Que vous cherchiez une berline élégante, un SUV robuste, une voiture économique ou un véhicule utilitaire, notre catalogue est constamment mis à jour avec une diversité de modèles pour l'achat et la location. Nous sélectionnons rigoureusement chaque véhicule pour vous garantir qualité et performance.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-purple-700 mb-3 flex items-center">
                <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c1.657 0 3 .895 3 2s-1.343 2-3 2-3-.895-3-2 1.343-2 3-2zM21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                Transparence et Confiance
              </h3>
              <p className="mb-4">
                Chez Vroum-Auto, la transparence est notre priorité. Chaque véhicule est accompagné d'un historique clair et de toutes les informations nécessaires. Nos prix sont justes et sans frais cachés, vous assurant une transaction en toute sérénité.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-purple-700 mb-3 flex items-center">
                <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H2v-2a3 3 0 015.356-1.857M17 20v-2c0-.134-.01-.267-.03-.4M20 18v.4M20 18H2v.4M2 18a3 3 0 013-3h10a3 3 0 013 3v2H2zM12 10a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                Service Client Dédié
              </h3>
              <p className="mb-4">
                Notre équipe est à votre disposition pour vous guider à chaque étape. Que ce soit pour vous aider à choisir le véhicule idéal, à comprendre les options de financement ou à organiser un essai routier, nous sommes là pour répondre à toutes vos questions avec professionnalisme et courtoisie.
              </p>
            </div>
            <div>
              <h3 className="2xl font-semibold text-purple-700 mb-3 flex items-center">
                <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                Facilité et Rapidité
              </h3>
              <p className="mb-4">
                Nous avons optimisé nos processus d'achat et de location pour qu'ils soient aussi simples et rapides que possible. De la recherche en ligne à la livraison de votre véhicule, nous nous efforçons de minimiser les démarches administratives pour vous faire gagner du temps.
              </p>
            </div>
          </div>
        </section>

        {/* Nouvelle Section Témoignages */}
        <section className="bg-blue-50 p-8 rounded-xl shadow-lg mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Ce que nos clients disent de nous</h2>
          <div
            className="relative"
            onMouseEnter={() => setPauseTestimonialScroll(true)}
            onMouseLeave={() => setPauseTestimonialScroll(false)}
            onTouchStart={() => setPauseTestimonialScroll(true)}
            onTouchEnd={() => setPauseTestimonialScroll(false)}
          >
            <div
              id="testimonial-carousel"
              ref={testimonialCarouselRef} // Associez la ref
              className="flex overflow-x-hidden space-x-6 pb-4 -mx-4 px-4" // overflow-x-hidden et pas de snap
            >
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="flex-none w-full sm:w-96 bg-white p-6 rounded-lg shadow-md border border-gray-100 flex flex-col justify-between"
                >
                  <p className="text-gray-700 text-lg italic mb-4">
                    " {testimonial.quote} "
                  </p>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">- {testimonial.author}</p>
                    <p className="text-sm text-gray-600">{testimonial.city}</p>
                  </div>
                </div>
              ))}
            </div>
            {testimonials.length > 1 && ( // Affiche les flèches seulement s'il y a plus d'un témoignage
              <>
                <button
                  onClick={() => scrollCarousel(testimonialCarouselRef, 'left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full z-20 hover:bg-opacity-75 transition-colors hidden md:block"
                  aria-label="Témoignage précédent"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={() => scrollCarousel(testimonialCarouselRef, 'right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full z-20 hover:bg-opacity-75 transition-colors hidden md:block"
                  aria-label="Témoignage suivant"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>
        </section>

        {/* About Us Section */}
        <section className="bg-gray-100 p-8 rounded-xl shadow-lg mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">À Propos de Vroum-Auto</h2>
          <div className="max-w-3xl mx-auto text-center text-gray-700 text-lg leading-relaxed">
            <p className="mb-4">
              Bienvenue chez Vroum-Auto, votre partenaire de confiance pour l'achat et la location de véhicules de qualité supérieure en Côte d'Ivoire. Fondée sur les principes de la transparence, de l'intégrité et de la satisfaction client, notre mission est de révolutionner votre expérience automobile.
            </p>
            <p className="mb-4">
              Nous comprenons que l'acquisition ou la location d'un véhicule est une décision importante. C'est pourquoi nous nous engageons à vous offrir une sélection rigoureuse de voitures neuves et d'occasion, toutes inspectées et certifiées pour répondre aux plus hauts standards de sécurité et de performance. Que vous soyez un particulier à la recherche de la voiture familiale idéale, un professionnel ayant besoin d'un véhicule robuste pour vos activités, ou un touriste désirant explorer la Côte d'Ivoire en toute liberté, Vroum-Auto a la solution adaptée à vos besoins et à votre budget.
            </p>
            <p className="mb-4">
              Notre équipe d'experts passionnés est à votre écoute pour vous conseiller et vous accompagner à chaque étape, de la sélection du véhicule à la finalisation des démarches administratives. Nous nous efforçons de rendre le processus simple, rapide et agréable, en vous garantissant une expérience sans tracas.
            </p>
            <p>
              Faites confiance à Vroum-Auto pour trouver le véhicule de vos rêves et profitez d'un service client exceptionnel qui va au-delà de vos attentes. Votre satisfaction est notre plus grande récompense.
            </p>
            <button
              onClick={() => navigateTo('about')}
              className="mt-6 bg-purple-600 text-white px-8 py-3 rounded-full hover:bg-purple-700 transition-colors duration-300 text-lg font-semibold shadow-md transform hover:scale-105"
            >
              En savoir plus
            </button>
          </div>
        </section>
      </div> {/* Fin du conteneur pour le reste du contenu */}
    </div>
  );
};

export default HomePage;
