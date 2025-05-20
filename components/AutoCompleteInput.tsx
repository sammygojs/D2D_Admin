import React, { useRef } from 'react';
import { Platform, TextInput, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { GOOGLE_API_KEY } from '../constants/google';

export default function AutocompleteInput({
  placeholder = 'Search location',
  initialValue = '',
  onPlaceSelected,
}: {
  placeholder?: string;
  initialValue?: string;
  onPlaceSelected: (place: { address: string }) => void;
}) {
  const webRef = useRef(null);

  if (Platform.OS === 'web') {
    return (
      <TextInput
        placeholder={placeholder}
        defaultValue={initialValue}
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 12,
          borderRadius: 6,
          marginBottom: 10,
          backgroundColor: '#fff',
          zIndex: 10,
        }}
        onChangeText={(text) => onPlaceSelected({ address: text })}
      />
    );
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body { margin: 0; padding: 0; }
          input {
            width: 100%;
            padding: 10px;
            font-size: 16px;
            border-radius: 4px;
            border: 1px solid #ccc;
          }
        </style>
        <script src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places"></script>
      </head>
      <body>
        <input id="autocomplete" placeholder="${placeholder}" />
        <script>
          const input = document.getElementById("autocomplete");
          const autocomplete = new google.maps.places.Autocomplete(input);
          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (place && place.formatted_address) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                address: place.formatted_address
              }));
            }
          });
        </script>
      </body>
    </html>
  `;

  return (
    <View style={{ height: 100, marginBottom: 10, zIndex: 999, position: 'relative', elevation: 10 }}>
      <WebView
        ref={webRef}
        originWhitelist={['*']}
        javaScriptEnabled
        source={{ html: htmlContent }}
        onMessage={(event) => {
          const data = JSON.parse(event.nativeEvent.data);
          onPlaceSelected(data);
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
          elevation: 10,
          backgroundColor: 'transparent',
        }}
      />
    </View>
  );
}
