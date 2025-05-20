import { Loader } from '@googlemaps/js-api-loader';
import React, { useEffect, useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';

export default function PlacesAutocompleteWeb({
    apiKey,
    placeholder,
    initialValue,
    onPlaceSelected,
}: {
    apiKey: string;
    placeholder: string;
    initialValue: string;
    onPlaceSelected: (place: {
        address: string;
        lat: number;
        lng: number;
    }) => void;
}) {

    const inputRef = useRef<any>(null);
    const [address, setAddress] = useState(initialValue || '');
    const [sdkLoaded, setSdkLoaded] = useState(false);

    useEffect(() => {
        const loader = new Loader({
            apiKey,
            libraries: ['places'],
        });

        loader
            .load()
            .then(() => {
                if (window.google?.maps?.places && inputRef.current) {
                    const autocomplete = new window.google.maps.places.Autocomplete(
                        inputRef.current,
                        { types: ['geocode'] }
                    );

                    autocomplete.addListener('place_changed', () => {
                        const place = autocomplete.getPlace();
                        if (!place.geometry) return;

                        onPlaceSelected({
                            address: place.formatted_address,
                            lat: place.geometry.location.lat(),
                            lng: place.geometry.location.lng(),
                        });
                        setAddress(place.formatted_address || '');
                    });

                    setSdkLoaded(true);
                } else {
                    console.warn('Google Maps Places API not available.');
                }
            })
            .catch((err) => {
                console.error('Google Maps SDK load error:', err);
            });
    }, []);

    return (
        <View style={{ width: '100%', marginBottom: 10 }}>
            <TextInput
                ref={inputRef}
                placeholder={placeholder}
                style={{
                    borderWidth: 1,
                    borderColor: '#ccc',
                    padding: 12,
                    borderRadius: 6,
                }}
                value={address}
                onChangeText={text => setAddress(text)}
                editable={sdkLoaded}
            />
            {!sdkLoaded && (
                <Text style={{ color: 'gray', fontSize: 12 }}>
                    Loading Google Autocomplete…
                </Text>
            )}
        </View>
    );
}
