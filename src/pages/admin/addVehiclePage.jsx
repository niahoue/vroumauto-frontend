// src/pages/admin/AddVehiclePage.jsx
import React, { useState, useContext } from 'react'; // Ajout de useContext
import { Loader2, PlusCircle, XCircle } from 'lucide-react';
import { UserContext } from '../../context/userContext'; // Importez UserContext
import { makeAuthenticatedRequest } from '../../utils/api'; // Importez makeAuthenticatedRequest

const AddVehiclePage = ({ navigateTo, showModal }) => {
  const { userToken, logout } = useContext(UserContext); // Obtenez userToken et logout du contexte

  const [formData, setFormData] = useState({
    name: '',
    type: 'buy', // Valeur par défaut
    brand: '',
    model: '',
    year: '',
    mileage: '',
    fuel: 'Essence', // Valeur par défaut
    price: '',
    dailyRate: '',
    passengers: '',
    description: '',
    images: [], // Pour stocker les URLs Base64 des images
    specs: {}, // Pour les spécifications dynamiques
    coverImageIndex: 0, // Index de l'image de couverture
    isFeatured: false, // Nouveau champ pour "en vedette"
  });

  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]); // Pour afficher les aperçus des images sélectionnées

  // API_BASE_URL n'est plus nécessaire ici si makeAuthenticatedRequest est utilisé

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setLocalError(null); // Réinitialise les erreurs locales
  };

  const handleSpecChange = (e, key) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      specs: {
        ...prev.specs,
        [key]: value
      }
    }));
  };

  const handleAddSpec = () => {
    const newKey = prompt("Entrez le nom de la nouvelle spécification (ex: Couleur, Transmission):");
    if (newKey && !formData.specs[newKey]) {
      setFormData(prev => ({
        ...prev,
        specs: {
          ...prev.specs,
          [newKey]: ''
        }
      }));
    } else if (newKey) {
      showModal('Erreur', 'Cette spécification existe déjà.', 'error');
    }
  };

  const handleRemoveSpec = (keyToRemove) => {
    setFormData(prev => {
      const newSpecs = { ...prev.specs };
      delete newSpecs[keyToRemove];
      return { ...prev, specs: newSpecs };
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newImagePreviews = [];
    const newBase64Images = [];

    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          newImagePreviews.push(reader.result); // Base64 pour l'aperçu
          newBase64Images.push(reader.result);  // Base64 pour l'envoi au backend

          // Une fois que toutes les images sont lues, mettez à jour l'état
          // Vérifiez si toutes les promesses sont résolues avant de mettre à jour l'état
          // Ceci est une approche simplifiée, pour une robustesse maximale, utiliser Promise.all
          if (newBase64Images.length === files.length) {
            setFormData(prev => ({
              ...prev,
              images: [...prev.images, ...newBase64Images]
            }));
            setImagePreviews(prev => [...prev, ...newImagePreviews]);
            // Si c'est la première image ajoutée, définissez-la comme couverture
            if (prev.images.length === 0 && newBase64Images.length > 0) {
              setFormData(prev => ({ ...prev, coverImageIndex: 0 }));
            }
          }
        };
        reader.readAsDataURL(file);
      } else {
        showModal('Fichier invalide', 'Seules les images sont autorisées.', 'error');
      }
    });
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData(prev => {
      const newImages = prev.images.filter((_, index) => index !== indexToRemove);
      let newCoverImageIndex = prev.coverImageIndex;

      // Si l'image de couverture est supprimée, ajustez l'index
      if (newCoverImageIndex === indexToRemove) {
        newCoverImageIndex = 0; // Définit la première image restante comme couverture
      } else if (newCoverImageIndex > indexToRemove) {
        newCoverImageIndex--; // Décrémente l'index si une image avant est supprimée
      }

      return {
        ...prev,
        images: newImages,
        coverImageIndex: newImages.length > 0 ? newCoverImageIndex : 0 // S'assurer que l'index est valide
      };
    });
    setImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSetCoverImage = (index) => {
    setFormData(prev => ({ ...prev, coverImageIndex: index }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);

    // Validation des champs requis
    const requiredFields = ['name', 'brand', 'model', 'year', 'description'];
    if (formData.type === 'buy') {
      requiredFields.push('mileage', 'price');
    } else { // type === 'rent'
      requiredFields.push('dailyRate', 'passengers');
    }
    requiredFields.push('fuel'); // Le carburant est toujours requis

    for (const field of requiredFields) {
      if (!formData[field] && formData[field] !== 0) { // Vérifie aussi pour 0 qui est une valeur valide pour number
        setLocalError(`Le champ '${field}' est requis.`);
        setLoading(false);
        return;
      }
    }

    if (formData.images.length === 0) {
      setLocalError('Veuillez télécharger au moins une image du véhicule.');
      setLoading(false);
      return;
    }

    // Préparer les données à envoyer
    const vehicleToSend = { ...formData };
    // Convertir les nombres de chaîne en nombre
    vehicleToSend.year = parseInt(vehicleToSend.year);
    if (vehicleToSend.type === 'buy') {
      vehicleToSend.mileage = parseInt(vehicleToSend.mileage);
      vehicleToSend.price = parseInt(vehicleToSend.price);
      delete vehicleToSend.dailyRate; // Supprimer les champs non pertinents
      delete vehicleToSend.passengers;
    } else { // type === 'rent'
      vehicleToSend.dailyRate = parseInt(vehicleToSend.dailyRate);
      vehicleToSend.passengers = parseInt(vehicleToSend.passengers);
      delete vehicleToSend.mileage; // Supprimer les champs non pertinents
      delete vehicleToSend.price;
    }

    try {
      if (!userToken) {
        showModal('Non autorisé', 'Veuillez vous connecter pour ajouter un véhicule.', 'error');
        navigateTo('auth');
        return;
      }

      // Utiliser makeAuthenticatedRequest
      const data = await makeAuthenticatedRequest('/vehicles', 'POST', vehicleToSend, userToken);

      showModal('Véhicule Ajouté', 'Le nouveau véhicule a été ajouté avec succès !', 'success');
      // Optionnel: Réinitialiser le formulaire ou rediriger
      setFormData({
        name: '', type: 'buy', brand: '', model: '', year: '', mileage: '', fuel: 'Essence',
        price: '', dailyRate: '', passengers: '', description: '', images: [], specs: {},
        coverImageIndex: 0,
        isFeatured: false, // Réinitialiser aussi isFeatured
      });
      setImagePreviews([]);
      navigateTo('manage-vehicles'); // Rediriger vers la gestion des véhicules

    } catch (apiError) {
      console.error('Erreur lors de l\'ajout du véhicule:', apiError);
      setLocalError(apiError.message || 'Erreur réseau ou serveur. Veuillez réessayer.');
      showModal('Erreur d\'Ajout', apiError.message || 'Impossible d\'ajouter le véhicule.', 'error');
      // Si l'erreur est liée à l'authentification, déconnecter l'utilisateur
      if (apiError.message.includes('Non autorisé')) {
        logout();
        navigateTo('auth');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-4xl mx-auto">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-6 text-center">Ajouter un nouveau véhicule</h1>
      <p className="text-gray-600 text-lg mb-8 text-center">
        Remplissez les détails du véhicule pour l'ajouter à votre inventaire.
      </p>

      {localError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Erreur !</strong>
          <span className="block sm:inline"> {localError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type de Véhicule */}
        <div>
          <label htmlFor="type" className="block text-gray-700 text-sm font-bold mb-2">Type de Véhicule</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          >
            <option value="buy">À Vendre</option>
            <option value="rent">À Louer</option>
          </select>
        </div>

        {/* Champs Généraux */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Nom du Véhicule</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Ex: Mercedes C200" required className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" disabled={loading} />
          </div>
          <div>
            <label htmlFor="brand" className="block text-gray-700 text-sm font-bold mb-2">Marque</label>
            <input type="text" id="brand" name="brand" value={formData.brand} onChange={handleChange} placeholder="Ex: Mercedes-Benz" required className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" disabled={loading} />
          </div>
          <div>
            <label htmlFor="model" className="block text-gray-700 text-sm font-bold mb-2">Modèle</label>
            <input type="text" id="model" name="model" value={formData.model} onChange={handleChange} placeholder="Ex: Classe C" required className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" disabled={loading} />
          </div>
          <div>
            <label htmlFor="year" className="block text-gray-700 text-sm font-bold mb-2">Année</label>
            <input type="number" id="year" name="year" value={formData.year} onChange={handleChange} placeholder="Ex: 2020" required className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" disabled={loading} />
          </div>
          <div>
            <label htmlFor="fuel" className="block text-gray-700 text-sm font-bold mb-2">Carburant</label>
            <select id="fuel" name="fuel" value={formData.fuel} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" disabled={loading}>
              <option value="Essence">Essence</option>
              <option value="Diesel">Diesel</option>
              <option value="Électrique">Électrique</option>
              <option value="Hybride">Hybride</option>
              <option value="Autre">Autre</option>
            </select>
          </div>
        </div>

        {/* Champs spécifiques au type */}
        {formData.type === 'buy' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="mileage" className="block text-gray-700 text-sm font-bold mb-2">Kilométrage (km)</label>
              <input type="number" id="mileage" name="mileage" value={formData.mileage} onChange={handleChange} placeholder="Ex: 50000" required={formData.type === 'buy'} className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" disabled={loading} />
            </div>
            <div>
              <label htmlFor="price" className="block text-gray-700 text-sm font-bold mb-2">Prix (FCFA)</label>
              <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} placeholder="Ex: 15000000" required={formData.type === 'buy'} className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" disabled={loading} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="dailyRate" className="block text-gray-700 text-sm font-bold mb-2">Tarif Journalier (FCFA)</label>
              <input type="number" id="dailyRate" name="dailyRate" value={formData.dailyRate} onChange={handleChange} placeholder="Ex: 25000" required={formData.type === 'rent'} className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" disabled={loading} />
            </div>
            <div>
              <label htmlFor="passengers" className="block text-gray-700 text-sm font-bold mb-2">Nombre de Passagers</label>
              <input type="number" id="passengers" name="passengers" value={formData.passengers} onChange={handleChange} placeholder="Ex: 5" required={formData.type === 'rent'} className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" disabled={loading} />
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description</label>
          <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="Description détaillée du véhicule..." required className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-y" disabled={loading}></textarea>
        </div>

        {/* Section Images */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Images du Véhicule</label>
          <input
            type="file"
            id="images"
            name="images"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            disabled={loading}
          />
          <p className="text-sm text-gray-500 mt-2">Format: JPG, PNG, GIF. Taille max: 5MB par image.</p>

          {imagePreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {imagePreviews.map((src, index) => (
                <div key={index} className="relative group border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  <img src={src} alt={`Aperçu ${index + 1}`} className="w-full h-24 object-cover" />
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="text-red-400 hover:text-red-600 p-1 rounded-full bg-white bg-opacity-75 mx-1"
                      title="Supprimer l'image"
                      disabled={loading}
                    >
                      <XCircle size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetCoverImage(index)}
                      className={`text-green-400 hover:text-green-600 p-1 rounded-full bg-white bg-opacity-75 mx-1 ${formData.coverImageIndex === index ? 'ring-2 ring-green-500' : ''}`}
                      title="Définir comme image de couverture"
                      disabled={loading}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    </button>
                  </div>
                  {formData.coverImageIndex === index && (
                    <span className="absolute top-1 right-1 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">Couverture</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Case à cocher "En Vedette" (Nouveau champ) */}
        <div className="flex items-center mt-4">
          <input
            type="checkbox"
            id="isFeatured"
            name="isFeatured"
            checked={formData.isFeatured}
            onChange={handleChange}
            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={loading}
          />
          <label htmlFor="isFeatured" className="ml-2 block text-gray-900 text-lg font-medium">
            Marquer comme "En Vedette" sur la page d'accueil
          </label>
        </div>


        {/* Spécifications Dynamiques */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Spécifications Additionnelles</label>
          {Object.entries(formData.specs).map(([key, value]) => (
            <div key={key} className="flex items-center space-x-3 mb-3">
              <input
                type="text"
                value={key}
                readOnly
                className="flex-1 p-3 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                disabled={loading}
              />
              <input
                type="text"
                value={value}
                onChange={(e) => handleSpecChange(e, key)}
                placeholder="Valeur de la spécification"
                className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => handleRemoveSpec(key)}
                className="text-red-500 hover:text-red-700"
                title="Supprimer cette spécification"
                disabled={loading}
              >
                <XCircle size={24} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddSpec}
            className="mt-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors duration-200 flex items-center"
            disabled={loading}
          >
            <PlusCircle size={20} className="mr-2" /> Ajouter une spécification
          </button>
        </div>

        {/* Bouton de Soumission */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-lg text-lg font-semibold transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="animate-spin h-5 w-5 mr-3" />
          ) : (
            'Ajouter le véhicule'
          )}
        </button>
      </form>
    </div>
  );
};

export default AddVehiclePage;
