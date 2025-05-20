// components/PlacesAutocompleteMobile.tsx
import React from 'react';
import { View } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

export default function PlacesAutocompleteMobile({
  placeholder,
  initialValue,
  apiKey,
  onPlaceSelected,
}: {
  placeholder: string;
  initialValue: string;
  apiKey: string;
  onPlaceSelected: (place: {
    address: string;
    lat: number;
    lng: number;
  }) => void;
}) {
  return (
    <View style={{ marginBottom: 10 }}>
      <GooglePlacesAutocomplete
        placeholder={placeholder}
        fetchDetails
        enablePoweredByContainer={false}
        onPress={(data, details = null) => {
          if (!details || !details.geometry) return;
          onPlaceSelected({
            address: details.formatted_address || data.description,
            lat: details.geometry.location.lat,
            lng: details.geometry.location.lng,
          });
        }}
        query={{
          key: apiKey,
          language: 'en',
        }}
        textInputProps={{
          defaultValue: initialValue,
        }}
        styles={{
          textInput: {
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 12,
            borderRadius: 6,
          },
        }}
      />
    </View>
  );
}
