// src/components/AddressAutocomplete.jsx

import React from 'react';
import {
  GeoapifyGeocoderAutocomplete,
  GeoapifyContext,
} from '@geoapify/react-geocoder-autocomplete';
import '@geoapify/geocoder-autocomplete/styles/minimal.css';

const AddressAutocomplete = ({ onPlaceSelect }) => {
  const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;

  if (!apiKey) {
    console.error("Geoapify API key is missing.");
    return <div>API Key is not configured.</div>;
  }

  // We only need a simple, clean className for our container div.
  // All the complex styling will now live in your CSS file.
  return (
    <div className="autocomplete-container">
      <GeoapifyContext apiKey={apiKey}>
        <GeoapifyGeocoderAutocomplete
          placeholder="Enter your destination"
          placeSelect={onPlaceSelect}
        />
      </GeoapifyContext>
    </div>
  );
};

export default AddressAutocomplete;