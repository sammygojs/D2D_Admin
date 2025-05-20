import React, { useRef } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

export default function UnifiedPlacesAutocomplete({
  placeholder,
  initialValue,
  onPlaceSelected,
}: {
  placeholder: string;
  initialValue: string;
  onPlaceSelected: (place: { address: string }) => void;
}) {
  const webRef = useRef(null);

  const injectedJS = `
    const input = document.getElementById("autocomplete");
    input.value = "${initialValue}";
    const autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place && place.formatted_address) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          address: place.formatted_address
        }));
      }
    });
  `;

  return (
    <View style={{ height: 60, marginBottom: 10, zIndex: 999 }}>
      <WebView
        ref={webRef}
        originWhitelist={['*']}
        javaScriptEnabled
        injectedJavaScript={injectedJS}
        onMessage={(event) => {
          const data = JSON.parse(event.nativeEvent.data);
          onPlaceSelected(data);
        }}
        source={{
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDnFzMr6sqgcsWUrMaS5fa8ooi7-A9EAWw&libraries=places"></script>
              </head>
              <body>
                <input id="autocomplete" placeholder="${placeholder}" type="text" style="width: 100%; padding: 10px; font-size: 16px;" />
              </body>
            </html>
          `,
        }}
      />
    </View>
  );
}
