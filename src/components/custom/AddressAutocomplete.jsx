import React from 'react';
import {
  GeoapifyGeocoderAutocomplete,
  GeoapifyContext,
} from '@geoapify/react-geocoder-autocomplete';
import '@geoapify/geocoder-autocomplete/styles/minimal.css';

const AddressAutocomplete = ({ onPlaceSelect }) => {
  const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;

  if (!apiKey) {
    return (
      <div className="w-full h-14 rounded-2xl border-2 border-dashed border-border flex items-center justify-center text-sm text-muted-foreground">
        Geoapify API key not configured
      </div>
    );
  }

  return (
    <div className="autocomplete-container">
      <GeoapifyContext apiKey={apiKey}>
        <GeoapifyGeocoderAutocomplete
          placeholder="Search destinations, cities, countries..."
          placeSelect={onPlaceSelect}
        />
      </GeoapifyContext>
    </div>
  );
};

export default AddressAutocomplete;
